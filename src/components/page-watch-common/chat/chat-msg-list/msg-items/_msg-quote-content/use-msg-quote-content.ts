import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { ChatMsgQuoteType, ChatMsgSource } from '@polyv/live-watch-sdk';
import { computed } from 'vue';

export const msgQuoteContentProps = () => ({
  /** 引用内容 */
  msgQuote: PropUtils.object<ChatMsgQuoteType>().isRequired,
});

export const useMsgQuoteContent = (options: { props: VueProps<typeof msgQuoteContentProps> }) => {
  const { props } = options;

  /** 引用消息的昵称 */
  const quoteNick = computed<string>(() => {
    return props.msgQuote.nick;
  });

  /** 引用的消息来源 */
  const quoteMsgSource = computed<ChatMsgSource>(() => props.msgQuote.msgSource);

  return {
    quoteNick,
    quoteMsgSource,
  };
};
