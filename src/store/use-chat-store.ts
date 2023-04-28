/**
 * @file 聊天室 store
 */

import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { getWatchCore } from '@/core/watch-sdk';
import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { ChannelMenuType, YN, ChatMsgQuoteOriginType } from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref, watch } from 'vue';
import { useChannelMenuStore } from './use-channel-menu-store';
import { useChannelStore } from './use-channel-store';
import { useViewerStore } from './use-viewer-store';
import { useWatchAppStore } from './use-watch-app-store';

export interface ChatStoreState {
  /** 配置是否启用聊天列表 */
  chatMsgListEnabled: Ref<boolean>;
  /** 聊天室是否连接失败 */
  connectError: Ref<boolean>;
  /** 聊天室是否被退出 */
  chatExited: Ref<boolean>;
  /** 当前聊天室的房间号 */
  channelRoomId: Ref<string>;
  /** 当前频道下所有的分房间列表 */
  chatRoomIds: Ref<string[]>;
  /** 当前是否为分房间 */
  isSibRoom: ComputedRef<boolean>;
  /** 聊天室是否已关闭 */
  chatRoomIsClosed: Ref<boolean>;
  /** 当前用户是否被踢出 */
  isKicked: Ref<boolean>;
  /** 当前用户是否被禁言 */
  isShield: Ref<boolean>;
  /** 聊天室点赞开关 */
  likeEnabled: ComputedRef<boolean>;
  /** 实时的点赞数 */
  realtimeLikes: Ref<number>;
  /** 是否过滤管理员的信息 */
  filterManagerMsgEnabled: ComputedRef<boolean>;
  /** 观众发送图片开关 */
  viewerSendImgEnabled: ComputedRef<boolean>;
  /** 只看特殊角色的消息（包括我本地发的） */
  onlySpecialMsg: Ref<boolean>;
  /** 聊天室开关 */
  watchChatEnabled: ComputedRef<boolean>;
  /** 欢迎语开关 */
  welcomeEnabled: ComputedRef<boolean>;
  /** 聊天室情绪反馈开关 */
  emotionalFeedbackEnabled: ComputedRef<boolean>;
  /** 聊天室在线人数开关 */
  chatOnlineNumberEnable: ComputedRef<boolean>;
  /** 聊天室在线人数 */
  onlineUserCount: Ref<number>;
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
  const channelStore = useChannelStore();
  const watchAppStore = useWatchAppStore();
  const channelMenuStore = useChannelMenuStore();
  const viewerStore = useViewerStore();

  /** 配置是否启用聊天列表 */
  const chatMsgListEnabled = ref(true);

  /** 聊天室是否连接失败 */
  const connectError = ref(false);

  /** 聊天室是否被退出 */
  const chatExited = ref(false);

  /** 当前聊天室的房间号 */
  const channelRoomId = ref<string>('');

  /** 当前频道下所有的分房间列表 */
  const chatRoomIds = ref<string[]>([]);

  /** 当前是否为分房间 */
  const isSibRoom = computed(() => unref(chatRoomIds).length !== 0);

  /** 聊天室是否已关闭 */
  const chatRoomIsClosed = ref(false);

  /** 当前用户是否被踢出 */
  const isKicked = ref(false);

  /** 当前用户是否被禁言 */
  const isShield = ref(false);

  /** 聊天室点赞开关 */
  const likeEnabled = computed<boolean>(() => {
    return ynToBool(channelStore.channelDetail?.channelConfig.sendFlowersEnabled, YN.N);
  });

  /** 实时的点赞数 */
  const realtimeLikes = ref(0);

  /** 是否过滤管理员的信息 */
  const filterManagerMsgEnabled = computed<boolean>(() => {
    return ynToBool(channelStore.channelDetail?.channelConfig.filterManagerMsgEnabled, YN.N);
  });

  /** 观众发送图片开关 */
  const viewerSendImgEnabled = computed<boolean>(() => {
    return ynToBool(channelStore.channelDetail?.channelConfig.viewerSendImgEnabled, YN.N);
  });

  /** 只看特殊角色的消息（包括我本地发的） */
  const onlySpecialMsg = ref(false);

  watch(
    () => unref(filterManagerMsgEnabled),
    () => {
      if (unref(filterManagerMsgEnabled)) {
        onlySpecialMsg.value = true;
      }
    },
    {
      immediate: true,
    },
  );

  /** 切换 onlySpecialMsg */
  function toggleOnlySpecialMsg() {
    onlySpecialMsg.value = !unref(onlySpecialMsg);
  }

  /** 聊天室开关 */
  const watchChatEnabled = computed<boolean>(() => {
    return ynToBool(channelStore.channelDetail?.channelConfig.watchChatEnabled, YN.Y);
  });

  /** 欢迎语开关 */
  const welcomeEnabled = computed(() => {
    return ynToBool(channelStore.channelDetail?.channelConfig.welcomeEnabled, YN.N);
  });

  /** 聊天室情绪反馈开关 */
  const emotionalFeedbackEnabled = computed<boolean>(() => {
    return ynToBool(channelStore.channelDetail?.channelConfig.emotionEnabled, YN.N);
  });

  /** 聊天室在线人数开关 */
  const chatOnlineNumberEnable = computed<boolean>(() => {
    return ynToBool(channelStore.channelDetail?.channelConfig.chatOnlineNumberEnable, YN.N);
  });

  /** 聊天室在线人数 */
  const onlineUserCount = ref(0);

  /** 聊天室输入框占位符 */
  const chatInputPlaceholder = computed<string>(() => {
    // 聊天室被关闭
    if (unref(chatRoomIsClosed)) {
      return translate('chat.closeRoom');
    }

    let placeholder = translate('chat.input.placeholder');

    // 针对移动端在未设置昵称下更改文案
    if (isMobile && !viewerStore.hasNickname) {
      placeholder = translate('chat.input.placeholder3');
    }

    // 针对竖屏观看页更改文案
    if (channelStore.isPortraitWatchLayout) {
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
    // 聊天室被关闭
    if (unref(chatRoomIsClosed)) {
      return true;
    }
    return false;
  });

  /** 当前正在引用的聊天消息 */
  const currentQuoteMsg = ref<ChatMsgQuoteOriginType>();

  function syncChatStore(): void {
    const watchCore = getWatchCore();
    const chatInfo = watchCore.chat.getChatInfo();
    channelRoomId.value = watchCore.chat.getChatRoomId();
    chatRoomIds.value = chatInfo.chatRoomIds;
    chatExited.value = chatInfo.chatExited;
    chatRoomIsClosed.value = chatInfo.chatRoomIsClosed;
    isKicked.value = chatInfo.isKicked;
    isShield.value = chatInfo.isShield;

    if (unref(realtimeLikes) === 0) {
      realtimeLikes.value = channelStore.channelDetail?.watchData.likes ?? 0;
    }

    // 如果被踢出了则跳走页面
    if (isKicked.value) {
      watchAppStore.setPageError({
        type: PageErrorType.NotAuthorized,
        title: translate('base.notAuthorized'),
      });
    }
  }

  return {
    chatMsgListEnabled,
    connectError,
    chatExited,
    channelRoomId,
    chatRoomIds,
    isSibRoom,
    chatRoomIsClosed,
    isKicked,
    isShield,
    realtimeLikes,
    filterManagerMsgEnabled,
    viewerSendImgEnabled,
    onlySpecialMsg,
    watchChatEnabled,
    welcomeEnabled,
    likeEnabled,
    emotionalFeedbackEnabled,
    chatOnlineNumberEnable,
    onlineUserCount,
    chatInputPlaceholder,
    chatInputDisabled,
    currentQuoteMsg,
    syncChatStore,
    toggleOnlySpecialMsg,
  };
});
