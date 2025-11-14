import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { TAB_NAME_PRODUCT } from '@/assets/constants/tab-name';
import { translate } from '@/assets/lang';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import type { ChatMsgSource } from '@polyv/chat';
import type { MessageConfig, MessageEffectData, MessageLayout } from '@polyv/chat-ui';
import { ChannelMenuType, ChatMessageLayout, ProductEntryPosition } from '@polyv/live-watch-sdk';
import { useBrowser } from '@polyv/vue-components';
import { useChatTarget } from './use-chat-target';

/**
 * 消息隐藏相关
 */
export const useHideChatMsg = () => {
  const chatStore = useChatStore();
  const { ChatMsgSource } = useChatTarget();

  function getHideSources(): ChatMsgSource[] {
    const hideSources: ChatMsgSource[] = [];

    /** ---------- 自定义消息是否显示 ---------- */
    if (!chatStore.chatSetting.showCustomMessageEnabled) {
      hideSources.push(ChatMsgSource.CustomServer);
    }

    return hideSources;
  }

  return {
    getHideSources,
  };
};

/**
 * 消息布局相关
 */
export const useMessageLayout = () => {
  const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);
  const { chatSetting } = storeDefinitionToRefs(useChatStore);
  const { isMobile } = useBrowser();

  function __formatLayout(target: ChatMessageLayout): MessageLayout {
    return target === ChatMessageLayout.Loose ? 'loose' : 'compact';
  }

  /**
   * 获取消息布局
   */
  function getMessageLayout(): MessageLayout {
    if (isPortraitWatchLayout.value) {
      return __formatLayout(chatSetting.value.portraitChatMessageLayout);
    }
    return __formatLayout(chatSetting.value.chatMessageLayout);
  }

  /**
   * 获取是否显示用户头像
   */
  function getShowUserAvatar(): boolean {
    if (isPortraitWatchLayout.value) {
      return chatSetting.value.portraitChatMessageAvatarDisplay;
    }
    return chatSetting.value.chatMessageAvatarDisplay;
  }

  function getMessageHorizontalSpacing(): MessageConfig['messageHorizontalSpacing'] {
    return isPortraitWatchLayout.value
      ? {
          left: 0,
          right: 0,
        }
      : {
          left: 16,
          right: 64,
        };
  }

  function getMessageContainerBoundaryPadding(): MessageConfig['messageContainerBoundaryPadding'] {
    return isMobile
      ? {
          top: 0,
          bottom: 0,
        }
      : {
          top: 16,
          bottom: 16,
        };
  }

  return {
    getMessageLayout,
    getShowUserAvatar,
    getMessageHorizontalSpacing,
    getMessageContainerBoundaryPadding,
  };
};

/**
 * 复制发言消息相关
 */
export const useCopySpeakMsg = () => {
  const { chatSetting } = storeDefinitionToRefs(useChatStore);

  /**
   * 获取是否可以复制发言消息
   */
  function getCopySpeakEnabled(): boolean {
    return chatSetting.value.chatTranslateEnabled || chatSetting.value.quoteReplyEnabled;
  }

  return {
    getCopySpeakEnabled,
  };
};

/**
 * 聊天室输入框相关
 */
export const useChatMessageInput = () => {
  const layoutStore = useLayoutStore();
  const channelMenuStore = useChannelMenuStore();
  const playbackStore = usePlaybackStore();
  const portraitLayoutStore = usePortraitLayoutStore();

  const { needInterruptUserClick } = useInterruptUserClick();

  /**
   * 聊天室输入框占位符
   */
  function getChatInputPlaceholder() {
    let placeholder = translate('chat.input.placeholder');

    // 针对竖屏观看页更改文案
    if (layoutStore.isPortraitWatchLayout) {
      placeholder = translate('chat.input.placeholder2');
    }

    // 后台中聊天室的占位设置
    const chatMenu = channelMenuStore.getMenuData(ChannelMenuType.Chat);
    if (chatMenu && chatMenu.content) {
      placeholder = chatMenu.content;
    }

    // 针对竖屏提问区更改文案
    if (
      layoutStore.isPortraitWatchLayout &&
      portraitLayoutStore.portraitMessageTabCurrentName === PortraitChatTabName.Ask
    ) {
      placeholder = translate('ask.input.placeholder');
    }

    return placeholder;
  }

  /**
   * 获取是否禁用聊天室输入框
   */
  function getDisabledInput() {
    if (needInterruptUserClick.value) {
      return true;
    }

    if (playbackStore.chatMsgReplayEnabled) {
      return true;
    }

    return false;
  }

  return {
    getChatInputPlaceholder,
    getDisabledInput,
  };
};

/**
 * 消息点击回调相关
 */
export function useClickMsgCallback() {
  const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);
  const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
  const layoutStore = useLayoutStore();

  const { ChatMsgSource } = useChatTarget();
  const PolyvChatUI = getChatUIV2Pkg();
  const { isMobile } = useBrowser();

  const { getWatchCore, getEmitter } = useGlobalInject();
  const watchCore = getWatchCore();

  const MessageEffectType = PolyvChatUI.MessageEffectType;

  const clickMsgCallback: MessageConfig['clickMsgCallback'] = {
    [ChatMsgSource.Effect]: async chatMsg => {
      const effectData = chatMsg.data as MessageEffectData;
      const { effectType, targetId } = effectData;
      // 仅商品点击、商品购买才有点击交互
      if (
        [MessageEffectType.ProductBuy, MessageEffectType.ProductClick].includes(effectType) &&
        targetId
      ) {
        const productTarget = await watchCore.product.getProductTarget();
        const productDetail = await productTarget.getProductData(Number(targetId));
        // 普通、职位商品打开商品详情
        if (
          [productTarget.ProductType.Normal, productTarget.ProductType.Position].includes(
            productDetail.productType,
          )
        ) {
          getEmitter().emit(appEvents.product.OpenProductDetailPopup, productDetail.productId);
          return;
        }
        if (!isMobile) {
          // PC 端，开启「播放器是否悬浮商品列表入口开关」，打开商品列表弹层
          if (interactSetting.value.productEntryPosition === ProductEntryPosition.Player) {
            getEmitter().emit(appEvents.product.OpenProductListPopup);
            return;
          }
          // 切换到商品列表的 tab
          layoutStore.$patch({
            pcAsideTabCurrentName: TAB_NAME_PRODUCT,
          });
        } else {
          // 横/竖屏观看页，打开商品列表
          getEmitter().emit(appEvents.product.OpenProductListPopup);
        }
      }
    },
    [ChatMsgSource.Reward]: () => {
      if (!showDonateFunction.value) {
        return;
      }
      getEmitter().emit(appEvents.donate.OpenDonatePopup);
    },
  };

  return {
    clickMsgCallback,
  };
}
