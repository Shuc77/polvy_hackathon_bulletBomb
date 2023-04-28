import { onBeforeUnmount, onMounted, Ref, unref } from 'vue';
import {
  loadSvgaPlayer,
  SVGAParser,
  SVGAPlayer,
} from '@/plugins/external-lib-loaders/load-svga-player';

export interface UseSvgaAnimationOptions {
  /** 容器节点 */
  containerRef: Ref<HTMLDivElement | undefined>;
  /** svga 动画文件地址 */
  svgaUrl: string;
  /** 时间间隔，默认：20 * 1000 */
  timeInterval?: number;
}

/**
 * @hook svga 动画
 */
export const useSvgaAnimation = (options: UseSvgaAnimationOptions) => {
  const { containerRef, svgaUrl, timeInterval = 20 * 1000 } = options;

  let svgaPlayer: SVGAPlayer | undefined;
  let svgaParser: SVGAParser | undefined;
  let intervalTimer: number | undefined;

  /** 创建播放器 */
  async function createPlayer() {
    const containerElem = unref(containerRef);
    if (!containerElem) {
      return;
    }
    try {
      const SVGA = await loadSvgaPlayer();
      svgaPlayer = new SVGA.Player(containerElem);
      svgaParser = new SVGA.Parser();
      setupSvgaUrl(svgaUrl);
    } catch (e) {}
  }

  /** 设置 svga 地址 */
  function setupSvgaUrl(url: string) {
    try {
      svgaParser?.load(url, videoItem => {
        svgaPlayer?.setVideoItem(videoItem);
        startAnimation();
      });
    } catch (e) {
      console.error(e);
    }
  }

  /** 开始动画 */
  function startAnimation() {
    clearAnimation();
    if (!svgaPlayer) {
      return;
    }

    try {
      // 循环一次
      svgaPlayer.loops = 1;
      // 开始播放动画
      svgaPlayer.startAnimation();
      // 播放结束后，停留在100%的状态，并 n 秒后重新播放
      svgaPlayer.onFinished(() => {
        svgaPlayer?.stepToPercentage(1, false);
        intervalTimer = window.setTimeout(function () {
          startAnimation();
        }, timeInterval);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /** 清空动画 */
  function clearAnimation() {
    try {
      clearIntervalTimer();
      if (!svgaPlayer) {
        return;
      }
      svgaPlayer.clear();
      svgaPlayer.clearDynamicObjects();
    } catch (e) {
      console.error(e);
    }
  }

  /** 清空 */
  function clearIntervalTimer() {
    clearTimeout(intervalTimer);
    intervalTimer = undefined;
  }

  onMounted(() => {
    createPlayer();
  });

  onBeforeUnmount(() => {
    clearIntervalTimer();
  });

  return {
    setupSvgaUrl,
    clearAnimation,
  };
};
