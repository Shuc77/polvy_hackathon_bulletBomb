import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { RenderPosition } from '@just4/virtual-list/types';
import { ChatEvents, ChatMsgSource, ChatMsgType } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted } from 'vue';
import { useContractHistory, useContractQueue } from './contract-history-hook';
import { useFilterRepeatMsgHook, useFilterSpecialMsgHook } from './filter-chat-msg-hook';
import { ChatMsgListHookOptions } from './types';
import { plvInterval } from '@/assets/utils/utils';

export const useRenderMsgQueue = () => {
  const chatMsgStore = useChatMsgStore();

  let renderQueue: ChatMsgType[] = [];

  /**
   * 限制存储最大值
   */
  const maxLimitCount = 300;

  /**
   * 保存队列数量
   */
  const saveQueueCount = 200;

  /**
   * 默认出队数量
   */
  const defaultPopCount = 5;

  function pushRenderQueueData(data: ChatMsgType[]) {
    // 新增消息时同步压缩一遍队列
    contractRenderQueue();
    renderQueue = renderQueue.concat(data);
  }

  function popRenderQueueData() {
    const data = renderQueue.splice(0, defaultPopCount);
    // 此处需要删掉索引，不然压缩历史消息的时候会被找到对应的消息，设置了 RealStartIndex，导致无法保持在底部查阅消息
    for (let i = 0; i < data.length; i++) {
      chatMsgStore.deleteRealIndexById(data[i].id);
    }
    return data;
  }

  /**
   * 压缩队列消息
   */
  function contractRenderQueue() {
    const length = renderQueue.length;
    if (length <= maxLimitCount) {
      return;
    }

    const sliceStart = length - saveQueueCount;
    const sliceEnd = length;

    const newMsgQueue = renderQueue.slice(sliceStart, sliceEnd);
    for (let i = 0; i < sliceStart; i++) {
      chatMsgStore.deleteRealIndexById(renderQueue[i].id);
    }

    renderQueue = newMsgQueue;
  }

  function getRenderQueueData() {
    return renderQueue;
  }

  return {
    getRenderQueueData,

    pushRenderQueueData,
    popRenderQueueData,

    contractRenderQueue,
  };
};

export const useChatMsgQueue = (hookOptions: ChatMsgListHookOptions) => {
  const { getWatchCore } = useGlobalInject();

  const chatStore = useChatStore();
  const chatMsgStore = useChatMsgStore();
  const playbackStore = usePlaybackStore();

  const { contractHistoryData } = useContractHistory(hookOptions);
  const { contractMsgQueue } = useContractQueue();
  const { isNotSpecialMsg } = useFilterSpecialMsgHook();
  const { filterRepeatMsg } = useFilterRepeatMsgHook(hookOptions);
  const { pushRenderQueueData, popRenderQueueData, contractRenderQueue } = useRenderMsgQueue();

  function __checkInBottom() {
    const container = hookOptions.getContainerElem();

    /** 是否在底部(50为误差值) */
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const isBottom = container.scrollTop + container.clientHeight + 50 >= container.scrollHeight;

    return isBottom;
  }

  let joinTimer: ReturnType<typeof plvInterval> | undefined;

  let renderQueuePolling: ReturnType<typeof plvInterval> | undefined;

  /** 停止渲染队列轮询 */
  function __stopRenderQueuePolling() {
    if (renderQueuePolling) {
      renderQueuePolling.clear();
      renderQueuePolling = undefined;
    }
  }

  /** 开始渲染队列轮询，缓慢往列表添加数据 */
  function __startRenderQueuePolling() {
    __stopRenderQueuePolling();

    renderQueuePolling = plvInterval(() => {
      // 每次轮询时都尝试去压缩渲染队列
      contractRenderQueue();

      const virtualList = hookOptions.getVirtualList();

      // 界面上是否到达底部，如果不在底部，则停止轮询，重置列表状态、顺便压缩一些劣势队列
      if (!__checkInBottom()) {
        __stopRenderQueuePolling();
        virtualList.resetBoundaryState(RenderPosition.Foot);

        contractHistoryData();
        return;
      }

      const queueData = popRenderQueueData();

      // 渲染队列没有数据了，停止轮询
      if (queueData.length === 0) {
        __stopRenderQueuePolling();
      } else {
        // 需要先插入数据后，再渲染
        chatMsgStore.concatHistoryData(queueData, 'tail');
        __addChatMsgItems(queueData);
      }
    }, 300);
  }

  /** 往底部添加聊天消息 */
  function __addChatMsgItems(data: ChatMsgType[]) {
    const virtualList = hookOptions.getVirtualList();
    virtualList.addBoundaryItems(data, RenderPosition.Foot, true);
    chatMsgStore.hideMoreMsg();
  }

  /**
   * 插入一条新消息到队列中
   * @param chatMsg 消息
   */
  function pushWaitMsgQueue(chatMsg: ChatMsgType): void {
    const virtualList = hookOptions.getVirtualList();

    if (chatMsgStore.getRealStartIndex() > 0) {
      if (chatMsgStore.isChatServiceMsg(chatMsg)) {
        chatMsgStore.increaseRealIndex();
      }
      chatMsgStore.showMoreMsg();
      virtualList.resetBoundaryState(RenderPosition.Foot);
      return;
    }

    chatMsgStore.pushMsgQueue(chatMsg);
    contractMsgQueue();

    // 服务端的消息才更新 realIndex
    if (chatMsgStore.isChatServiceMsg(chatMsg)) {
      chatMsgStore.increaseRealIndex();
      chatMsgStore.setRealIndexById(chatMsg.id, 0);
      chatMsgStore.setRealStartIndex(0);
    }

    // 插入到是本地消息
    if (chatMsgStore.isLocalMsg(chatMsg)) {
      // 直接将队列消息插入，不需要延迟
      let addList = chatMsgStore.concatQueueToHistoryData(true);
      contractHistoryData();

      addList = filterRepeatMsg(addList);
      virtualList.addBoundaryItems(addList, RenderPosition.Foot, true);
    }

    checkJoinTimer();
  }

  /**
   * 检查定时器
   */
  function checkJoinTimer() {
    // 消息队列为空，则关闭定时器
    if (chatMsgStore.getMsgQueue().length === 0) {
      removeJoinTimer();
      return;
    }

    // 已有定时器则不再创建
    if (joinTimer) {
      return;
    }

    // 启动定时器用于消息出队进行渲染
    startJoinTimer();
  }

  /**
   * 开启插入定时器
   */
  function startJoinTimer() {
    removeJoinTimer();

    function __popWaitMsgQueue() {
      const msgQueue = chatMsgStore.getMsgQueue();
      const spliceCount = msgQueue.length;

      // 只能通过这种方式，才能在轮询间隔中获取对应的数据
      let renderData = msgQueue.splice(0, spliceCount);
      renderData = filterRepeatMsg(renderData);
      return renderData;
    }

    joinTimer = plvInterval(() => {
      const virtualList = hookOptions.getVirtualList();

      // 每次轮询都尝试去压缩历史数据队列
      contractHistoryData();

      /** 是否到达底部边界 */
      const reachedFoot = virtualList.reachedBoundary(RenderPosition.Foot);
      // 如果还没到达底部边界，界面上展示更多消息按钮
      if (!reachedFoot) {
        chatMsgStore.showMoreMsg();
        virtualList.resetBoundaryState(RenderPosition.Foot);
        return;
      }

      /** 获取需要在底部渲染的数据 */
      const renderData = __popWaitMsgQueue();
      const renderDataLen = renderData.length;

      if (renderDataLen <= chatMsgStore.batchCount) {
        // 渲染数据小于等于一批数据，需要先直接插入历史数据
        chatMsgStore.concatHistoryData(renderData, 'tail');

        // 只有停留在列表底部，才需要渲染
        if (__checkInBottom()) {
          __addChatMsgItems(renderData);
        } else {
          virtualList.resetBoundaryState(RenderPosition.Foot);
        }
      } else {
        // 超过一批数据，需要通过另外一个渲染队列来处理，方便控制渲染速度
        pushRenderQueueData(renderData);
        __startRenderQueuePolling(); // 内部轮询去插入历史数据并渲染
      }

      checkJoinTimer();
    }, 300);
  }

  /**
   * 销毁插入定时器
   */
  function removeJoinTimer() {
    if (joinTimer) {
      joinTimer.clear();
      joinTimer = undefined;
    }
  }

  function onChatMsg(evt: { chatMsg: ChatMsgType }) {
    const chatMsg = evt.chatMsg;

    // 对于仅看主持人，非特殊身份，非自己发言的全部过滤掉
    if (chatStore.onlySpecialMsg && isNotSpecialMsg(chatMsg)) {
      return;
    }

    // 非聊天重放状态下，自己的打赏只接收本地插入的
    if (
      !playbackStore.chatMsgReplayEnabled &&
      chatMsg.msgSource === ChatMsgSource.Reward &&
      chatMsg.isSelf &&
      !chatMsg.isLocal
    ) {
      return;
    }

    pushWaitMsgQueue(chatMsg);
  }

  /**
   * 监听聊天室消息
   */
  function listenChatMsg() {
    unlistenChatMsg();
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMessage, onChatMsg);
  }

  function unlistenChatMsg() {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.off(ChatEvents.ChatMessage, onChatMsg);
  }

  onMounted(() => {
    listenChatMsg();
  });

  onBeforeUnmount(() => {
    removeJoinTimer();
    unlistenChatMsg();
  });

  useEventBusListener(appEvents.chat.JoinMsgQueue, onChatMsg);
};
