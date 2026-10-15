/**
 * @file 汇聚吸入特效
 * @desc 冲击波的反向：粒子自画面外缘被吸向一点，越靠近越快、越亮，最后收束成一次闪光。
 *   与「弹幕被特效吸入中心」是同一套视觉语言，阶段 1C 落地时两者要能叠在一起看。
 */
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

const DURATION = 1.6;

const MIN_PARTICLES = 20;
const MAX_PARTICLES = 500;

/** 收束闪光在进度条的这个位置开始 */
const FLASH_AT = 0.78;

/** 黄金角，让粒子均匀铺满一圈 */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** 默认参数，同时是「恢复默认」的目标值 */
export const CONVERGE_DEFAULTS: EffectParams = {
  particles: 200,
  colorPrimary: '#7c5cff',
  colorSecondary: '#2ee6a8',
  ratio: 0.5,
  bias: 0,
  centerX: 0.5,
  centerY: 0.5,
};

interface Particle {
  /** 决定初始角度的序号，只增不改 */
  index: number;
  angle: number;
  /** 决定归属主色还是辅色 */
  colorSeed: number;
  /** 归一化起始距离，1 约等于画面对角线的一半 */
  startDistance: number;
  size: number;
  /** 出场延迟，制造先后被吸进去的层次 */
  delay: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 缓入：越接近中心越快，「被吸」的加速感全靠它 */
function easeInCubic(progress: number): number {
  return progress * progress * progress;
}

export const createConverge: EffectFactory = (
  initialParams: EffectParams,
  size: EffectSize,
): EffectInstance => {
  const particles: Particle[] = [];

  let ratio = 0.5;
  let bias = 0;
  let primary = '#7c5cff';
  let secondary = '#2ee6a8';
  let sinkX = size.width / 2;
  let sinkY = size.height / 2;
  let maxRadius = Math.hypot(size.width, size.height) * 0.62;

  let elapsed = 0;

  function createParticle(index: number): Particle {
    return {
      index,
      angle: index * GOLDEN_ANGLE + (Math.random() - 0.5) * 0.12,
      colorSeed: Math.random(),
      startDistance: 0.6 + Math.random() * 0.7,
      size: 1.4 + Math.random() * 3,
      delay: Math.random() * 0.35,
    };
  }

  /** 只在尾部增删，已有粒子保持身份不变 */
  function syncParticles(target: number): void {
    while (particles.length > target) {
      particles.pop();
    }

    while (particles.length < target) {
      particles.push(createParticle(particles.length));
    }
  }

  function applyParams(params: EffectParams): void {
    ratio = clamp(params.ratio ?? CONVERGE_DEFAULTS.ratio!, 0, 1);
    bias = clamp(params.bias ?? CONVERGE_DEFAULTS.bias!, -1, 1);
    primary = params.colorPrimary ?? CONVERGE_DEFAULTS.colorPrimary!;
    secondary = params.colorSecondary ?? CONVERGE_DEFAULTS.colorSecondary!;

    // bias 把汇聚点推向一侧：得票多的一侧成为「漩涡中心」
    sinkX = (params.centerX ?? CONVERGE_DEFAULTS.centerX!) * size.width + bias * size.width * 0.2;
    sinkY = (params.centerY ?? CONVERGE_DEFAULTS.centerY!) * size.height;
    maxRadius = Math.hypot(size.width, size.height) * 0.62;

    syncParticles(
      Math.round(
        clamp(params.particles ?? CONVERGE_DEFAULTS.particles!, MIN_PARTICLES, MAX_PARTICLES),
      ),
    );
  }

  applyParams(initialParams);

  function drawParticles(ctx: CanvasRenderingContext2D): void {
    particles.forEach(particle => {
      const life = clamp((elapsed - particle.delay) / (DURATION - particle.delay), 0, 1);
      if (life <= 0) {
        return;
      }

      const isPrimary = particle.colorSeed < ratio;
      // bias 让两侧粒子飞行距离不同，画面重心跟着偏
      const favor = isPrimary ? 1 + bias * 0.25 : 1 - bias * 0.25;

      const distance = particle.startDistance * favor * maxRadius * (1 - easeInCubic(life));

      ctx.globalAlpha = 0.3 + life * 0.7;
      ctx.fillStyle = isPrimary ? primary : secondary;
      ctx.beginPath();
      ctx.arc(
        sinkX + Math.cos(particle.angle) * distance,
        sinkY + Math.sin(particle.angle) * distance,
        particle.size * (1 - life * 0.6),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
  }

  /** 收束圈：自外向内缩，给一个「边界正在收拢」的参照 */
  function drawContractingRing(ctx: CanvasRenderingContext2D, progress: number): void {
    const radius = maxRadius * (1 - easeInCubic(clamp(progress / FLASH_AT, 0, 1)));
    if (radius < 1) {
      return;
    }

    ctx.globalAlpha = 0.35 * (1 - progress);
    ctx.lineWidth = 2;
    ctx.strokeStyle = secondary;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.arc(sinkX, sinkY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawFlash(ctx: CanvasRenderingContext2D, progress: number): void {
    if (progress < FLASH_AT) {
      return;
    }

    const flashProgress = (progress - FLASH_AT) / (1 - FLASH_AT);
    const radius = Math.max(maxRadius * 0.34 * flashProgress, 1);
    const gradient = ctx.createRadialGradient(sinkX, sinkY, 0, sinkX, sinkY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    gradient.addColorStop(0.4, primary);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.globalAlpha = 1 - flashProgress;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sinkX, sinkY, radius, 0, Math.PI * 2);
    ctx.fill();
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

      drawContractingRing(ctx, progress);
      drawParticles(ctx);
      drawFlash(ctx, progress);
    },

    applyParams,
  };
};
