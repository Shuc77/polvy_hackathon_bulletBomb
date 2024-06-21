import { useWebviewStore } from '@/store/use-webview-store';

/** @todo 暂时保留，后续合并 web-feed 后再移除该文件 */

/**
 * 处理 touch 事件
 * 1、滚动开始前锁住，滑动超过一定距离才解锁
 * 2、由 web 端手动触发原生端的事件
 */
export const useWebviewFeedTouch = (opts?: { maxDelta: number }) => {
  const { maxDelta = 150 } = opts || {};

  const webviewStore = useWebviewStore();
  // let startY = 0;
  // let deltaY = 0;

  function onTouchStart(event: TouchEvent) {
    if (!webviewStore.isPlvWebview) return;
    console.log('onTouchStart', event);

    // startY = event.touches[0].clientY;
  }

  function onTouchMove(event: TouchEvent) {
    if (!webviewStore.isPlvWebview) return;

    console.log('onTouchMove', event, maxDelta);

    // const currentY = event.touches[0].clientY;
    // deltaY = Math.abs(currentY - startY);

    // if (deltaY > maxDelta || event.touches.length > 1) {
    //   event.preventDefault();
    //   if (startY > currentY) {
    //     webviewStore.toNextWebview();
    //   } else {
    //     webviewStore.toPrevWebview();
    //   }
    // }
  }

  function onTouchEnd(event: TouchEvent) {
    if (!webviewStore.isPlvWebview) return;

    console.log('onTouchEnd', event);
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
