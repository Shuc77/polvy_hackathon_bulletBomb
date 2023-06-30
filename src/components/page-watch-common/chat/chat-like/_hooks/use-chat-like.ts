/**
 * @file 聊天室点赞 hook
 */

import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { getWatchCore } from '@/core/watch-sdk';
import { useChatStore } from '@/store/use-chat-store';
import { ChatEvents, ChatEventsRelations } from '@polyv/live-watch-sdk';
import { onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
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
  const chatStore = useChatStore();

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

  /** 将待发送的点赞数发送到服务端 */
  async function sendLikes() {
    if (!waitSendLikes) {
      return;
    }

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
    onClickLike,
  };
};
