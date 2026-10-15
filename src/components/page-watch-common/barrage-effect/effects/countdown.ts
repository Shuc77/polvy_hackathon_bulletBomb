/**
 * @file 文字倒计时（纯转场）
 * @desc ★ 唯一一个「与弹幕无关」的模板：不读 ratio、不读 bias、不参与收集窗，
 *   只看时间轴 —— 命中锚点就开始倒数，观众实时看着数字往下走。
 *
 *   它有意打破了另外六个模板共守的两条约定，都是必要的：
 *
 *   1. **时长由 params 派生**（`countdownSec`），不是模块常量。倒计时的时长本来就是
 *      发布者要配的东西，写死没有意义。`applyParams` 改它只影响何时结束，不重建实例。
 *      （对比：另外六个模板的 DURATION 全是模块常量，`finished` 一律 `elapsed >= DURATION`。）
 *
 *   2. **自己把 globalCompositeOperation 改回 `source-over`**。合成器是按 `lighter`
 *      加法混合调用 `draw()` 的 —— 那对粒子很漂亮，但白字叠在亮画面上会糊掉。
 *      倒计时是给人读的，可读性优先。合成器在 `draw()` 外有 `save/restore`，改完会被复原。
 */
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

export const COUNTDOWN_DEFAULTS: EffectParams = {
  colorPrimary: '#ffffff',
  colorSecondary: '#4f7cff',
  centerX: 0.5,
  centerY: 0.5,
  countdownSec: 300,
  caption: '距离开始还有',
};

const DEFAULT_SECONDS = 300;
const MIN_SECONDS = 3;
const MAX_SECONDS = 3599;

/** 入场淡入时长，单位：秒 */
const FADE_IN = 0.4;

/** 收尾淡出时长，单位：秒 */
const FADE_OUT = 1;

/** 每秒跳字时的搏动衰减速度（越大越干脆） */
const BEAT_DECAY = 0.14;

/** 每秒跳字时的缩放幅度 */
const BEAT_SCALE = 0.06;

const FONT_STACK = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 向上取整到秒：剩 299.4 秒时显示 05:00 而不是 04:59，读起来更符合直觉 */
function formatClock(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;

  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export const createCountdown: EffectFactory = (
  initialParams: EffectParams,
  size: EffectSize,
): EffectInstance => {
  let total = DEFAULT_SECONDS;
  let caption = COUNTDOWN_DEFAULTS.caption as string;
  let primary = COUNTDOWN_DEFAULTS.colorPrimary as string;
  let secondary = COUNTDOWN_DEFAULTS.colorSecondary as string;
  let centerX = size.width / 2;
  let centerY = size.height / 2;

  let elapsed = 0;

  function applyParams(params: EffectParams): void {
    total = Math.round(clamp(params.countdownSec ?? DEFAULT_SECONDS, MIN_SECONDS, MAX_SECONDS));
    caption = params.caption ?? (COUNTDOWN_DEFAULTS.caption as string);
    primary = params.colorPrimary ?? (COUNTDOWN_DEFAULTS.colorPrimary as string);
    secondary = params.colorSecondary ?? (COUNTDOWN_DEFAULTS.colorSecondary as string);
    centerX = (params.centerX ?? COUNTDOWN_DEFAULTS.centerX!) * size.width;
    centerY = (params.centerY ?? COUNTDOWN_DEFAULTS.centerY!) * size.height;
  }

  applyParams(initialParams);

  /**
   * 跳字搏动
   * @desc `remaining` 每跨过一个整秒，小数部分就从 0.999 掉回 0 ——
   *   所以「离上次跳字过了多久」是 `1 - 小数部分`，用它做一个指数衰减的脉冲
   */
  function beatIntensity(remaining: number): number {
    const sinceBeat = 1 - (remaining - Math.floor(remaining));

    return Math.exp(-sinceBeat / BEAT_DECAY);
  }

  /** 衬底：保证在任何画面上都读得清，不做这层的话亮场里白字会化掉 */
  function drawScrim(ctx: CanvasRenderingContext2D, fontSize: number): void {
    const radius = fontSize * 3.6;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCaption(ctx: CanvasRenderingContext2D, fontSize: number): void {
    if (!caption) {
      return;
    }

    ctx.fillStyle = secondary;
    ctx.font = `500 ${Math.round(fontSize * 0.24)}px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(caption, centerX, centerY - fontSize * 0.86);
  }

  function drawDigits(ctx: CanvasRenderingContext2D, fontSize: number, remaining: number): void {
    const beat = beatIntensity(remaining);
    const size = fontSize * (1 + beat * BEAT_SCALE);

    ctx.fillStyle = primary;
    ctx.font = `700 ${Math.round(size)}px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 跳字那一下顺带亮一点，数字才「跳」得出来
    ctx.shadowColor = primary;
    ctx.shadowBlur = (12 + beat * 26) * (size / fontSize);
    ctx.fillText(formatClock(remaining), centerX, centerY);
    ctx.shadowBlur = 0;
  }

  /** 底下一条总进度：观众看得见「还剩多少比例」，不只是数字 */
  function drawProgress(ctx: CanvasRenderingContext2D, fontSize: number, remaining: number): void {
    const width = fontSize * 5.4;
    const height = Math.max(2, fontSize * 0.04);
    const left = centerX - width / 2;
    const top = centerY + fontSize * 0.82;
    const progress = clamp(remaining / total, 0, 1);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(left, top, width, height);

    ctx.fillStyle = secondary;
    ctx.fillRect(left, top, width * progress, height);
  }

  return {
    get finished(): boolean {
      return elapsed >= total;
    },

    update(delta: number): void {
      elapsed += delta;
    },

    draw(ctx: CanvasRenderingContext2D): void {
      const remaining = Math.max(0, total - elapsed);

      // 首尾淡入淡出；其余时间恒为 1
      const alpha = clamp(
        Math.min(elapsed / FADE_IN, remaining / Math.min(FADE_OUT, total * 0.25)),
        0,
        1,
      );
      if (alpha <= 0) {
        return;
      }

      const fontSize = clamp(size.height * 0.22, 28, 190);

      const previousAlpha = ctx.globalAlpha;
      const previousComposite = ctx.globalCompositeOperation;

      // 见文件头第 2 条：倒计时是给人读的，必须离开加法混合
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha;

      drawScrim(ctx, fontSize);
      drawCaption(ctx, fontSize);
      drawDigits(ctx, fontSize, remaining);
      drawProgress(ctx, fontSize, remaining);

      ctx.shadowBlur = 0;
      ctx.globalAlpha = previousAlpha;
      ctx.globalCompositeOperation = previousComposite;
    },

    applyParams,
  };
};
