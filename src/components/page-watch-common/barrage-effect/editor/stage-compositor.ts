/**
 * @file 预览舞台合成器
 * @desc 把播放器的真实画面镜像进舞台画布，供特效叠加。
 *
 * ★ 全程只调用 `drawImage`，**绝不调用 `getImageData` / `toDataURL`**。
 *   保利威的流是跨域的，视频画上 canvas 会把画布标记为「被污染」，
 *   此时再把像素读回来会直接抛 `SecurityError`。
 *   以后想加「导出当前帧缩略图」之类的功能，先回来想清楚这件事。
 */
import { useGlobalInject } from '@/app/use-global-inject';
import { PC_MAIN_PLAYER_SELECTOR } from '@/assets/constants/selector';
import type { EffectSize } from '../types';

/**
 * 两次解析尝试之间的最小间隔，单位：毫秒
 * @desc ★ 这里**不能有「尝试 N 次就放弃」这个状态**。`resolveVideoElement` 是每帧
 *   被调的，此前的写法是 60 次之后永久返回 null —— 舞台会在开场一秒内就锁死在
 *   「等待播放器画面…」上再也不动，而下一步本该做的是接着等。
 *   播放器晚就绪是常态（VOD 元数据要等接口、直播要等拉流、切换清晰度会换元素），
 *   原文注释写着「用户重新开播后能自愈」，但计数器一旦到顶就再也回不来了。
 *
 *   限频重试的代价可以忽略：降采样到 500ms 一次 `querySelector`，
 *   比一帧里的其它开销还小
 */
const RESOLVE_INTERVAL = 500;

/** `HTMLMediaElement.HAVE_CURRENT_DATA` */
const HAVE_CURRENT_DATA = 2;

export const useStageCompositor = () => {
  const { getWatchCore } = useGlobalInject();

  let cachedVideo: HTMLVideoElement | null = null;
  /** 下一次允许解析的时刻（`performance.now()`）。0 = 立刻允许 */
  let nextResolveAt = 0;

  /** 取播放器的 video 元素；取不到时限频重试，播放器晚就绪能自愈 */
  function resolveVideoElement(): HTMLVideoElement | null {
    if (cachedVideo && cachedVideo.isConnected) {
      return cachedVideo;
    }

    const now = performance.now();

    if (now < nextResolveAt) {
      return null;
    }

    nextResolveAt = now + RESOLVE_INTERVAL;

    // SDK 的内部接口最可靠，退回自己查 DOM 兜底
    const fromSdk = getWatchCore().player.getPlayerVideoElement();
    const fromDom = document.querySelector<HTMLVideoElement>(`${PC_MAIN_PLAYER_SELECTOR} video`);

    cachedVideo = fromSdk ?? fromDom ?? null;

    return cachedVideo;
  }

  /** 有可绘制的帧才画，否则会画出花屏或上一帧的残影 */
  function isFrameReady(video: HTMLVideoElement): boolean {
    return video.readyState >= HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0;
  }

  function drawVideoCover(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    size: EffectSize,
  ): boolean {
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (!videoWidth || !videoHeight) {
      return false;
    }

    // 按 cover 裁切：与播放器本身的 fit 表现一致，预览里的画面关系才不会错位
    const scale = Math.max(size.width / videoWidth, size.height / videoHeight);
    const drawWidth = videoWidth * scale;
    const drawHeight = videoHeight * scale;

    ctx.drawImage(
      video,
      (size.width - drawWidth) / 2,
      (size.height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );

    return true;
  }

  /** 无视频时画一张浅扫描线底，让它一眼是「占位」而不是「画面全黑」 */
  function drawPlaceholder(ctx: CanvasRenderingContext2D, size: EffectSize): void {
    ctx.fillStyle = '#14161c';
    ctx.fillRect(0, 0, size.width, size.height);

    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let y = 0; y < size.height; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(size.width, y + 0.5);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  /**
   * 绘制视频层
   * @returns 是否画上了真实画面
   */
  function drawVideoLayer(ctx: CanvasRenderingContext2D, size: EffectSize): boolean {
    const video = resolveVideoElement();

    if (video && isFrameReady(video)) {
      try {
        if (drawVideoCover(ctx, video, size)) {
          return true;
        }
      } catch {
        // 视频源被换掉等少见情况：丢弃缓存退回占位，下一帧重新解析
        cachedVideo = null;
      }
    }

    drawPlaceholder(ctx, size);

    return false;
  }

  return {
    drawVideoLayer,
    resolveVideoElement,
  };
};
