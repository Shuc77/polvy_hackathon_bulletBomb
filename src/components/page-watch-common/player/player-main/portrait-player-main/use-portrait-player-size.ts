import { usePageStore } from '@/store/use-page-store';
import { usePlayerStore } from '@/store/use-player-store';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { computed, unref } from 'vue';
import { CSSProperties } from 'vue/types/jsx';

export interface PlayerContainerSize {
  width: number;
  height: number;
  top: number;
  left: number;
}

export interface PlayerSizeData {
  width?: number;
  height?: number;
}

/**
 * 获取视频区域高度
 */
function getVideoAreaHeight() {
  const portraitLayoutStore = usePortraitLayoutStore();
  const topStopHeight = 51; // 设计稿如此
  const bottomStopHeight = 218; // 设计稿如此

  return {
    /** 顶部阻挡区域高度 */
    topStopHeight,
    /** 底部阻挡区域高度 */
    bottomStopHeight,
    /** 视频区域高度 */
    videoAreaHeight:
      portraitLayoutStore.portraitWatchLayoutHeight - topStopHeight - bottomStopHeight,
  };
}

/**
 * 计算纯直播下的播放器的尺寸位置
 */
export function computedPlayerSize(targetSize: PlayerSizeData): PlayerContainerSize | undefined {
  const pageStore = usePageStore();
  const portraitLayoutStore = usePortraitLayoutStore();

  const { width: targetWidth, height: targetHeight } = targetSize;

  const pageClientWidth = pageStore.pageClientWidth;
  const portraitWatchLayoutHeight = portraitLayoutStore.portraitWatchLayoutHeight;

  if (!targetWidth || !targetHeight) {
    return;
  }

  const { topStopHeight, videoAreaHeight } = getVideoAreaHeight();

  let sizeData: PlayerContainerSize | undefined;

  // 视频宽度占满屏宽的等比高度
  const _videoHeight = (targetHeight / targetWidth) * pageClientWidth;
  // 视频高度占满屏高的等比宽度
  const _videoWidth = (targetWidth / targetHeight) * portraitWatchLayoutHeight;

  // 等比高度超出屏幕高度，宽度占满，上下裁边
  if (_videoHeight >= portraitWatchLayoutHeight) {
    sizeData = {
      width: pageClientWidth,
      height: _videoHeight,
      top: (portraitWatchLayoutHeight - _videoHeight) / 2,
      left: 0,
    };
    return sizeData;
  }

  // 等比高度小于视频区域高度，宽度占满，视频区域内上下居中
  if (_videoHeight <= videoAreaHeight) {
    sizeData = {
      width: pageClientWidth,
      height: _videoHeight,
      top: (videoAreaHeight - _videoHeight) / 2 + topStopHeight,
      left: 0,
    };
    return sizeData;
  }

  // 高度占满，左右裁边
  sizeData = {
    width: _videoWidth,
    height: portraitWatchLayoutHeight,
    top: 0,
    left: (pageClientWidth - _videoWidth) / 2,
  };

  return sizeData;
}

/**
 * 计算显示文档下播放器的尺寸位置
 */
export function computedDocPlayerSize(targetSize: PlayerSizeData): PlayerContainerSize | undefined {
  const pageStore = usePageStore();

  const { width: targetWidth, height: targetHeight } = targetSize;

  const pageClientWidth = pageStore.pageClientWidth;

  if (!targetWidth || !targetHeight) {
    return;
  }

  // 视频宽度占满屏宽的等比高度
  const _videoHeight = (targetHeight / targetWidth) * pageClientWidth;

  return {
    width: pageClientWidth,
    height: _videoHeight,
    top: 0,
    left: 0,
  };
}

/**
 * 竖屏播放器尺寸 hook
 */
export const usePortraitPlayerSize = (targetSize?: ResponsiveRef<PlayerSizeData | undefined>) => {
  const playerStore = usePlayerStore();
  const portraitLayoutStore = usePortraitLayoutStore();
  const webviewStore = useWebviewStore();
  const pageStore = usePageStore();

  /** 播放器容器数据 */
  const playerContainerSizeData = computed(() => {
    let sizeData: PlayerContainerSize | undefined;
    const pageClientWidth = pageStore.pageClientWidth;
    const portraitWatchLayoutHeight = portraitLayoutStore.portraitWatchLayoutHeight;

    const targetSizeVal: PlayerSizeData = unref(targetSize) || {
      width: playerStore.resolutionWidth,
      height: playerStore.resolutionHeight,
    };

    // webview 小窗时直接铺满全屏
    if (webviewStore.isSmallWindow) {
      sizeData = {
        width: pageClientWidth,
        height: portraitWatchLayoutHeight,
        top: 0,
        left: 0,
      };
      return sizeData;
    }

    // 竖屏播放器页面全屏
    if (portraitLayoutStore.portraitPlayerIsPageFullscreen) {
      sizeData = {
        width: portraitWatchLayoutHeight,
        height: pageClientWidth,
        top: 0,
        left: 0,
      };
      return sizeData;
    }

    if (portraitLayoutStore.portraitDocWrapHeight !== 0) {
      sizeData = computedDocPlayerSize(targetSizeVal);
    } else {
      sizeData = computedPlayerSize(targetSizeVal);
    }
    return sizeData;
  });

  /** 播放器容器样式 */
  const playerContainerStyle = computed(() => {
    const styles: CSSProperties = {};
    const sizeData = playerContainerSizeData.value;

    if (sizeData) {
      styles.width = `${sizeData.width}px`;
      styles.height = `${sizeData.height}px`;
      styles.top = `${sizeData.top}px`;
      styles.left = `${sizeData.left}px`;
    }

    return styles;
  });

  /** 竖屏播放器全屏按钮样式 */
  const portraitPlayerFullscreenBtnStyle = computed(() => {
    // 默认透明
    const styles: CSSProperties = {
      opacity: 0,
    };

    const sizeData = playerContainerSizeData.value;

    if (sizeData) {
      styles.top = portraitLayoutStore.portraitPlayerIsPageFullscreen
        ? `${sizeData.height - 40}px`
        : `${sizeData.top + sizeData.height}px`;
      styles.opacity = 1;
    }

    return styles;
  });

  return {
    playerContainerStyle,
    portraitPlayerFullscreenBtnStyle,
  };
};
