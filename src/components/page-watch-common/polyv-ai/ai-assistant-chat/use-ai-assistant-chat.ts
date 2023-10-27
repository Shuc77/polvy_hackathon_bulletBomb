import { computed, nextTick, onBeforeMount, onMounted, ref, set, unref, watch } from 'vue';

import { wait } from '@/assets/utils/utils';
import { translate } from '@/assets/lang';

import { MsgInputWrapInstance } from '@/components/page-watch-common/msg-input-wrap/use-msg-input-wrap';
import { PlvInputContent } from '@/plugins/polyv-ui/types';
import { getWatchCore } from '@/core/watch-sdk';
import {
  PolyvAIAssistantChatMsgSource,
  PolyvAIAssistantChatMsgType,
  PolyvAIAssistantChatStatus,
  PolyvAIEvents,
  PolyvAIEventsRelations,
} from '@polyv/live-watch-sdk';
import { usePolyvAIStore } from '@/store/use-polyv-ai-store';
import { TAB_NAME_AI_ASSISTANT } from '@/assets/constants/tab-name';
import { useLayoutStore } from '@/store/use-layout-store';
import { AIAssistantChatMsgListInstanceType } from './ai-assistant-chat-msg-list/use-ai-assistant-chat-msg-list';

/**
 * AI 助手答疑 hook
 * @hook
 */
export const useAIAssistantChat = () => {
  const polyvAIStore = usePolyvAIStore();
  const layoutStore = useLayoutStore();

  /** 消息列表 */
  const msgListRef = ref<AIAssistantChatMsgListInstanceType>();

  // 切到 Tab 时自动滚到最底部
  watch(
    () => [layoutStore.mobileMenuCurrentName, layoutStore.pcAsideTabCurrentName],
    () => {
      if (
        layoutStore.mobileMenuCurrentName === TAB_NAME_AI_ASSISTANT ||
        layoutStore.pcAsideTabCurrentName === TAB_NAME_AI_ASSISTANT
      ) {
        msgListRef.value?.scrollToBottom();
      }
    },
  );

  /** 消息输入框 */
  const msgInputWrapRef = ref<MsgInputWrapInstance>();

  const AIAssistantChatMsgList = ref<PolyvAIAssistantChatMsgType[]>([]);

  const AIAssistantChatMsgRenderList = computed(() => {
    const list = [...unref(AIAssistantChatMsgList)];
    const placeholderMsg: PolyvAIAssistantChatMsgType = {
      group: 'placeholder',
      msgSource: PolyvAIAssistantChatMsgSource.Answer,
      content: translate('ai.hello'),
      user: {
        userId: String(polyvAIStore.AIAssistantConfig.aiAssistantId),
        nick: polyvAIStore.AIAssistantConfig.aiAssistantName,
      },
    };
    list.unshift(placeholderMsg);

    return list;
  });

  async function getAIAssistantChatHistory() {
    const watchCore = getWatchCore();
    AIAssistantChatMsgList.value = await watchCore.polyvAI.getAIAssistantChatHistory();

    await nextTick();
    msgListRef.value?.recordFirstElem();
  }

  const AIAssistantInputPlaceholder = computed(() => translate('ai.input.placeholder'));

  async function onSubmitMessage({ contentList }: { contentList: PlvInputContent[] }) {
    if (!msgInputWrapRef.value) return;
    // 单次只能发送一条消息，避免
    if (polyvAIStore.AIAssistantChatStatus === PolyvAIAssistantChatStatus.Replaying) return;

    msgInputWrapRef.value.clearInput();
    msgInputWrapRef.value.resetStatus();

    const watchCore = getWatchCore();

    for await (const message of contentList) {
      if (message.type === 'text') {
        watchCore.polyvAI.sendAIQuestionMsg({ content: message.content });
      }
      await wait(200);
    }
  }

  function onAIAssistantChatStatusChange(
    evt: PolyvAIEventsRelations[PolyvAIEvents.AIAssistantChatStatusChange],
  ) {
    polyvAIStore.$patch({
      AIAssistantChatStatus: evt.status,
    });
  }

  function onAIAssistantChatMessage(
    evt: PolyvAIEventsRelations[PolyvAIEvents.AIAssistantChatMessage],
  ) {
    AIAssistantChatMsgList.value.push(evt.AIChatMsg);
    msgListRef.value?.checkScrollToBottom();
  }

  function onReplaceAIAssistantChatMessage(
    evt: PolyvAIEventsRelations[PolyvAIEvents.ReplaceAIAssistantChatMessage],
  ) {
    const existIndex = AIAssistantChatMsgList.value.findIndex(msg => msg.id === evt.id);
    if (existIndex !== -1) {
      const replacedMsg = evt.AIChatMsg;
      if (evt.AIAssistantChatStatus === PolyvAIAssistantChatStatus.Busy) {
        replacedMsg.content = translate('ai.busy');
      }
      set(AIAssistantChatMsgList.value, existIndex, replacedMsg);
      msgListRef.value?.checkScrollToBottom();
    }
  }

  function unlistenPolyvAIModuleEvent() {
    const watchCore = getWatchCore();

    watchCore.polyvAI.eventEmitter.off(
      PolyvAIEvents.AIAssistantChatStatusChange,
      onAIAssistantChatStatusChange,
    );
    watchCore.polyvAI.eventEmitter.off(
      PolyvAIEvents.AIAssistantChatMessage,
      onAIAssistantChatMessage,
    );
    watchCore.polyvAI.eventEmitter.off(
      PolyvAIEvents.ReplaceAIAssistantChatMessage,
      onReplaceAIAssistantChatMessage,
    );
  }

  function listenPolyvAIModuleEvent() {
    unlistenPolyvAIModuleEvent();

    const watchCore = getWatchCore();

    watchCore.polyvAI.eventEmitter.on(
      PolyvAIEvents.AIAssistantChatStatusChange,
      onAIAssistantChatStatusChange,
    );
    watchCore.polyvAI.eventEmitter.on(
      PolyvAIEvents.AIAssistantChatMessage,
      onAIAssistantChatMessage,
    );
    watchCore.polyvAI.eventEmitter.on(
      PolyvAIEvents.ReplaceAIAssistantChatMessage,
      onReplaceAIAssistantChatMessage,
    );
  }

  onMounted(async () => {
    await getAIAssistantChatHistory();
    listenPolyvAIModuleEvent();

    await nextTick();
    msgListRef.value?.scrollToBottom();
  });

  onBeforeMount(() => {
    unlistenPolyvAIModuleEvent();
  });

  return {
    msgListRef,
    msgInputWrapRef,

    AIAssistantChatMsgRenderList,

    AIAssistantInputPlaceholder,
    onSubmitMessage,
  };
};
