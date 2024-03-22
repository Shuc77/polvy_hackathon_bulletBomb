import { getWatchCore } from '@/core/watch-sdk';
import {
  PolyvAIAssistantChatStatus,
  PolyvAIAssistantConfig,
  PolyvAIModule,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, Ref, ref } from 'vue';

export interface PolyvAIStore {
  /** AI 助手相关配置 */
  AIAssistantConfig: Ref<PolyvAIAssistantConfig>;
  /** AI 助手是否可用 */
  AIAssistantEnabled: ComputedRef<boolean>;
  /** AI 助手答疑聊天区是否可见 */
  AIAssistantChatVisible: ComputedRef<boolean>;
  /** AI 助手答疑聊天区输入框是否禁用 */
  AIAssistantChatInputDisabled: ComputedRef<boolean>;
  /** AI 助手聊天状态 */
  AIAssistantChatStatus: Ref<PolyvAIAssistantChatStatus>;
  /** 同步 PolyvAI 存储数据 */
  syncPolyvAIStore: () => void;
}

/**
 * 保利威 AI Store
 */
export const usePolyvAIStore = defineStore<'polyvAI', PolyvAIStore>('polyvAI', () => {
  /** 是否支持 AI 助手聊天 */
  const supportAIAssistantChat = ref(false);

  /** AI 助手相关配置 */
  const AIAssistantConfig = ref<PolyvAIAssistantConfig>(
    PolyvAIModule.generateDefaultAIAssistantConfig(),
  );

  /** AI 助手是否可用 */
  const AIAssistantEnabled = computed(() => {
    return supportAIAssistantChat.value && AIAssistantConfig.value.aiAssistantEnabled;
  });

  /** AI 助手答疑聊天区是否可见 */
  const AIAssistantChatVisible = computed(() => {
    return AIAssistantConfig.value.aiAssistantId !== -1;
  });

  /** AI 助手答疑聊天区输入框是否禁用 */
  const AIAssistantChatInputDisabled = computed(() => {
    return AIAssistantConfig.value.aiAssistantExpired;
  });

  /**  AI 助手聊天状态 */
  const AIAssistantChatStatus = ref<PolyvAIAssistantChatStatus>(PolyvAIAssistantChatStatus.Wait);

  /**
   * 同步 PolyvAI 存储数据
   */
  function syncPolyvAIStore() {
    const watchCore = getWatchCore();

    const config = watchCore.polyvAI.getAIAssistantConfig();
    AIAssistantConfig.value = config;

    const supported = watchCore.polyvAI.supportAIAssistantChat().support;
    supportAIAssistantChat.value = supported;
  }

  return {
    AIAssistantConfig,
    AIAssistantEnabled,

    AIAssistantChatVisible,
    AIAssistantChatInputDisabled,
    AIAssistantChatStatus,

    syncPolyvAIStore,
  };
});
