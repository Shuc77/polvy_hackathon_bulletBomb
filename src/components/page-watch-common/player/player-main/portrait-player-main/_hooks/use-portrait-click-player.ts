import { appEvents, useEventBusListener } from '@/app/app-events';
import { usePlayerStore } from '@/store/use-player-store';
import { usePlayerAction } from '../../../hooks/use-player-action';
import { PlayStatus } from '@polyv/live-watch-sdk';
import { onBeforeUnmount } from 'vue';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';

/**
 * 判断是否点击dom区域
 * @param dom 节点
 * @param event 原生事件
 */
export const checkDomClick = (event: MouseEvent, dom: Element) => {
  if (!dom || !event) return;
  const clickX = event.clientX;
  const clickY = event.clientY;

  const rect = dom.getBoundingClientRect();
  const startX = rect.x;
  const endX = startX + rect.width;
  const startY = rect.y;
  const endY = startY + rect.height;

  return clickX >= startX && clickX <= endX && clickY >= startY && clickY <= endY;
};

/**
 * 竖屏播放器点击处理 hook
 */
export const usePortraitClickPlayer = () => {
  const playerStore = usePlayerStore();
  const { toPlay, toPause } = usePlayerAction();
  const { noPauseWhenLive } = usePlayerControl();

  /** 记录点击次数 */
  let clickCount = 0;
  /** 清楚点击记录定时器 */
  let clickTimer: number | undefined;

  function clearClickTimer() {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = undefined;
    }
  }

  function openUrl(url?: string) {
    if (url) {
      window.open(url, '_blank', 'noopenner=true');
    }
  }

  /** 处理点击播放器区域 */
  function onClickPlayerRegion(event: MouseEvent) {
    // 判断logo点击
    const logoDom = document.querySelector('.plv-live-logo') ?? undefined;
    if (logoDom && checkDomClick(event, logoDom) && playerStore.logoSetting.logoHref) {
      openUrl(playerStore.logoSetting.logoHref);
      return;
    }

    // 当前处于暂停状态，触发播放
    if (playerStore.isPlayMode && playerStore.playStatus === PlayStatus.Pause) {
      toPlay();
      return;
    }

    // 点击的是暖场图片的区域
    const warmupImgElem = document.querySelector('[data-warmup-img]') ?? undefined;
    if (warmupImgElem && checkDomClick(event, warmupImgElem)) {
      openUrl(playerStore.warmUpSetting.warmUpHref);
      return;
    }

    clickCount++;
    // 双击了播放器区域，暂停播放
    if (clickCount === 2 && !noPauseWhenLive.value) {
      toPause();
      clickCount = 0;
    }

    clearClickTimer();
    clickTimer = window.setTimeout(() => {
      clearClickTimer();
      clickCount = 0;
    }, 200);
  }

  onBeforeUnmount(() => {
    clearClickTimer();
  });

  useEventBusListener(appEvents.portrait.ClickPlayerRegion, onClickPlayerRegion);
};
