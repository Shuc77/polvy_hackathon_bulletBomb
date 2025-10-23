/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGlobalInject } from '@/app/use-global-inject';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useBrowser } from '@polyv/vue-components';
import RedpaperMsg from '../chat-msg-list/components/redpaper-msg/redpaper-msg-wrap.vue';
import {
  useChatMessageInput,
  useClickMsgCallback,
  useCopySpeakMsg,
  useHideChatMsg,
  useMessageLayout,
} from './other';
import { useChatTarget } from './use-chat-target';

export const useChatUIGlobalProvide = () => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const { isMobile } = useBrowser();

  const { chatSetting, onlySpecialMsgWidgetVisible } = storeDefinitionToRefs(useChatStore);
  const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);
  const { needHideUserActor } = storeDefinitionToRefs(useViewerStore);

  const { getHideSources } = useHideChatMsg();
  const { getMessageLayout, getShowUserAvatar } = useMessageLayout();
  const { getCopySpeakEnabled } = useCopySpeakMsg();
  const { getChatInputPlaceholder, getDisabledInput } = useChatMessageInput();
  const { clickMsgCallback } = useClickMsgCallback();
  const { toInterruptUserClick } = useInterruptUserClick();

  const { chatTarget, ChatMsgSource } = useChatTarget();

  const PolyvChatUI = getChatUIV2Pkg();

  PolyvChatUI.useChatGlobalProvide({
    getChatTarget: () => {
      return chatTarget;
    },
    getMessageConfig: () => {
      return {
        introductionText: watchCore.chat.getChatCustomIntroductionText(),
        showEmptyTips: true,
        hideSources: getHideSources(),
        showMessageTime: !isPortraitWatchLayout.value,
        messageLayout: getMessageLayout(),
        showUserAvatar: getShowUserAvatar(),
        showOrdinaryActor: !needHideUserActor.value,
        translateEnabled: chatSetting.value.chatTranslateEnabled,
        copySpeakEnabled: getCopySpeakEnabled(),
        quoteEnabled: chatSetting.value.quoteReplyEnabled,
        messageHorizontalSpacing: isPortraitWatchLayout.value
          ? {
              left: 0,
              right: 0,
            }
          : {
              left: 16,
              right: 64,
            },
        messageContainerBoundaryPadding: isMobile
          ? {
              top: 0,
              bottom: 0,
            }
          : {
              top: 16,
              bottom: 16,
            },
        messageControlInteraction: isMobile ? 'bubble' : 'context-menu',
        onlySpecialMsgEnabled: onlySpecialMsgWidgetVisible.value,
        customMessageRender: {
          [ChatMsgSource.Redpaper]: RedpaperMsg as any,
        },
        clickMsgCallback,
      };
    },
    getInputConfig: () => {
      return {
        disabledInput: getDisabledInput(),
        inputPlaceholder: getChatInputPlaceholder(),
        faceEmotionEnabled: chatSetting.value.faceEmotionEnabled,
        imageEmotionEnabled: chatSetting.value.imageEmotionEnabled,
        sendImageEnabled: chatSetting.value.viewerSendImgEnabled,
      };
    },
    interceptClick: triggerSource => {
      return toInterruptUserClick({
        triggerSource,
        ignoreSetNick: false,
      });
    },
  });
};
