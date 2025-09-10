/**
 * @file 聊天室点赞 hook
 */

import { useGlobalInject } from '@/app/use-global-inject';
import { PropUtils } from '@polyv/vue-components';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useChatStore } from '@/store/use-chat-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { ChatEvents, ChatEventsRelations } from '@polyv/live-watch-sdk';
import { computed, onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { useLikeAnimation } from './use-like-animation';

/**
 * 点赞气泡图标列表
 */
export const likeIcons = [
  require('../imgs/icon-like-crown.png'),
  require('../imgs/icon-like-diamond.png'),
  require('../imgs/icon-like-donuts.png'),
  require('../imgs/icon-like-gift.png'),
  require('../imgs/icon-like-heart.png'),
  require('../imgs/icon-like-rocket.png'),
  require('../imgs/icon-like-star.png'),
  require('../imgs/icon-like-thumb.png'),
  require('../imgs/icon-like-trophy.png'),
  require('../imgs/icon-like-watermelon.png'),
];

export const chatLikeProps = () => ({
  /** 点赞按钮上方是否有其他按钮 */
  upperHasIcon: PropUtils.bool.def(false),
});

export const useChatLike = () => {
  const { getWatchCore } = useGlobalInject();

  const chatStore = useChatStore();
  const viewerStore = useViewerStore();

  /** 上一刻的点击时间 */
  let lastClickTime = Date.now();
  /** 待发送的点赞数 */
  let waitSendLikes = 0;

  /** 处理点击事件 */
  function onClickLike() {
    const now = Date.now();

    if (now - lastClickTime > 200) {
      waitSendLikes += 1;
      chatStore.realtimeLikes += 1;
      lastClickTime = now;
    }
  }

  function onClickLikeWrap() {
    const viewerStore = useViewerStore();
    viewerStore.checkNeedRealNameAuth();
  }

  const { trackUserClickLike } = useWatchEventTrack();

  /** 将待发送的点赞数发送到服务端 */
  async function sendLikes() {
    if (waitSendLikes <= 0) {
      waitSendLikes = 0;
      return;
    }

    trackUserClickLike({ likeCount: waitSendLikes });

    const watchCore = getWatchCore();
    try {
      watchCore.chat.sendLike(waitSendLikes);
    } finally {
      waitSendLikes = 0;
    }
  }

  /** 发送点赞数计时器 */
  let sendLikeTimer: number | undefined;
  onMounted(() => {
    sendLikeTimer = window.setInterval(() => {
      sendLikes();
    }, 5000);
  });
  onBeforeUnmount(() => {
    window.clearInterval(sendLikeTimer);
    sendLikeTimer = undefined;
  });

  const { likeRef, joinLikeAnimationCount } = useLikeAnimation();

  /** 处理点赞事件 */
  function onChatLikeEvent(evt: ChatEventsRelations[ChatEvents.ChatLike]) {
    if (evt.isSelf) {
      return;
    }
    const count = evt.count;
    joinLikeAnimationCount(count);
  }

  /** 点赞是否只读 */
  const isReadonlyLike = computed(() => {
    return viewerStore.needRealNameAuth;
  });

  onMounted(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.on(ChatEvents.ChatLike, onChatLikeEvent);
  });

  onBeforeMount(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.off(ChatEvents.ChatLike, onChatLikeEvent);
  });

  return {
    likeRef,
    likeIcons,
    isReadonlyLike,
    onClickLike,
    onClickLikeWrap,
  };
};
