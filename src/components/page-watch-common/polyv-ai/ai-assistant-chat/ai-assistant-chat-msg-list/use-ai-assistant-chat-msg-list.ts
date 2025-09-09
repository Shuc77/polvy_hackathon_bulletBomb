import { PropUtils, emitFunc, VueEmit } from '@polyv/vue-components';

import { ScrollListInstance, useScrollList } from '@/hooks/behaviors/use-scroll-list';

import { PolyvAIAssistantChatMsgType } from '@polyv/live-watch-sdk';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AIAssistantChatMsgListInstanceType extends ScrollListInstance {}

export const AIAssistantChatMsgProps = () => ({
  /** 消息列表 */
  msgList: PropUtils.array<PolyvAIAssistantChatMsgType>().isRequired,
});

export const AIAssistantChatMsgListEmit = () => ({
  'near-top': emitFunc<void>(),
});

export const useAIAssistantChatMsgList = (options: {
  emit: VueEmit<typeof AIAssistantChatMsgListEmit>;
}) => {
  const { emit } = options;

  const { scrollRef, scrollListInstance, onScrollEvent } = useScrollList({
    firstElemIndex: 1,
    nearTopCallback: () => {
      emit('near-top');
    },
  });

  const AIAssistantChatMsgListInstance: AIAssistantChatMsgListInstanceType = scrollListInstance;

  return {
    scrollRef,
    AIAssistantChatMsgListInstance,
    onScrollEvent,
  };
};
