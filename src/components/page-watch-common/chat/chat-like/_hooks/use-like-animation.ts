import { LikeAnimationOptions, PlvLikeInstance } from '@/plugins/polyv-ui/types';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePageStore } from '@/store/use-page-store';
import { onBeforeUnmount, ref, unref } from 'vue';

/**
 * 点赞动画 hook
 */
export const useLikeAnimation = () => {
  const pageStore = usePageStore();
  const interactReceiveStore = useInteractReceiveStore();

  /** 点赞组件实例 */
  const likeRef = ref<PlvLikeInstance>();

  /** 点赞动画队列 */
  const likeAnimationQueue: LikeAnimationOptions[] = [];

  /**
   * 插入点赞动画
   * @param count 数量
   */
  function joinLikeAnimationCount(count = 1) {
    for (let i = 0; i < count; i++) {
      if (likeAnimationQueue.length <= 500) {
        likeAnimationQueue.push({});
        checkLikeAnimationTimer();
      } else {
        break;
      }
    }
  }

  /** 点赞动画定时器 */
  let likeAnimationTimer: number | undefined;

  /** 设置点赞气泡动画 */
  function setLikeAnimationTimer() {
    likeAnimationTimer = window.setInterval(() => {
      // 页面正在显示、没进行红包雨
      if (pageStore.visibilityState && !interactReceiveStore.isGoOnRedpackRain) {
        const popedLike = likeAnimationQueue.pop();
        const instance = unref(likeRef);
        if (popedLike && instance && instance.pushAnimation) {
          instance.pushAnimation(popedLike);
        }
        checkLikeAnimationTimer();
      }
    }, 200);
  }

  /**
   * 清楚动画定时器
   */
  function clearLikeAnimationTimer() {
    if (likeAnimationTimer) {
      clearInterval(likeAnimationTimer);
      likeAnimationTimer = undefined;
    }
  }

  /** 检查点赞动画 */
  function checkLikeAnimationTimer() {
    // 动画队列为空，清空定时器
    if (likeAnimationQueue.length === 0) {
      clearLikeAnimationTimer();
      return;
    }

    // 动画队列不为空且没有定时器，则设置点赞气泡动画
    if (!likeAnimationTimer) {
      setLikeAnimationTimer();
    }
  }

  onBeforeUnmount(() => {
    clearLikeAnimationTimer();
  });

  return {
    likeRef,
    joinLikeAnimationCount,
  };
};
