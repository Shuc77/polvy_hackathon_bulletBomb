import { VueProps } from '@polyv/vue-components';
import { PolyvAIAssistantChatMsgSource } from '@polyv/live-watch-sdk';
import { computed } from 'vue';
import {
  AIAssistantMsgItemCommonProps,
  useAIAssistantMsgProvide,
  AIAssistantMsgContext,
} from './_hooks/use-ai-assistant-msg-common';

export const useAIAssistantChatMsgItem = (options: {
  props: VueProps<typeof AIAssistantMsgItemCommonProps>;
}) => {
  const injectCtx = computed<AIAssistantMsgContext>(() => {
    return {
      ...options.props,
      msgPosition:
        options.props.msg.msgSource === PolyvAIAssistantChatMsgSource.Question ? 'right' : 'left',
    };
  });

  useAIAssistantMsgProvide(injectCtx);
};
