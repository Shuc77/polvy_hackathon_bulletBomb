import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { computed, nextTick, onBeforeUnmount, onMounted, Ref, ref, unref } from 'vue';

import { AskEvents, AskMsgType, ChatMsgSource, ChatMsgSpeakType } from '@polyv/live-watch-sdk';
import { uuidV4 } from '@utils-ts/string';

import { useAskStore } from '@/store/use-ask-store';
import { AskMsgListInstance } from '../ask-msg-list/use-ask-msg-list';

export interface UseAskOptions {
  askMsgListRef: Ref<AskMsgListInstance | undefined>;
}

export const useAsk = (options: UseAskOptions) => {
  const { askMsgListRef } = options;

  const channelStore = useChannelStore();
  const askStore = useAskStore();

  const historyStart = ref(0);
  const historyLength = 20;
  const isNoMore = ref(false);

  /** 提问消息列表 */
  const askMsgList = ref<AskMsgType[]>([]);

  /** 默认消息的 id */
  const placeholderMsgId = uuidV4();

  /** 提问是否可以发送图片 */
  const questionImageEnabled = ref(false);

  /** 渲染的消息列表 */
  const askMsgRenderList = computed<AskMsgType[]>(() => {
    const list = [...unref(askMsgList)];

    if (channelStore.teacherInfo) {
      // 插入默认消息
      const placeholderMsg: ChatMsgSpeakType = {
        id: placeholderMsgId,
        time: Date.now(),
        msgSource: ChatMsgSource.Speak,
        user: channelStore.teacherInfo,
        content: askStore.askWelcomeText,
      };
      list.unshift(placeholderMsg);
    }

    return list;
  });

  /** 获取提问消息列表 */
  async function getAskMsgList() {
    if (isNoMore.value) {
      return;
    }
    const watchCore = getWatchCore();
    const start = unref(historyStart);
    const end = unref(historyStart) + historyLength - 1;
    const result = await watchCore.ask.getAskHistory({
      start,
      end,
    });

    historyStart.value = end + 1;
    isNoMore.value = result.isEnd;
    const list = result.askMsgList;
    askMsgList.value = [...list, ...askMsgList.value];

    const askMsgListInstance = unref(askMsgListRef);
    if (start === 0) {
      askMsgListInstance?.scrollToBottom();
    } else {
      await askMsgListInstance?.scrollToFirstRecord();
    }

    await nextTick();
    askMsgListInstance?.recordFirstElem();
  }

  onMounted(() => {
    getAskMsgList();
    const watchCore = getWatchCore();
    const askSetting = watchCore.ask.getAskSetting();
    questionImageEnabled.value = askSetting.questionImageEnabled;
  });

  /** 处理提问相关事件 */
  function onAskEvent(evt: { askMsg: AskMsgType }) {
    askMsgList.value.push(evt.askMsg);
    const askMsgListInstance = unref(askMsgListRef);
    askMsgListInstance?.checkScrollToBottom();
  }

  function bindAskEvent() {
    const watchCore = getWatchCore();
    watchCore.ask.eventEmitter.on(AskEvents.StudentQuestion, onAskEvent);
    watchCore.ask.eventEmitter.on(AskEvents.TeacherAnswer, onAskEvent);
    watchCore.ask.eventEmitter.on(AskEvents.SystemMessage, onAskEvent);
  }

  function unbindAskEvent() {
    const watchCore = getWatchCore();
    watchCore.ask.eventEmitter.off(AskEvents.StudentQuestion, onAskEvent);
    watchCore.ask.eventEmitter.off(AskEvents.TeacherAnswer, onAskEvent);
    watchCore.ask.eventEmitter.off(AskEvents.SystemMessage, onAskEvent);
  }

  onMounted(() => {
    bindAskEvent();
  });
  onBeforeUnmount(() => {
    unbindAskEvent();
  });

  return {
    askMsgListRef,
    askMsgList,
    askMsgRenderList,
    getAskMsgList,
    questionImageEnabled,
  };
};

/**
 * 提问新消息提醒 hook
 */
export const useAskReminder = (hookOptions: { onAskMsg: () => void }) => {
  const { onAskMsg } = hookOptions;
  const askStore = useAskStore();

  /** 提问消息红点提示是否可见 */
  const askReminderVisible = computed(() => {
    return askStore.askReminderVisible;
  });

  /** 更新提问新消息提醒可见状态 */
  function updateAskReminderVisible(visible: boolean) {
    askStore.$patch({
      askReminderVisible: visible,
    });
  }

  /**
   * 监听聊天室消息
   */
  function listenAskMsg() {
    unlistenAskMsg();
    const watchCore = getWatchCore();
    watchCore.ask.eventEmitter.on(AskEvents.TeacherAnswer, onAskMsg);
    watchCore.ask.eventEmitter.on(AskEvents.StudentQuestion, onAskMsg);
  }

  function unlistenAskMsg() {
    const watchCore = getWatchCore();
    watchCore.ask.eventEmitter.off(AskEvents.TeacherAnswer, onAskMsg);
    watchCore.ask.eventEmitter.off(AskEvents.StudentQuestion, onAskMsg);
  }

  onMounted(() => {
    listenAskMsg();
  });

  onBeforeUnmount(() => {
    unlistenAskMsg();
  });

  return {
    askReminderVisible,
    updateAskReminderVisible,
  };
};

export const useAskSdk = () => {
  const watchCore = getWatchCore();
  const askSdk = watchCore.ask.getAskSdk();

  onMounted(() => {
    askSdk.setup();
  });

  return {
    askSdk,
  };
};
