/**
 * @file 数据雨特效
 * @desc 垂直下落的字符雨幕，带发光尾迹。用在知识/科技类场景，
 *   不抢画面但持续提示「数据在流动」。
 */
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

const DURATION = 2.8;

/** 导出给注册表当 `naturalSec` 用。别名导出**同一份定义**，不会再写第二遍 */
export { DURATION as RAIN_DURATION };

const MIN_PARTICLES = 20;
const MAX_PARTICLES = 500;

/** 尾迹拆成几段来画。用叠矩形代替 linearGradient，省掉每帧上百次渐变对象分配 */
const TRAIL_SEGMENTS = 4;

/** 字符集只用 ASCII，避免花屏字体缺失 */
const GLYPHS = '0123456789ABCDEF<>/|=+-*'.split('');

/** 默认参数，同时是「恢复默认」的目标值 */
export const RAIN_DEFAULTS: EffectParams = {
  particles: 150,
  colorPrimary: '#2ee6a8',
  colorSecondary: '#2f7bff',
  ratio: 0.6,
  bias: 0,
  centerX: 0.5,
  centerY: 0.5,
};

interface Drop {
  /** 归一化横向位置，0 ~ 1 */
  x: number;
  /** 头部归一化纵向位置，0 在顶部 */
  y: number;
  /** 每秒下落的归一化距离 */
  speed: number;
  /** 尾迹长度，归一化 */
  trail: number;
  /** 头部字符 */
  glyph: string;
  /** 决定归属主色还是辅色 */
  colorSeed: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const createRain: EffectFactory = (
  initialParams: EffectParams,
  size: EffectSize,
): EffectInstance => {
  const drops: Drop[] = [];

  /**
   * 当前字符池
   * @desc ★ 必须是**实例级**而不是模块常量 —— 它是「文字」驱动通道的入口，
   *   而模块级会被多实例共享（缩略图、工作台舞台、生产层同时在跑），
   *   一个实例的弹幕会把另一个实例的字幕也改掉
   */
  let glyphPool: string[] = GLYPHS;

  let ratio = 0.6;
  let bias = 0;
  let primary = '#2ee6a8';
  let secondary = '#2f7bff';

  /**
   * 横向分布的幂次
   * @desc bias 把雨幕的重心推向一侧：u^0.5 往右挤，u^2 往左挤，指数 1 即均匀
   */
  let biasExponent = 1;

  let elapsed = 0;

  function randomGlyph(): string {
    return glyphPool[Math.floor(Math.random() * glyphPool.length)];
  }

  function createDrop(): Drop {
    return {
      x: Math.pow(Math.random(), biasExponent),
      // 起始位置散布在画面上方，避免整幕同时落下
      y: -Math.random() * 1.2,
      speed: 0.35 + Math.random() * 0.55,
      trail: 0.12 + Math.random() * 0.22,
      glyph: randomGlyph(),
      colorSeed: Math.random(),
    };
  }

  /** 只在尾部增删，已有雨滴保持身份不变 */
  function syncDrops(target: number): void {
    while (drops.length > target) {
      drops.pop();
    }

    while (drops.length < target) {
      drops.push(createDrop());
    }
  }

  function applyParams(params: EffectParams): void {
    ratio = clamp(params.ratio ?? RAIN_DEFAULTS.ratio!, 0, 1);
    bias = clamp(params.bias ?? RAIN_DEFAULTS.bias!, -1, 1);
    primary = params.colorPrimary ?? RAIN_DEFAULTS.colorPrimary!;
    secondary = params.colorSecondary ?? RAIN_DEFAULTS.colorSecondary!;
    biasExponent = Math.pow(2, -bias);

    /**
     * 字符池热更
     * @desc **存量雨滴不重掷** —— 守住「随机量在构造时确定」的契约，
     *   否则每来一条弹幕整幕字符一起跳，看着像坏了。
     *   好在数据雨的单滴运动本来就是循环的（出画即重生并重掷字符），
     *   所以新池子在几秒内会自然铺满全屏。这是 rain 独有的便利，别的模板没有
     */
    glyphPool = params.glyphPool?.length ? params.glyphPool : GLYPHS;

    syncDrops(
      Math.round(
        clamp(params.particles ?? RAIN_DEFAULTS.particles!, MIN_PARTICLES, MAX_PARTICLES) / 2.5,
      ),
    );
  }

  applyParams(initialParams);

  function updateDrops(delta: number): void {
    drops.forEach(drop => {
      drop.y += drop.speed * delta;

      // 整条尾迹完全出画后回到顶部重新落下
      if (drop.y - drop.trail > 1) {
        drop.y = -drop.trail;
        drop.x = Math.pow(Math.random(), biasExponent);
        drop.glyph = randomGlyph();
      }
    });
  }

  function drawDrops(ctx: CanvasRenderingContext2D): void {
    // 进出场包络，避免生硬地整幕出现/消失
    const fade = clamp(Math.min(elapsed / 0.35, (DURATION - elapsed) / 0.6), 0, 1);
    if (fade <= 0) {
      return;
    }

    const fontSize = Math.max(10, size.height * 0.044);
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    drops.forEach(drop => {
      const x = drop.x * size.width;
      const headY = drop.y * size.height;
      if (headY < -fontSize) {
        return;
      }

      const trailPx = drop.trail * size.height;
      const color = drop.colorSeed < ratio ? primary : secondary;

      // 尾迹：越靠近头部越亮
      ctx.fillStyle = color;
      for (let index = 0; index < TRAIL_SEGMENTS; index += 1) {
        const segmentTop = headY - trailPx * ((index + 1) / TRAIL_SEGMENTS);
        const segmentBottom = headY - trailPx * (index / TRAIL_SEGMENTS);

        ctx.globalAlpha = fade * 0.5 * (1 - index / TRAIL_SEGMENTS);
        ctx.fillRect(x - 1, segmentTop, 2, segmentBottom - segmentTop);
      }

      // 头部字符
      ctx.globalAlpha = fade;
      ctx.fillText(drop.glyph, x, headY);
    });
  }

  return {
    get finished(): boolean {
      return elapsed >= DURATION;
    },

    update(delta: number): void {
      elapsed += delta;
      updateDrops(delta);
    },

    draw(ctx: CanvasRenderingContext2D): void {
      drawDrops(ctx);
    },

    applyParams,
  };
};
