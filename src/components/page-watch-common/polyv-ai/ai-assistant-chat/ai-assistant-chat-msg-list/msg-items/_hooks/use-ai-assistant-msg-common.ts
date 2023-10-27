import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { PolyvAIAssistantChatMsgType } from '@polyv/live-watch-sdk';
import { ComputedRef, inject, InjectionKey, provide } from 'vue';

export const AIAssistantMsgItemCommonProps = () => ({
  /** AI 助手答疑消息 */
  msg: PropUtils.object<PolyvAIAssistantChatMsgType>().isRequired,
  /** 聊天消息索引 */
  index: PropUtils.number.isRequired,
});

export interface AIAssistantMsgContext extends VueProps<typeof AIAssistantMsgItemCommonProps> {
  /** 消息展示位置 */
  msgPosition: 'left' | 'right';
}

const MSG_INJECT_KEY: InjectionKey<ComputedRef<AIAssistantMsgContext>> = Symbol('AI_Assistant_Msg');

/**
 * 注入 AI 消息上下文数据
 * @param context
 */
export const useAIAssistantMsgProvide = (context: ComputedRef<AIAssistantMsgContext>) => {
  provide(MSG_INJECT_KEY, context);
};

/**
 * 获取 AI 消息注入
 */
export const useAIAssistantMsgInject = () => {
  return inject(MSG_INJECT_KEY) as ComputedRef<AIAssistantMsgContext>;
};
