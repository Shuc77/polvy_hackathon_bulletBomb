/**
 * @file 聊天室 store
 */

import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { getWatchCore } from '@/core/watch-sdk';
import { ErrorVerifyType, redirectToErrorVerify } from '@/hooks/core/use-error-verify';
import {
  ChannelMenuType,
  ChatMsgQuoteOriginType,
  ChatSetting,
  LiveStatus,
  PlvChatModule,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useChannelMenuStore } from './use-channel-menu-store';
import { useLayoutStore } from './use-layout-store';
import { usePlaybackStore } from './use-playback-store';
import { useViewerStore } from './use-viewer-store';
import { useChannelStore } from './use-channel-store';
import { useWatchAppStore } from './use-watch-app-store';

export interface ChatStoreState {
  /** 聊天室设置信息 */
  chatSetting: Ref<ChatSetting>;
  /** 聊天室是否显示 */
  chatRoomVisible: ComputedRef<boolean>;
  /** 配置是否启用聊天列表 */
  chatMsgListEnabled: Ref<boolean>;
  /** 聊天室是否连接失败 */
  connectError: Ref<boolean>;
  /** 聊天室是否被退出 */
  chatExited: Ref<boolean>;
  /** 聊天室是否已关闭 */
  chatRoomIsClosed: Ref<boolean>;
  /** 当前用户是否被踢出 */
  isKicked: Ref<boolean>;
  /** 当前用户是否被禁言 */
  isShield: Ref<boolean>;
  /** 点赞功能是否可用 */
  likeFeatureEnabled: ComputedRef<boolean>;
  /** 实时的点赞数 */
  realtimeLikes: Ref<number>;
  /** "只看特殊角色的消息"的控件是否展示 */
  onlySpecialMsgWidgetVisible: ComputedRef<boolean>;
  /** 只看特殊角色的消息（包括我本地发的） */
  onlySpecialMsg: Ref<boolean>;
  /** 聊天室在线人数 */
  onlineUserCount: Ref<number>;
  /** 聊天室区域控制栏是否可用 */
  chatInputControllerEnable: ComputedRef<boolean>;
  /** 移动端固定聊天输入框是否显示 */
  mobileChatInputFixedVisible: Ref<boolean>;
  /** 聊天室输入框占位符 */
  chatInputPlaceholder: ComputedRef<string>;
  /** 是否禁用聊天室输入框 */
  chatInputDisabled: ComputedRef<boolean>;
  /** 当前正在引用的聊天消息 */
  currentQuoteMsg: Ref<ChatMsgQuoteOriginType | undefined>;
}

export interface ChatStoreAction {
  /** 切换 onlySpecialMsg */
  toggleOnlySpecialMsg(): void;
  /** 同步聊天室 store */
  syncChatStore(): void;
}

export interface ChatStore extends ChatStoreState, ChatStoreAction {}

export const useChatStore = defineStore<'chat', ChatStore>('chat', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const channelMenuStore = useChannelMenuStore();
  const viewerStore = useViewerStore();
  const layoutStore = useLayoutStore();
  const playbackStore = usePlaybackStore();

  /** 聊天室设置信息 */
  const chatSetting = ref<ChatSetting>(PlvChatModule.generateDefaultChatSetting());

  /** 聊天室是否显示 */
  const chatRoomVisible = computed(() => {
    if (channelStore.privateSeminarChannel) return false;

    return chatSetting.value.watchChatEnabled;
  });

  /** 配置是否启用聊天列表 */
  const chatMsgListEnabled = ref(true);

  /** 聊天室是否连接失败 */
  const connectError = ref(false);

  /** 聊天室是否被退出 */
  const chatExited = ref(false);

  /** 聊天室是否已关闭 */
  const chatRoomIsClosed = ref(false);

  /** 当前用户是否被踢出 */
  const isKicked = ref(false);

  /** 当前用户是否被禁言 */
  const isShield = ref(false);

  /** 点赞功能是否可用 */
  const likeFeatureEnabled = computed(() => {
    return chatSetting.value.likeEnabled && !channelStore.isSeminarChannel;
  });

  /** 实时的点赞数 */
  const realtimeLikes = ref(0);

  /**
   * "只看特殊角色的消息"的控件是否展示
   * */
  const onlySpecialMsgWidgetVisible = computed(() => {
    if (playbackStore.chatReplayEnabled) return false;

    return !chatSetting.value.filterManagerMsgEnabled;
  });

  /** 只看特殊角色的消息（包括我本地发的） */
  const onlySpecialMsg = ref(false);

  /** 切换 onlySpecialMsg */
  function toggleOnlySpecialMsg() {
    onlySpecialMsg.value = !unref(onlySpecialMsg);
  }

  /** 聊天室在线人数 */
  const onlineUserCount = ref(0);

  /** 聊天区输入框控制栏是否可用 */
  const chatInputControllerEnable = computed(() => {
    if (watchAppStore.isPlaybackWatchUrl || chatExited.value) return false;

    if (
      channelStore.privateSeminarChannel ||
      (channelStore.isSeminarChannel && channelStore.liveStatus === LiveStatus.Playback)
    ) {
      return false;
    }

    return true;
  });

  /** 移动端固定聊天输入框是否显示 */
  const mobileChatInputFixedVisible = ref(false);

  /** 聊天室输入框占位符 */
  const chatInputPlaceholder = computed<string>(() => {
    // 聊天室被关闭
    if (unref(chatRoomIsClosed) || playbackStore.chatReplayEnabled) {
      return translate('chat.roomClosed');
    }

    let placeholder = translate('chat.input.placeholder');

    // 针对移动端在未设置昵称下更改文案
    if (isMobile && !viewerStore.hasNickname) {
      placeholder = translate('chat.input.placeholder3');
    }

    // 针对竖屏观看页更改文案
    if (layoutStore.isPortraitWatchLayout) {
      placeholder = translate('chat.input.placeholder2');
    }

    // 后台中聊天室的占位设置
    const chatMenu = channelMenuStore.getMenuData(ChannelMenuType.Chat);
    if (chatMenu && chatMenu.content) {
      placeholder = chatMenu.content;
    }

    return placeholder;
  });

  /** 是否禁用聊天室输入框 */
  const chatInputDisabled = computed<boolean>(() => {
    // 聊天室被关闭 || 聊天重放 || 需要实名认证
    if (
      unref(chatRoomIsClosed) ||
      playbackStore.chatReplayEnabled ||
      viewerStore.needRealNameAuth
    ) {
      return true;
    }

    return false;
  });

  /** 当前正在引用的聊天消息 */
  const currentQuoteMsg = ref<ChatMsgQuoteOriginType>();

  function syncChatStore(): void {
    const watchCore = getWatchCore();
    const setting = watchCore.chat.getChatSetting();
    chatSetting.value = setting;

    if (!onlySpecialMsg.value && setting.filterManagerMsgEnabled) {
      onlySpecialMsg.value = true;
    }

    const chatInfo = watchCore.chat.getChatInfo();
    chatExited.value = chatInfo.chatExited;
    chatRoomIsClosed.value = chatInfo.chatRoomIsClosed;
    isKicked.value = chatInfo.isKicked;
    isShield.value = chatInfo.isShield;

    // 如果被踢出了则跳走页面
    if (isKicked.value) {
      redirectToErrorVerify({
        errorType: ErrorVerifyType.isKicked,
      });
    }
  }

  return {
    chatSetting,
    chatRoomVisible,
    chatMsgListEnabled,

    connectError,
    chatExited,
    chatRoomIsClosed,
    isKicked,
    isShield,

    likeFeatureEnabled,
    realtimeLikes,

    onlySpecialMsgWidgetVisible,
    onlySpecialMsg,

    onlineUserCount,

    chatInputControllerEnable,
    mobileChatInputFixedVisible,
    chatInputPlaceholder,
    chatInputDisabled,
    currentQuoteMsg,

    syncChatStore,
    toggleOnlySpecialMsg,
  };
});
