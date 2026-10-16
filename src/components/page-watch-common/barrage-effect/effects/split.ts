/**
 * @file 红蓝对抗分割特效
 * @desc 两侧光幕自画面外缘向中间合拢，在分割线处顶出一条亮缝并溅出火花。
 *   bias 决定分割线落在哪，ratio 决定两侧光幕谁更亮 —— 票差与得票率各占一个参数，
 *   是六个模板里和「观众数据决定形态」咬得最紧的一个。
 */
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

const DURATION = 2.2;

/** 导出给注册表当 `naturalSec` 用。别名导出**同一份定义**，不会再写第二遍 */
export { DURATION as SPLIT_DURATION };

const MIN_PARTICLES = 20;
const MAX_PARTICLES = 500;

/** 光幕合拢占进度条的多少 */
const CLOSE_AT = 0.45;

/** 分割线的横向活动范围，防止贴边 */
const DIVIDER_RANGE = 0.35;

/** 出场后的整体淡出时长，单位：秒 */
const FADE_OUT = 0.6;

/**
 * 驻留模式下单个火花的生命周期，单位：秒
 * @desc 不循环的话，窗内后半段就是一条干挂着的缝 —— 光幕仍在、火花全灭
 */
const SUSTAIN_SPARK_CYCLE = 1.4;

/** 默认参数，同时是「恢复默认」的目标值 */
export const SPLIT_DEFAULTS: EffectParams = {
  particles: 160,
  colorPrimary: '#2f7bff',
  colorSecondary: '#ff3553',
  ratio: 0.5,
  bias: 0,
  centerX: 0.5,
  centerY: 0.5,
};

interface Spark {
  index: number;
  /** 沿分割线的归一化纵向位置 */
  y: number;
  /** 横向漂移速度，带符号表示飞出方向 */
  speed: number;
  /** 发光半径 */
  size: number;
  /** 决定归属主色还是辅色 */
  colorSeed: number;
  delay: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export const createSplit: EffectFactory = (
  initialParams: EffectParams,
  size: EffectSize,
): EffectInstance => {
  const sparks: Spark[] = [];

  let ratio = 0.5;
  let bias = 0;
  let primary = '#2f7bff';
  let secondary = '#ff3553';
  let dividerX = size.width / 2;

  let elapsed = 0;
  /** 收集窗内驻留：包络钉死，永不 finished */
  let sustain = false;

  /**
   * 整体淡出系数
   * @desc 驻留时恒为 1 —— 这一条就是「呼吸灯」和「一条持续的条」的分界
   */
  function envelopeFade(): number {
    return sustain ? 1 : clamp((DURATION - elapsed) / FADE_OUT, 0, 1);
  }

  /** 火花的年龄。驻留时按周期取模，让它们不停地重生 */
  function sparkAge(spark: Spark): number {
    const raw = elapsed - spark.delay;

    if (raw <= 0 || !sustain) {
      return raw;
    }

    return raw % SUSTAIN_SPARK_CYCLE;
  }

  function sparkLifeSpan(spark: Spark): number {
    return sustain ? SUSTAIN_SPARK_CYCLE : DURATION - spark.delay;
  }

  function createSpark(index: number): Spark {
    return {
      index,
      y: Math.random(),
      speed: (Math.random() - 0.5) * 1.4,
      size: size.height * (0.004 + Math.random() * 0.008),
      colorSeed: Math.random(),
      delay: Math.random() * 0.5,
    };
  }

  /** 只在尾部增删，已有火花保持身份不变 */
  function syncSparks(target: number): void {
    while (sparks.length > target) {
      sparks.pop();
    }

    while (sparks.length < target) {
      sparks.push(createSpark(sparks.length));
    }
  }

  function applyParams(params: EffectParams): void {
    ratio = clamp(params.ratio ?? SPLIT_DEFAULTS.ratio!, 0, 1);
    bias = clamp(params.bias ?? SPLIT_DEFAULTS.bias!, -1, 1);
    primary = params.colorPrimary ?? SPLIT_DEFAULTS.colorPrimary!;
    secondary = params.colorSecondary ?? SPLIT_DEFAULTS.colorSecondary!;

    dividerX = (0.5 + bias * DIVIDER_RANGE) * size.width;

    syncSparks(
      Math.round(
        clamp(params.particles ?? SPLIT_DEFAULTS.particles!, MIN_PARTICLES, MAX_PARTICLES) / 3.5,
      ),
    );
  }

  applyParams(initialParams);

  function drawCurtains(ctx: CanvasRenderingContext2D): void {
    const close = easeOutCubic(clamp(elapsed / (DURATION * CLOSE_AT), 0, 1));
    const fade = envelopeFade();
    if (fade <= 0 || close <= 0) {
      return;
    }

    // 得票率直接体现成光幕强度：赢的一侧更实
    const primaryStrength = (0.3 + ratio * 0.45) * fade;
    const secondaryStrength = (0.3 + (1 - ratio) * 0.45) * fade;

    // 光幕自外缘淡入、到分割线最亮
    const leftEdge = dividerX * close;
    if (leftEdge > 1) {
      const gradient = ctx.createLinearGradient(0, 0, leftEdge, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, primary);
      ctx.globalAlpha = primaryStrength;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, leftEdge, size.height);
    }

    const rightEdge = size.width - (size.width - dividerX) * close;
    if (rightEdge < size.width - 1) {
      const gradient = ctx.createLinearGradient(size.width, 0, rightEdge, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, secondary);
      ctx.globalAlpha = secondaryStrength;
      ctx.fillStyle = gradient;
      ctx.fillRect(rightEdge, 0, size.width - rightEdge, size.height);
    }
  }

  function drawSeam(ctx: CanvasRenderingContext2D): void {
    const close = clamp(elapsed / (DURATION * CLOSE_AT), 0, 1);
    if (close < 1) {
      return;
    }

    const fade = envelopeFade();

    // 亮缝：中间一条白芯，两侧晕开
    const glowRadius = size.width * 0.06;
    const gradient = ctx.createLinearGradient(dividerX - glowRadius, 0, dividerX + glowRadius, 0);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.globalAlpha = fade * 0.9;
    ctx.fillStyle = gradient;
    ctx.fillRect(dividerX - glowRadius, 0, glowRadius * 2, size.height);
  }

  function drawSparks(ctx: CanvasRenderingContext2D): void {
    const fade = envelopeFade();
    if (fade <= 0) {
      return;
    }

    sparks.forEach(spark => {
      const age = sparkAge(spark);
      if (age <= 0) {
        return;
      }

      // 火花自亮缝向两侧漂开，越远越淡
      const drift = age * spark.speed * size.width;
      const sparkLife = clamp(1 - age / sparkLifeSpan(spark), 0, 1);

      ctx.globalAlpha = fade * sparkLife * 0.85;
      ctx.fillStyle = spark.colorSeed < ratio ? primary : secondary;
      ctx.beginPath();
      ctx.arc(dividerX + drift, spark.y * size.height, spark.size * sparkLife, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  return {
    get finished(): boolean {
      // 驻留时永不结束 —— 收尾由 setSustain(false) 交还给下面那段淡出
      return !sustain && elapsed >= DURATION;
    },

    update(delta: number): void {
      elapsed += delta;
    },

    draw(ctx: CanvasRenderingContext2D): void {
      drawCurtains(ctx);
      drawSeam(ctx);
      drawSparks(ctx);
    },

    applyParams,

    setSustain(next: boolean): void {
      if (next === sustain) {
        return;
      }

      sustain = next;

      if (!next) {
        // 对齐到尾部淡出起点：合拢进度本来就是 1，fade 从 1 起走，画面连续。
        // 硬切会在一帧之内把整块光幕抹掉
        elapsed = DURATION - FADE_OUT;
      }
    },
  };
};
