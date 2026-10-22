/**
 * @file 圆形粒子贴图
 * @desc 文字类特效（倒计时、汇聚答案）的粒子是**贴图**不是逐帧 `arc`：
 *   一千多个粒子每帧各建一条路径是实打实的开销，而底下还压着实时视频。
 *   贴图里已经带好中心高光与柔和外晕，一次 `drawImage` 同时给出圆、辉光和颜色。
 */

/** 贴图分辨率。比任何屏幕上的实际绘制尺寸都大，缩小绘制不会有锯齿 */
const SPRITE_SIZE = 32;

export interface RoundSpriteOptions {
  /**
   * 实心核占半径的比例，其余部分是外晕
   * @desc 默认 0.42 是「粒子」观感：核心小、外圈大，适合自由飞散的粒子。
   *   拼字时要反过来 —— 笔画要由实心点连成，外晕一大就糊。文字类贴图传 0.72
   */
  coreRatio?: number;
}

/**
 * 造一张圆形粒子贴图：实心圆 + 中心高光 + 柔和外晕
 *
 * @desc 接受**任意 CSS 颜色串**（`#fff`、`rgb()`、颜色名都行）——
 *   外晕用 `destination-in` 拿一层白色径向渐变当遮罩做出来，而不是
 *   把颜色解析成 rgb 再拼 `rgba(...,0)`。后者遇到解析不了的串就没法退化了
 */
export function createRoundSprite(
  color: string,
  options: RoundSpriteOptions = {},
): HTMLCanvasElement {
  const coreRatio = Math.min(Math.max(options.coreRatio ?? 0.42, 0.1), 0.95);
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  const radius = SPRITE_SIZE / 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.fill();

  // 中心高光：让粒子有个亮点，而不是一块平色
  const core = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius * 0.55);
  core.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  core.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // 外晕：拿这层渐变当遮罩切掉边缘。实心核一直保持到 coreRatio，
  // 之后才快速衰减 —— 拼字时相邻粒子的实心部分必须能连上
  ctx.globalCompositeOperation = 'destination-in';
  const mask = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  mask.addColorStop(0, 'rgba(255, 255, 255, 1)');
  mask.addColorStop(coreRatio, 'rgba(255, 255, 255, 0.98)');
  mask.addColorStop(coreRatio + (1 - coreRatio) * 0.45, 'rgba(255, 255, 255, 0.38)');
  mask.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = mask;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}
