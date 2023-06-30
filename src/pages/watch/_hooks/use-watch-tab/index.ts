import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { translate } from '@/assets/lang';

import { AskEvents, ChatEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

import { useLayoutStore } from '@/store/use-layout-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChatStore } from '@/store/use-chat-store';

import { TAB_NAME_ASK, TAB_NAME_CHAT } from '@/assets/constants/tab-name';
import { TabPaneAdditionalData } from '@/components/common-base/tabs/hooks/types';

/** 获取默认的附加菜单数据 */
function getDefaultMenuAdditionData(): TabPaneAdditionalData {
  return {
    subLabel: '',
    showReminder: false,
  };
}

/**
 * 聊天 TabItem 相关 hook
 */
const useChatTabItemHook = (hookOptions: { onChatMsg: () => void }) => {
  const { onChatMsg } = hookOptions;

  /** 聊天消息红点提示是否可见 */
  const chatReminderVisible = ref(false);

  function updateChatReminderVisible(visible: boolean) {
    chatReminderVisible.value = visible;
  }

  const { chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

  const chatStore = useChatStore();

  /** 聊天Tab附加菜单数据 */
  const chatMenuAdditionData = computed(() => {
    if (!chatMenuData.value.visible) return getDefaultMenuAdditionData();

    const subLabel = chatStore.chatSetting.chatOnlineNumberEnable
      ? `(${chatStore.onlineUserCount}${translate('base.people')})`
      : '';

    const showReminder = chatReminderVisible.value;

    return {
      subLabel,
      showReminder,
    };
  });

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
    unlistenChatMsg();
  });

  return {
    chatMenuAdditionData,
    updateChatReminderVisible,
  };
};

/**
 * 提问 TabItem 相关 hook
 */
const useAskTabItemHook = (hookOptions: { onAskMsg: () => void }) => {
  const { onAskMsg } = hookOptions;

  /** 提问消息红点提示是否可见 */
  const askReminderVisible = ref(false);

  function updateAskReminderVisible(visible: boolean) {
    askReminderVisible.value = visible;
  }

  const { askMenuData } = storeDefinitionToRefs(useChannelMenuStore);

  /** 提问Tab附加菜单数据 */
  const askMenuAdditionData = computed(() => {
    if (!askMenuData.value.visible) return getDefaultMenuAdditionData();

    const showReminder = askReminderVisible.value;

    return {
      subLabel: '',
      showReminder,
    };
  });

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
    askMenuAdditionData,
    updateAskReminderVisible,
  };
};

/**
 * @hook Tab/Menu 菜单附加数据 Hook
 */
export const useWatchTabHook = ({ mode = 'pc' }: { mode: 'pc' | 'mobile' }) => {
  const layoutStore = useLayoutStore();

  /** 当前活动的 Tab Name */
  const curActiveTabName = computed(() => {
    if (mode === 'pc') return layoutStore.pcAsideTabCurrentName;
    if (mode === 'mobile') return layoutStore.mobileMenuCurrentName;

    return layoutStore.pcAsideTabCurrentName;
  });

  const { chatMenuAdditionData, updateChatReminderVisible } = useChatTabItemHook({
    onChatMsg: () => {
      if (curActiveTabName.value !== TAB_NAME_CHAT) {
        updateChatReminderVisible(true);
      }
    },
  });

  const { askMenuAdditionData, updateAskReminderVisible } = useAskTabItemHook({
    onAskMsg: () => {
      if (curActiveTabName.value !== TAB_NAME_ASK) {
        updateAskReminderVisible(true);
      }
    },
  });

  watch(
    () => curActiveTabName.value,
    () => {
      if (curActiveTabName.value === TAB_NAME_CHAT) {
        updateChatReminderVisible(false);
      }
      if (curActiveTabName.value === TAB_NAME_ASK) {
        updateAskReminderVisible(false);
      }
    },
  );

  return {
    chatMenuAdditionData,
    askMenuAdditionData,
  };
};
