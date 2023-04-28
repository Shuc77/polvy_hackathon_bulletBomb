import { computed, nextTick, onBeforeUnmount, onMounted, Ref, ref, unref } from 'vue';
import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useChatStore } from '@/store/use-chat-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import {
  AskEvents,
  AskMsgType,
  ChannelMenuType,
  ChatMsgSource,
  ChatMsgSpeakType,
  YN,
} from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { uuidV4 } from '@utils-ts/string';

import { AskMsgListInstance } from '../ask-msg-list/use-ask-msg-list';

export interface UseAskOptions {
  askMsgListRef: Ref<AskMsgListInstance | undefined>;
}

export const useAsk = (options: UseAskOptions) => {
  const { askMsgListRef } = options;

  const channelStore = useChannelStore();
  const channelMenuStore = useChannelMenuStore();

  const { chatInputPlaceholder, chatRoomIsClosed } = storeDefinitionToRefs(useChatStore);

  const historyStart = ref(0);
  const historyLength = 20;
  const isNoMore = ref(false);

  /** 提问消息列表 */
  const askMsgList = ref<AskMsgType[]>([]);

  /** 默认消息的 id */
  const placeholderMsgId = uuidV4();

  /** 输入框默认值 */
  const askInputPlaceholder = computed(() => {
    if (unref(chatRoomIsClosed)) {
      return translate('chat.input.placeholder');
    } else {
      return unref(chatInputPlaceholder);
    }
  });

  /** 提问是否可以发送图片 */
  const questionImageEnabled = computed<boolean>(() => {
    return ynToBool(channelStore.channelDetail?.channelConfig.questionImageEnabled, YN.N);
  });

  /** 渲染的消息列表 */
  const askMsgRenderList = computed<AskMsgType[]>(() => {
    // 提问的菜单数据
    const askMenuData = channelMenuStore.getMenuData(ChannelMenuType.Quiz);
    const content = askMenuData?.content || translate('ask.placeholderMsg');

    // 插入默认消息
    const placeholderMsg: ChatMsgSpeakType = {
      id: placeholderMsgId,
      time: Date.now(),
      msgSource: ChatMsgSource.Speak,
      user: channelStore.teacherInfo,
      content,
    };

    return [placeholderMsg, ...unref(askMsgList)];
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
  }

  function unbindAskEvent() {
    const watchCore = getWatchCore();
    watchCore.ask.eventEmitter.off(AskEvents.StudentQuestion, onAskEvent);
    watchCore.ask.eventEmitter.off(AskEvents.TeacherAnswer, onAskEvent);
  }

  onMounted(() => {
    bindAskEvent();
  });
  onBeforeUnmount(() => {
    unbindAskEvent();
  });

  return {
    askInputPlaceholder,
    askMsgListRef,
    askMsgList,
    askMsgRenderList,
    getAskMsgList,
    questionImageEnabled,
  };
};
