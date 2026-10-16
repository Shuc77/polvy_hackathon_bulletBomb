/**
 * @file 心跳脉冲特效
 * @desc 同心波自中心层层扩散 + 中心「咚、咚」双重搏动 + 沿波前骑行的光点。
 *   比冲击波更柔，用在情绪高点而不是爆发点。
 */
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

const DURATION = 2.4;

/** 导出给注册表当 `naturalSec` 用。别名导出**同一份定义**，不会再写第二遍 */
export { DURATION as PULSE_DURATION };

const MIN_PARTICLES = 20;
const MAX_PARTICLES = 500;

/** 扩散的圈数 */
const RING_COUNT = 5;

/** 相邻两圈起跑的时间差，单位：秒 */
const RING_STAGGER = 0.22;

/** 单圈从中心扩到最大半径所需时间，单位：秒 */
const RING_LIFE = 1.5;

/** 中心搏动的两次跳动时刻，单位：秒 */
const THUMPS = [0.06, 0.3];

/** 单次搏动的影响半径，单位：秒 */
const THUMP_SPREAD = 0.16;

/** 黄金角，让光点均匀铺满一圈 */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** 默认参数，同时是「恢复默认」的目标值 */
export const PULSE_DEFAULTS: EffectParams = {
  particles: 90,
  colorPrimary: '#ff4d8d',
  colorSecondary: '#7c5cff',
  ratio: 0.5,
  bias: 0,
  centerX: 0.5,
  centerY: 0.5,
};

interface Dot {
  /** 决定初始角度的序号，只增不改 */
  index: number;
  angle: number;
  /** 决定归属主色还是辅色 */
  colorSeed: number;
  /** 骑行半径的相对位置，0 ~ 1 */
  radiusFactor: number;
  size: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

/** 两次搏动的强度叠加，用高斯核做成脉冲而非硬切 */
function thumpIntensity(time: number): number {
  return THUMPS.reduce((sum, at) => {
    const distance = (time - at) / THUMP_SPREAD;
    return sum + Math.exp(-distance * distance);
  }, 0);
}

export const createPulse: EffectFactory = (
  initialParams: EffectParams,
  size: EffectSize,
): EffectInstance => {
  const dots: Dot[] = [];

  let ratio = 0.5;
  let bias = 0;
  let primary = '#ff4d8d';
  let secondary = '#7c5cff';
  let centerX = size.width / 2;
  let centerY = size.height / 2;
  let maxRadius = Math.hypot(size.width, size.height) * 0.55;

  let elapsed = 0;

  function createDot(index: number): Dot {
    return {
      index,
      angle: index * GOLDEN_ANGLE + (Math.random() - 0.5) * 0.3,
      colorSeed: Math.random(),
      radiusFactor: Math.random(),
      size: 1.5 + Math.random() * 2.2,
    };
  }

  /** 只在尾部增删，已有光点保持身份不变 */
  function syncDots(target: number): void {
    while (dots.length > target) {
      dots.pop();
    }

    while (dots.length < target) {
      dots.push(createDot(dots.length));
    }
  }

  function applyParams(params: EffectParams): void {
    ratio = clamp(params.ratio ?? PULSE_DEFAULTS.ratio!, 0, 1);
    bias = clamp(params.bias ?? PULSE_DEFAULTS.bias!, -1, 1);
    primary = params.colorPrimary ?? PULSE_DEFAULTS.colorPrimary!;
    secondary = params.colorSecondary ?? PULSE_DEFAULTS.colorSecondary!;

    // bias 让整个搏动核心左右偏移，得票多的一侧更亮
    centerX = (params.centerX ?? PULSE_DEFAULTS.centerX!) * size.width;
    centerY = (params.centerY ?? PULSE_DEFAULTS.centerY!) * size.height;
    maxRadius = Math.hypot(size.width, size.height) * 0.55;

    syncDots(
      Math.round(
        clamp(params.particles ?? PULSE_DEFAULTS.particles!, MIN_PARTICLES, MAX_PARTICLES),
      ),
    );
  }

  applyParams(initialParams);

  function drawCore(ctx: CanvasRenderingContext2D): void {
    const intensity = thumpIntensity(elapsed);
    if (intensity < 0.02) {
      return;
    }

    const radius = maxRadius * 0.3 * (0.6 + intensity * 0.4);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, primary);
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.globalAlpha = clamp(intensity * 0.8, 0, 1);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRings(ctx: CanvasRenderingContext2D): void {
    for (let index = 0; index < RING_COUNT; index += 1) {
      const age = elapsed - index * RING_STAGGER;
      if (age <= 0 || age >= RING_LIFE) {
        continue;
      }

      const progress = age / RING_LIFE;
      const radius = maxRadius * easeOutCubic(progress);
      if (radius < 1) {
        continue;
      }

      // 圈的主辅色归属跟随 ratio，让得票率直接体现成画面色调
      const isPrimary = index / RING_COUNT < ratio;

      ctx.globalAlpha = Math.pow(1 - progress, 1.4) * 0.85;
      ctx.lineWidth = 6 * (1 - progress) + 0.6;
      ctx.strokeStyle = isPrimary ? primary : secondary;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawDots(ctx: CanvasRenderingContext2D): void {
    // 光点跟着最前面那道波的波前走
    const wavefront = maxRadius * easeOutCubic(clamp(elapsed / (DURATION * 0.65), 0, 1));

    dots.forEach(dot => {
      if (wavefront < 1) {
        return;
      }

      const radius = wavefront * (0.82 + dot.radiusFactor * 0.3);
      const fade = clamp(1 - elapsed / DURATION, 0, 1);
      const isPrimary = dot.colorSeed < ratio;

      ctx.globalAlpha = fade * 0.9;
      ctx.fillStyle = isPrimary ? primary : secondary;
      ctx.beginPath();
      // bias 让整圈光点朝一侧偏，视觉重心跟着票差走
      ctx.arc(
        centerX + Math.cos(dot.angle) * radius + bias * maxRadius * 0.12,
        centerY + Math.sin(dot.angle) * radius,
        dot.size * fade,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
  }

  return {
    get finished(): boolean {
      return elapsed >= DURATION;
    },

    update(delta: number): void {
      elapsed += delta;
    },

    draw(ctx: CanvasRenderingContext2D): void {
      drawCore(ctx);
      drawRings(ctx);
      drawDots(ctx);
    },

    applyParams,
  };
};
