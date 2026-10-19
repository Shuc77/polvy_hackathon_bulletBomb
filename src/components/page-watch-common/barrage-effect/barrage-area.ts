/**
 * @file 弹幕显示区域
 * @desc 观众可以在播放器控制栏的「弹幕位置」里自己选顶部 / 底部 / 半屏 / 全屏，
 *   真实弹幕只在那块区域里飞 —— `use-barrage.ts` 把 `direction` / `percent`
 *   交给 SDK，由它按「容器高 × percent」分配轨道。
 *
 *   特效层的画布始终铺满整个播放器。声明了 `followBarrageArea` 的模板
 *   （目前是红蓝对抗）在这里换算出一块子矩形，驱动器据此缩放实例并在绘制时
 *   裁切。否则两侧光幕与分割线会把整块视频腰斩，而弹幕只在顶部四分之一里飞，
 *   两边对不上。
 */
import type { EffectSize } from './types';

/** 绘制区域，画布 CSS 像素坐标 */
export interface EffectArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 弹幕位置的运行时值
 * @desc 与 SDK 的 `BarrageLocationInfo` 结构兼容。只取用得到的两项，
 *   免得特效模块反过来依赖 SDK 的类型
 */
export interface BarrageLocationLike {
  /** 0 = 从顶部往下占 `percent`；1 = 从底部往上占 `percent` */
  direction: number;
  /** 区域高度占播放器高度的比例 */
  percent: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 取一个可用的区域高度比例
 * @desc NaN 会一路传染到 clip 矩形；缺省与非法值都按全屏处理
 */
function normalizePercent(location?: BarrageLocationLike): number {
  const rawPercent = location?.percent;

  return typeof rawPercent === 'number' && Number.isFinite(rawPercent)
    ? clamp(rawPercent, 0, 1)
    : 1;
}

/**
 * 把弹幕位置换算成特效绘制区域
 *
 * @returns 全屏时返回 `undefined` —— 没有可裁的边，省掉每帧的 `clip()`
 *
 * @desc 区域恒为整宽、只切高度：SDK 的轨道分配就是这么做的
 *   （`direction` 决定从顶还是从底占用 `totalHeight × percent`）。
 *   播放器尚未同步到位置选项时也走全屏 —— 宁可画满，不要因为
 *   `percent` 缺失把整个特效裁成一条线
 */
export function barrageAreaOf(
  size: EffectSize,
  location?: BarrageLocationLike,
): EffectArea | undefined {
  if (size.width <= 0 || size.height <= 0) {
    return undefined;
  }

  const percent = normalizePercent(location);

  // 留一点浮点余量：全屏的 percent 是 1，别让 0.9999 这种值白裁一刀
  if (percent >= 0.999) {
    return undefined;
  }

  const height = Math.max(1, Math.round(size.height * percent));
  const y = location?.direction === 1 ? size.height - height : 0;

  return { x: 0, y, width: size.width, height };
}

/**
 * 给界面看的区域名
 * @desc 工作台里得让作者知道「这个模板画在哪儿、为什么只占了这一块」。
 *   半屏单独给名字，与播放器里的文案一致；其余按百分比说
 */
export function barrageAreaLabel(location?: BarrageLocationLike): string {
  const percent = normalizePercent(location);

  if (percent >= 0.999) {
    return '全屏';
  }

  if (location?.direction !== 1 && Math.abs(percent - 0.5) < 0.001) {
    return '半屏';
  }

  const side = location?.direction === 1 ? '底部' : '顶部';

  return `${side} ${Math.round(percent * 100)}%`;
}
