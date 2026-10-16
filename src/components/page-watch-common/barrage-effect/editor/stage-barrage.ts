/**
 * @file 舞台弹幕镜像
 * @desc 把上屏的弹幕在预览舞台的画布上再画一遍。
 *
 * ★ 为什么不去推真实的弹幕层：`.c-effect-workbench` 是 `position: fixed; inset: 0`
 *   的**不透明整屏浮层**，`pc-barrage` 那层就在它底下，工作台开着的时候一根毛都看不见。
 *   舞台之所以要用 canvas 镜像播放器画面（见 `stage-compositor.ts`），根因是同一个。
 *   所以「让模拟弹幕可见」的唯一位置就是这块画布。
 *
 * ★ 进这个模块的东西**一律不碰 Vue 响应式** —— 与 `barrage-signal.ts` 同一条纪律：
 *   60Hz 写进 ref 会让工作台整棵子树重渲染。这里只有普通数组。
 *
 * 弹幕**从哪来**不归它管：`effect-stage.vue` 订阅 `BarrageLanded` 再喂进来，
 * 所以模拟的、真实的走的是同一条路 —— 工作台打开时真实弹幕本来也看不见，镜像它是对的。
 */
import type { EffectSize } from '../types';

/** 同时最多画多少条。8 条连发点两下就 16 条了，给足余量 */
const MAX_ITEMS = 48;

/** 字号相对画布高度的比例，以及上下限（像素） */
const FONT_RATIO = 0.055;
const MIN_FONT = 12;
const MAX_FONT = 24;

/**
 * 一条弹幕从右边缘飘到左边缘要多少秒
 * @desc 基准值，实际每条在 ±25% 内浮动 —— 完全一致的话整个屏幕像列队行军，
 *   一眼就假。比真实弹幕慢一点：舞台是拿来**看清**的，不是拿来追的
 */
const TRAVEL_SEC = 6.5;

/**
 * 纵向分几条道
 * @desc 写在比例空间而不是像素空间：推入弹幕的时候还不知道画布多大
 *   （尺寸要等第一帧量出来），存比例就不必等
 */
const LANE_COUNT = 12;

/** 最上面和最下面那条道的中心位置 */
const LANE_TOP = 0.09;
const LANE_BOTTOM = 0.93;

interface StageBarrageItem {
  text: string;
  /** 0 = 刚从右边缘进场，1 = 完全从左边出去 */
  progress: number;
  /** 纵向中心，0 ~ 1 */
  y: number;
  /** 走完全程的秒数 */
  travel: number;
}

export interface StageBarrage {
  push(text: string): void;
  /**
   * 推进一帧并绘制
   * @param delta 距上一帧的秒数。★ 必须由调用方给真实值 ——
   *   写死 1/60 的话，60Hz 屏上对、120Hz 屏上快一倍，掉帧时又慢下来
   */
  draw(ctx: CanvasRenderingContext2D, size: EffectSize, delta: number): void;
  clear(): void;
}

export function createStageBarrage(): StageBarrage {
  let items: StageBarrageItem[] = [];

  /**
   * 每条道最近一次被占用的时刻
   * @desc 分道是为了不重叠。挑「最久没用过的那条」而不是随机挑 ——
   *   随机挑在连发时很快就会出现两条叠在一起
   */
  const laneUsedAt = new Array<number>(LANE_COUNT).fill(0);

  function pickFreeLane(now: number): number {
    let best = 0;

    for (let index = 1; index < LANE_COUNT; index += 1) {
      if (laneUsedAt[index] < laneUsedAt[best]) {
        best = index;
      }
    }

    laneUsedAt[best] = now;

    return best;
  }

  function push(text: string): void {
    const content = text.trim();

    if (!content) {
      return;
    }

    const lane = pickFreeLane(performance.now());
    const ratio = LANE_COUNT > 1 ? lane / (LANE_COUNT - 1) : 0;

    items.push({
      text: content,
      progress: 0,
      y: LANE_TOP + (LANE_BOTTOM - LANE_TOP) * ratio,
      // 快慢交错，但都在基准附近
      travel: TRAVEL_SEC * (0.75 + Math.random() * 0.5),
    });

    if (items.length > MAX_ITEMS) {
      items = items.slice(items.length - MAX_ITEMS);
    }
  }

  function draw(ctx: CanvasRenderingContext2D, size: EffectSize, delta: number): void {
    if (size.width <= 0 || size.height <= 0) {
      return;
    }

    // 先推进再画：不推进的话新推入的那条会停在第 0 帧的位置
    items = items.filter(item => {
      item.progress += delta / item.travel;

      return item.progress < 1;
    });

    if (items.length === 0) {
      return;
    }

    const fontSize = Math.round(Math.min(Math.max(size.height * FONT_RATIO, MIN_FONT), MAX_FONT));

    /**
     * ★ 整块画在一个 save/restore 里
     * @desc 这段要改 font / textAlign / textBaseline / lineJoin / lineWidth /
     *   strokeStyle / fillStyle / globalAlpha —— 八项。而舞台的绘制顺序是
     *   「视频层 → 驱动器 → 弹幕」，**同一帧里弹幕是最后画的**，
     *   于是这些值会活到下一帧驱动器作画的时候。
     *
     *   现在三个画字的模板（`countdown` / `glyph-field` / `rain`）都自己设全了，
     *   所以眼下不会出事 —— 但那是**它们**守规矩，不是**这里**守规矩。
     *   往后任何一个新模板漏设一项，症状会是「加了弹幕镜像之后某个模板的字歪了」，
     *   而排查要从弹幕模块找到特效模块。手动逐个改回原值也一样能修，
     *   但只有 save/restore 是「不必知道对方默认值是什么」的修法
     */
    ctx.save();

    ctx.font = `600 ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    // 描边参数与字号相关，不必每条重设
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, fontSize * 0.16);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillStyle = '#ffffff';

    for (const item of items) {
      const width = ctx.measureText(item.text).width;
      // 起点在右边缘外，终点在左边缘外 —— 两边都留出自身宽度，进出才不突兀
      const x = size.width - item.progress * (size.width + width);
      const y = item.y * size.height;

      // 首尾各淡一小段，贴边出现/消失会显得很生硬
      const edge = Math.min(item.progress, 1 - item.progress);

      ctx.globalAlpha = Math.min(edge / 0.08, 1);

      // 描边再填字：真实弹幕就是这么保证压在亮画面上也读得清的
      ctx.strokeText(item.text, x, y);
      ctx.fillText(item.text, x, y);
    }

    ctx.restore();
  }

  function clear(): void {
    items = [];
    laneUsedAt.fill(0);
  }

  return { push, draw, clear };
}
