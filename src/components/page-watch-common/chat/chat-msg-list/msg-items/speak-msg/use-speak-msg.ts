import { appEvents, eventBus } from '@/app/app-events';
import { TAB_NAME_ASK } from '@/assets/constants/tab-name';
import { translate } from '@/assets/lang';
import { copyText } from '@/assets/utils/copy';
import { isString } from '@/assets/utils/string';
import { getWatchCore } from '@/core/watch-sdk';
import { toast } from '@/hooks/components/use-toast';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { ChatMsgSpeakType } from '@polyv/live-watch-sdk';
import { computed, ref, unref } from 'vue';
import { FullMsgData } from '../../../chat-full-message/type';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';
import { useChatMsgUserBasic } from '../_hooks/chat-msg-user-hook';

/** 转换引用的 speak 内容 */
export function parseQuoteSpeakContent(content: string) {
  const watchCore = getWatchCore();

  return watchCore.chat.parseSpeakContent(content, {
    parseEmotion: true,
  });
}

/**
 * 发言消息内容 hook
 * @param chatMsgRef speak 聊天消息响应式
 */
export const useSpeakMsgContent = (chatMsgRef: ResponsiveRef<ChatMsgSpeakType>) => {
  const watchCore = getWatchCore();

  const { isSpecialUser } = useChatMsgUserBasic(chatMsgRef);

  /** 原始的发言内容 */
  const speakContent = computed<string>(() => {
    return unref(chatMsgRef).content;
  });

  /** 用于渲染的发言 html 内容 */
  const speakHtmlContent = computed<string>(() => {
    const content = unref(chatMsgRef).content;

    return watchCore.chat.parseSpeakContent(content, {
      parseLink: unref(isSpecialUser),
      parseEmotion: true,
    });
  });

  /** 去除掉表情的发言内容 */
  const cleanSpeakContent = computed<string>(() => {
    const contentVal = unref(speakContent);
    if (contentVal.indexOf('<') < 0) {
      return contentVal;
    }
    return contentVal.replace(/<img\b[^>]*>/gi, '');
  });

  return {
    speakContent,
    speakHtmlContent,
    cleanSpeakContent,
  };
};

/**
 * 发言消息翻译 hook
 * @param chatMsgRef
 */
export const useSpeakMsgTranslate = (chatMsgRef: ResponsiveRef<ChatMsgSpeakType>) => {
  const watchCore = getWatchCore();
  const chatStore = useChatStore();
  const layoutStore = useLayoutStore();
  const { isSelfMsg } = useChatMsgUserBasic(chatMsgRef);

  /** 用于翻译的内容 */
  const translateOriginContent = computed<string>(() => {
    let content = unref(chatMsgRef).content;

    // 移除 emotion 表情
    content = watchCore.chat.parseSpeakContent(content, {
      removeEmotion: true,
    });

    return content;
  });

  /** 能否进行翻译 */
  const canTranslate = computed<boolean>(() => {
    // 翻译开关
    if (!chatStore.chatSetting.chatTranslateEnabled) {
      return false;
    }

    // 自己发言不需要翻译
    if (unref(isSelfMsg)) {
      return false;
    }

    // 长文不需要翻译
    if (unref(chatMsgRef).isOverLength) {
      return false;
    }

    // 当前处于提问不需要翻译
    if (
      layoutStore.mobileMenuCurrentName === TAB_NAME_ASK ||
      layoutStore.pcAsideTabCurrentName === TAB_NAME_ASK
    ) {
      return false;
    }

    const content = unref(translateOriginContent);
    return /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(content) || content.search(/[a-zA-Z]+/) >= 0;
  });

  /** 翻译后的内容 */
  const translatedContent = ref<string>();

  /** 是否翻译中 */
  const isTranslating = ref(false);

  /** 翻译当前消息 */
  async function translateCurrentMsg() {
    // 防止重复请求
    if (isTranslating.value) {
      return;
    }

    // 已翻译过，不再翻译
    if (isString(translatedContent.value)) {
      return;
    }

    const watchCore = getWatchCore();

    const content = unref(translateOriginContent);

    isTranslating.value = true;
    try {
      const result = await watchCore.utils.translateText(content);
      translatedContent.value = result;
      isTranslating.value = false;
    } catch (e) {
      isTranslating.value = false;
    }
  }

  return {
    translatedContent,
    canTranslate,
    isTranslating,
    translateCurrentMsg,
  };
};

export const useSpeakMsg = () => {
  const watchAppStore = useWatchAppStore();
  const { chatMsg, msgQuote } = useChatMsgDataInject<ChatMsgSpeakType>();

  const { speakContent, speakHtmlContent } = useSpeakMsgContent(chatMsg);

  /**
   * 获取完整的消息内容
   */
  async function getFullSpeakContent() {
    if (!unref(chatMsg).isOverLength || watchAppStore.isPlaybackWatchUrl) {
      return unref(chatMsg).content;
    }
    const id = unref(chatMsg).id;
    const watchCore = getWatchCore();

    return watchCore.chat.getFullMessage(id);
  }

  /** 复制当前消息 */
  async function copyMsg() {
    let copyContent = unref(chatMsg).content;

    // 长文消息
    if (unref(chatMsg).isOverLength) {
      copyContent = await getFullSpeakContent();
    }

    await copyText(copyContent);
    toast.success(translate('copy.success'));
  }

  /** 显示完整的消息 */
  async function showCompleteMsg() {
    const fullContent = await getFullSpeakContent();
    const data: FullMsgData = {
      fullContent,
      chatMsg: chatMsg.value,
    };
    eventBus.$emit(appEvents.chat.ShowFullMessage, data);
  }

  return {
    chatMsg,
    msgQuote,
    speakContent,
    speakHtmlContent,
    getFullSpeakContent,
    copyMsg,
    showCompleteMsg,
  };
};
