/**
 * @file 彩带礼花特效
 * @desc 底部齐射的彩带，带上抛、重力、自转与翻面。用在夺冠/高燃节点。
 *   所有长度都以画布高度为单位表达，缩略图与全屏舞台的观感才一致。
 */
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

const DURATION = 2.8;

const MIN_PARTICLES = 20;
const MAX_PARTICLES = 500;

/** 重力加速度，按画布高度换算，单位：高度/秒² */
const GRAVITY_RATIO = 1.6;

/** 出场后的整体淡出时长，单位：秒 */
const FADE_OUT = 0.7;

/** 默认参数，同时是「恢复默认」的目标值 */
export const CONFETTI_DEFAULTS: EffectParams = {
  particles: 220,
  colorPrimary: '#ff3553',
  colorSecondary: '#ffc53d',
  ratio: 0.5,
  bias: 0,
  centerX: 0.5,
  centerY: 0.5,
};

interface Ribbon {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 自身倾角 */
  angle: number;
  /** 角速度，单位：弧度/秒 */
  spin: number;
  /** 翻面相位。横向按 cos 缩放来模拟彩带自转时的立体感 */
  phase: number;
  phaseSpeed: number;
  width: number;
  height: number;
  /** 决定归属主色还是辅色 */
  colorSeed: number;
  /** 出场延迟，制造齐射的层次 */
  delay: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const createConfetti: EffectFactory = (
  initialParams: EffectParams,
  size: EffectSize,
): EffectInstance => {
  const ribbons: Ribbon[] = [];

  let ratio = 0.5;
  let bias = 0;
  let primary = '#ff3553';
  let secondary = '#ffc53d';

  let elapsed = 0;

  function createRibbon(index: number): Ribbon {
    const width = size.height * (0.012 + Math.random() * 0.01);

    return {
      // 底部齐射，横向铺满整幅
      x: Math.random() * size.width,
      y: size.height * (0.98 + Math.random() * 0.1),
      // 横向分量由中心向外散开，bias 把它整体推向一侧
      vx: (Math.random() - 0.5 + bias * 0.45) * size.height * 0.9,
      vy: -size.height * (0.85 + Math.random() * 0.7),
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 14,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 6 + Math.random() * 9,
      width,
      height: width * (2.2 + Math.random() * 1.3),
      colorSeed: Math.random(),
      delay: Math.random() * 0.22 * (index % 3),
    };
  }

  /** 只在尾部增删，已有彩带保持身份不变 */
  function syncRibbons(target: number): void {
    while (ribbons.length > target) {
      ribbons.pop();
    }

    while (ribbons.length < target) {
      ribbons.push(createRibbon(ribbons.length));
    }
  }

  function applyParams(params: EffectParams): void {
    ratio = clamp(params.ratio ?? CONFETTI_DEFAULTS.ratio!, 0, 1);
    bias = clamp(params.bias ?? CONFETTI_DEFAULTS.bias!, -1, 1);
    primary = params.colorPrimary ?? CONFETTI_DEFAULTS.colorPrimary!;
    secondary = params.colorSecondary ?? CONFETTI_DEFAULTS.colorSecondary!;

    syncRibbons(
      Math.round(
        clamp(params.particles ?? CONFETTI_DEFAULTS.particles!, MIN_PARTICLES, MAX_PARTICLES) / 3,
      ),
    );
  }

  applyParams(initialParams);

  function updateRibbons(delta: number): void {
    const gravity = size.height * GRAVITY_RATIO;

    ribbons.forEach(ribbon => {
      if (elapsed < ribbon.delay) {
        return;
      }

      ribbon.vy += gravity * delta;
      ribbon.x += ribbon.vx * delta;
      ribbon.y += ribbon.vy * delta;
      ribbon.angle += ribbon.spin * delta;
      ribbon.phase += ribbon.phaseSpeed * delta;
    });
  }

  function drawRibbons(ctx: CanvasRenderingContext2D): void {
    const fade = clamp((DURATION - elapsed) / FADE_OUT, 0, 1);
    if (fade <= 0) {
      return;
    }

    ribbons.forEach(ribbon => {
      if (elapsed < ribbon.delay) {
        return;
      }

      // 自转到接近侧对镜头时会薄成一条线，留一点最小宽度免得整条消失
      const flip = Math.cos(ribbon.phase);
      const flipScale = Math.abs(flip) < 0.12 ? 0.12 * (flip < 0 ? -1 : 1) : flip;

      ctx.globalAlpha = fade;
      ctx.fillStyle = ribbon.colorSeed < ratio ? primary : secondary;
      ctx.save();
      ctx.translate(ribbon.x, ribbon.y);
      ctx.rotate(ribbon.angle);
      ctx.scale(flipScale, 1);
      ctx.fillRect(-ribbon.width / 2, -ribbon.height / 2, ribbon.width, ribbon.height);
      ctx.restore();
    });
  }

  return {
    get finished(): boolean {
      return elapsed >= DURATION;
    },

    update(delta: number): void {
      elapsed += delta;
      updateRibbons(delta);
    },

    draw(ctx: CanvasRenderingContext2D): void {
      drawRibbons(ctx);
    },

    applyParams,
  };
};
