import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { translate } from '@/assets/lang';

import { ChatEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

import { useLayoutStore } from '@/store/use-layout-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChatStore } from '@/store/use-chat-store';

import { TAB_NAME_CHAT } from '@/assets/constants/tab-name';
import { TabPaneAdditionalData } from '@/components/common-base/tabs/hooks/types';

/**
 * Tab/Menu 菜单附加数据 Hook
 */
export const useWatchTabHook = ({ mode = 'pc' }: { mode: 'pc' | 'mobile' }) => {
  const layoutStore = useLayoutStore();
  const { chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

  const { chatOnlineNumberEnable, onlineUserCount } = storeDefinitionToRefs(useChatStore);

  /** 获取默认的附加菜单数据 */
  function getDefaultMenuAdditionData(): TabPaneAdditionalData {
    return {
      subLabel: '',
      showReminder: false,
    };
  }

  /** 聊天消息红点提示是否可见 */
  const chatReminderVisible = ref(false);

  /** 当前活动的 Tab Name */
  const curActiveTabName = computed(() => {
    if (mode === 'pc') return layoutStore.pcAsideTabCurrentName;
    if (mode === 'mobile') return layoutStore.mobileMenuCurrentName;

    return layoutStore.pcAsideTabCurrentName;
  });

  /** 聊天Tab附加菜单数据 */
  const chatMenuAdditionData = computed(() => {
    if (!chatMenuData.value.visible) return getDefaultMenuAdditionData();

    const subLabel = chatOnlineNumberEnable.value
      ? `(${onlineUserCount.value}${translate('base.people')})`
      : '';

    const showReminder = chatReminderVisible.value;

    return {
      subLabel,
      showReminder,
    };
  });

  watch(
    () => curActiveTabName.value,
    () => {
      if (curActiveTabName.value === TAB_NAME_CHAT) {
        chatReminderVisible.value = false;
      }
    },
  );

  function onChatMsg() {
    if (curActiveTabName.value !== TAB_NAME_CHAT) {
      chatReminderVisible.value = true;
    }
  }

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
  };
};
