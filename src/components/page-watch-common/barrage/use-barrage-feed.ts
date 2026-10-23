/**
 * @file 弹幕喂送
 * @desc 接管 SDK 的自动喂送（`setupBarrage({ autoAdd: false })`），自己从聊天室取消息上屏。
 *
 * 之所以必须接管：
 * 1. 观看页使用 chat v2（`@polyv/chat`）时，SDK 内部的桥接只转发点赞事件，
 *    直播场景的 `ChatMessage` 到不了弹幕模块；
 * 2. 自己发送的消息 `isLocal` 恒为 `true`，会被 SDK 内部的
 *    `__filterBarrageChatMsg(msg, { allowLocal: false })` 丢掉。
 *
 * 接管后这两层过滤都不再经过，但「只看主持人」的过滤需要在这里补回来。
 */
import { useGlobalInject } from '@/app/use-global-inject';
import { useChatStore } from '@/store/use-chat-store';
import { emitBarrageSignal } from '@/components/page-watch-common/barrage-effect/barrage-signal';
import { ChatEvents, ChatMsgSource } from '@polyv/live-watch-sdk';
import type { BarrageTarget } from '@polyv/live-watch-sdk';
import { onBeforeUnmount } from 'vue';

/** 已上屏消息 id 的去重窗口 */
const HANDLED_ID_LIMIT = 300;

/** chatTarget 由聊天室 SDK 异步创建，可能晚于弹幕初始化，未就绪时按此节奏重试 */
const TARGET_RETRY_INTERVAL = 500;
const TARGET_RETRY_LIMIT = 20;

/**
 * 上屏所需的聊天消息字段
 * @desc 不引用 `@polyv/chat` 的运行时类型，该包由外部脚本异步加载，只能做类型引用
 */
interface FeedableChatMsg {
  id?: string;
  msgSource?: string;
  content?: string;
  user?: {
    userId?: string;
    userType?: string;
    actor?: string;
  };
}

/**
 * 弹幕喂送
 * @param getBarrageTarget 获取当前弹幕对象，弹幕重建时会变化
 */
export const useBarrageFeed = (getBarrageTarget: () => BarrageTarget | undefined) => {
  const { getWatchCore, getEmitter } = useGlobalInject();
  const chatStore = useChatStore();

  /** 已上屏的消息 id，用于多数据源去重 */
  const handledIdSet = new Set<string>();
  const handledIdQueue: string[] = [];

  /** 已建立的监听及其取消订阅函数 */
  let unsubscribers: Array<() => void> = [];
  let retryTimer: number | undefined;
  let retryCount = 0;
  let started = false;

  /**
   * 登记消息 id
   * @return 首次出现返回 true，已经处理过返回 false
   */
  function tryMarkHandled(id?: string): boolean {
    if (!id) {
      return true;
    }

    if (handledIdSet.has(id)) {
      return false;
    }

    handledIdSet.add(id);
    handledIdQueue.push(id);

    if (handledIdQueue.length > HANDLED_ID_LIMIT) {
      const oldest = handledIdQueue.shift();
      if (oldest) {
        handledIdSet.delete(oldest);
      }
    }

    return true;
  }

  /**
   * 「只看主持人」过滤
   * @desc 与 `src/core/watch-sdk.ts` 中原拦截器的判定保持一致
   */
  function isFilteredByOnlySpecialMsg(chatMsg: FeedableChatMsg): boolean {
    if (!chatStore.onlySpecialMsg) {
      return false;
    }

    const watchCore = getWatchCore();
    const userId = chatMsg.user?.userId;
    const isSelf = !!userId && watchCore.user.isCurrentUser(userId);

    return (
      !watchCore.user.isSpecialUserType(chatMsg.user?.userType, chatMsg.user?.actor) && !isSelf
    );
  }

  /** 取出可上弹幕的文本，非文本消息暂不上屏 */
  function getBarrageText(chatMsg: FeedableChatMsg): string | undefined {
    if (chatMsg.msgSource === ChatMsgSource.Speak && chatMsg.content) {
      return chatMsg.content;
    }

    return undefined;
  }

  /** 单条消息上屏 */
  function feed(chatMsg?: FeedableChatMsg): void {
    if (!chatMsg) {
      return;
    }

    if (!tryMarkHandled(chatMsg.id)) {
      return;
    }

    if (isFilteredByOnlySpecialMsg(chatMsg)) {
      return;
    }

    const text = getBarrageText(chatMsg);
    if (!text) {
      return;
    }

    const barrageTarget = getBarrageTarget();
    const userId = chatMsg.user?.userId;
    const self = !!userId && getWatchCore().user.isCurrentUser(userId);

    /**
     * 手机端没有 `pc-barrage`：上屏由播放器 SDK 自己处理，这里拿不到 target。
     * 但特效层仍要靠这条信号统计弹幕密度（红蓝对抗、密度触发），
     * 所以信号照发，只有存在自有弹幕层时才额外上屏
     */
    emitBarrageSignal(getEmitter(), text, self);

    barrageTarget?.add({ msg: text, self });
  }

  /**
   * 订阅 chat v2 的消息源
   * @return chatTarget 尚未创建时返回 false
   */
  function subscribeChatTarget(): boolean {
    const chatTarget = getWatchCore().chat.chatTarget;
    if (!chatTarget) {
      return false;
    }

    const { eventEmitter, PolyvChatEvent } = chatTarget;

    const onChatMessage = (data?: { chatMsg?: FeedableChatMsg }) => {
      feed(data?.chatMsg);
    };

    const onSelfSendMessage = (data?: { chatMsg?: FeedableChatMsg }) => {
      // 本地消息先上屏，等服务端回包替换
      feed(data?.chatMsg);
    };

    const onReplaceChatMessage = (data?: { id?: string; chatMsg?: FeedableChatMsg }) => {
      // 本地 id 换成服务端 id：旧 id 已上屏过，这里只登记新 id，避免回显重复上屏
      if (data?.id && handledIdSet.has(data.id)) {
        tryMarkHandled(data.chatMsg?.id);
        return;
      }

      feed(data?.chatMsg);
    };

    eventEmitter.on(PolyvChatEvent.ChatMessage, onChatMessage);
    eventEmitter.on(PolyvChatEvent.SelfSendMessage, onSelfSendMessage);
    eventEmitter.on(PolyvChatEvent.ReplaceChatMessage, onReplaceChatMessage);

    unsubscribers.push(() => {
      eventEmitter.off(PolyvChatEvent.ChatMessage, onChatMessage);
      eventEmitter.off(PolyvChatEvent.SelfSendMessage, onSelfSendMessage);
      eventEmitter.off(PolyvChatEvent.ReplaceChatMessage, onReplaceChatMessage);
    });

    return true;
  }

  /** 订阅 watch SDK 自身的聊天事件（回放消息 + chat v1 兜底） */
  function subscribeWatchChat(): void {
    const { eventEmitter } = getWatchCore().chat;

    const onChatMessage = (data?: { chatMsg?: FeedableChatMsg }) => {
      feed(data?.chatMsg);
    };

    const onSelfSpeak = (data?: { chatMsg?: FeedableChatMsg }) => {
      feed(data?.chatMsg);
    };

    // 回放消息由播放进度驱动，已与视频时间对齐；该事件不依赖后台开关，比 ChatMessage 更可靠
    const onReplaying = (data?: { chatMsg?: FeedableChatMsg }) => {
      feed(data?.chatMsg);
    };

    eventEmitter.on(ChatEvents.ChatMessage, onChatMessage);
    eventEmitter.on(ChatEvents.SelfSpeak, onSelfSpeak);
    eventEmitter.on(ChatEvents.ChatMsgReplaying, onReplaying);

    unsubscribers.push(() => {
      eventEmitter.off(ChatEvents.ChatMessage, onChatMessage);
      eventEmitter.off(ChatEvents.SelfSpeak, onSelfSpeak);
      eventEmitter.off(ChatEvents.ChatMsgReplaying, onReplaying);
    });
  }

  function scheduleTargetRetry(): void {
    if (retryTimer !== undefined || retryCount >= TARGET_RETRY_LIMIT) {
      return;
    }

    retryCount += 1;
    retryTimer = window.setTimeout(() => {
      retryTimer = undefined;

      if (!started) {
        return;
      }

      if (!subscribeChatTarget()) {
        scheduleTargetRetry();
      }
    }, TARGET_RETRY_INTERVAL);
  }

  /** 开始喂送 */
  function start(): void {
    if (started) {
      return;
    }

    started = true;
    subscribeWatchChat();

    if (!subscribeChatTarget()) {
      scheduleTargetRetry();
    }
  }

  /** 停止喂送并清空监听 */
  function stop(): void {
    started = false;
    retryCount = 0;

    if (retryTimer !== undefined) {
      window.clearTimeout(retryTimer);
      retryTimer = undefined;
    }

    unsubscribers.forEach(unsubscribe => unsubscribe());
    unsubscribers = [];
  }

  onBeforeUnmount(stop);

  return {
    start,
    stop,
  };
};
