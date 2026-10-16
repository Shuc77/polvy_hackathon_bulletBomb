/**
 * @file 冲击波特效
 * @desc 中心闪光 + 扩散冲击环 + 放射粒子。参数全部可被观众数据覆盖，
 *   缺省时（ratio=0.5、bias=0）是左右对称的默认形态，即空场降级形态。
 */
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

/** 单帧粒子数上限，防止数据驱动时被刷爆 */
const MAX_PARTICLES = 500;

/** 粒子数下限，太少看不出形态 */
const MIN_PARTICLES = 20;

/** 特效总时长，单位：秒 */
const DURATION = 1.5;

/** 导出给注册表当 `naturalSec` 用。别名导出**同一份定义**，不会再写第二遍 */
export { DURATION as SHOCKWAVE_DURATION };

/** 中心闪光的持续时间，单位：秒 */
const FLASH_DURATION = 0.25;

/** 黄金角，让粒子按序号均匀铺满一圈而不是靠随机数撞 */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** 默认参数，同时是「恢复默认」的目标值 */
export const SHOCKWAVE_DEFAULTS: EffectParams = {
  particles: 180,
  colorPrimary: '#ff3553',
  colorSecondary: '#2f7bff',
  ratio: 0.5,
  bias: 0,
  centerX: 0.5,
  centerY: 0.5,
};

interface Particle {
  /** 决定初始角度的序号，只增不改，保证增删粒子时已有粒子不跳位 */
  index: number;
  /** 放射角度 */
  angle: number;
  /** 决定归属主色还是辅色（与 ratio 比较），构造时定死 */
  colorSeed: number;
  /** 未叠加 bias 的归一化飞行距离 */
  baseDistance: number;
  /** 粒子半径 */
  size: number;
  /** 出场延迟，制造层次感 */
  delay: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 缓出，让爆发感更强 */
function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export const createShockwave: EffectFactory = (
  initialParams: EffectParams,
  size: EffectSize,
): EffectInstance => {
  const particles: Particle[] = [];

  // 以下量全部来自 params，绘制时才读取，因此可以热更新
  let ratio = 0.5;
  let bias = 0;
  let primary = '#ff3553';
  let secondary = '#2f7bff';
  let centerX = size.width / 2;
  let centerY = size.height / 2;
  let maxRadius = Math.hypot(size.width, size.height) * 0.62;

  let elapsed = 0;

  function createParticle(index: number): Particle {
    return {
      index,
      angle: index * GOLDEN_ANGLE + (Math.random() - 0.5) * 0.12,
      colorSeed: Math.random(),
      baseDistance: 0.45 + Math.random() * 0.55,
      size: 1.2 + Math.random() * 2.8,
      delay: Math.random() * 0.18,
    };
  }

  /**
   * 把粒子数对齐到目标值
   * @desc 只在尾部增删，已有粒子保持身份不变，调 slider 时不会整圈跳变
   */
  function syncParticles(target: number): void {
    while (particles.length > target) {
      particles.pop();
    }

    while (particles.length < target) {
      particles.push(createParticle(particles.length));
    }
  }

  function applyParams(params: EffectParams): void {
    ratio = clamp(params.ratio ?? SHOCKWAVE_DEFAULTS.ratio!, 0, 1);
    bias = clamp(params.bias ?? SHOCKWAVE_DEFAULTS.bias!, -1, 1);
    primary = params.colorPrimary ?? SHOCKWAVE_DEFAULTS.colorPrimary!;
    secondary = params.colorSecondary ?? SHOCKWAVE_DEFAULTS.colorSecondary!;

    centerX = (params.centerX ?? SHOCKWAVE_DEFAULTS.centerX!) * size.width;
    centerY = (params.centerY ?? SHOCKWAVE_DEFAULTS.centerY!) * size.height;
    maxRadius = Math.hypot(size.width, size.height) * 0.62;

    syncParticles(
      Math.round(
        clamp(params.particles ?? SHOCKWAVE_DEFAULTS.particles!, MIN_PARTICLES, MAX_PARTICLES),
      ),
    );
  }

  // 构造即首次应用，此后滑块改动走同一条路径
  applyParams(initialParams);

  function drawFlash(ctx: CanvasRenderingContext2D): void {
    const flashProgress = clamp(elapsed / FLASH_DURATION, 0, 1);
    if (flashProgress >= 1) {
      return;
    }

    const radius = maxRadius * 0.24 * (1 - flashProgress * 0.4);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    gradient.addColorStop(0.45, primary);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.globalAlpha = 1 - flashProgress;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRing(ctx: CanvasRenderingContext2D, progress: number): void {
    const radius = maxRadius * easeOutCubic(progress);
    if (radius < 1) {
      return;
    }

    ctx.globalAlpha = Math.pow(1 - progress, 1.5) * 0.9;
    ctx.lineWidth = 8 * (1 - progress) + 0.5;
    ctx.strokeStyle = primary;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawParticles(ctx: CanvasRenderingContext2D): void {
    particles.forEach(particle => {
      const life = clamp((elapsed - particle.delay) / (DURATION - particle.delay), 0, 1);
      if (life <= 0) {
        return;
      }

      // 主色粒子按 ratio 分配；胜方（bias 指向的一侧）飞得更远
      const isPrimary = particle.colorSeed < ratio;
      const favor = isPrimary ? 1 + bias * 0.5 : 1 - bias * 0.5;
      const traveled =
        maxRadius * clamp(particle.baseDistance * favor, 0.2, 1.6) * easeOutCubic(life);

      ctx.globalAlpha = Math.pow(1 - life, 1.6);
      ctx.fillStyle = isPrimary ? primary : secondary;
      ctx.beginPath();
      ctx.arc(
        centerX + Math.cos(particle.angle) * traveled,
        centerY + Math.sin(particle.angle) * traveled,
        particle.size * (1 - life * 0.5),
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
      const progress = clamp(elapsed / DURATION, 0, 1);

      drawFlash(ctx);
      drawRing(ctx, progress);
      drawParticles(ctx);
    },

    applyParams,
  };
};
