/**
 * @file 互动驱动器
 * @desc 生产层（`pc-barrage-effect.vue`）与工作台舞台（`editor/effect-stage.vue`）
 *   共用的**唯一**播放实现。
 *
 *   「预览走的是和生产完全同一条代码路径」这句话要成立，就得真的只有一条路径 ——
 *   两边的差别只在宿主（画布、时钟、样本源从哪来），不在逻辑。所以开窗、读样本、
 *   缓动、循环、驻留、合成顺序全部在这里。
 *
 *   样本源两边也完全一致：都订阅 app 级总线上的 `BarrageLanded`。工作台的模拟弹幕
 *   写的是同一个入口，所以「预览能看出来、上线就坏」这件事从结构上不可能发生。
 */
import { effectTemplates, getEffectTemplate } from './effects';
import type { EffectArea } from './barrage-area';
import { PULL_TAU, easeToward } from './feed-easing';
import { resolveTimeScale } from './span';
import {
  createFeedWindow,
  feedOptionsOf,
  resolveFeedMode,
  type FeedReading,
  type FeedWindow,
} from './feed-window';
import type { BarrageSample } from './barrage-signal';
import type {
  BarrageAnchor,
  EffectFeedMode,
  EffectInstance,
  EffectParams,
  EffectSize,
  EffectTemplateDescriptor,
} from './types';

/** 循环之间的间隙（秒）。不留的话读起来是频闪不是循环 */
const LOOP_GAP = 0.5;

/**
 * 单条轨道的挂钟存活上限
 *
 * @desc ★ 这是一张兜底网，不是正常路径。
 *
 *   驱动器「还有没有轨道」正是共享 rAF 的续命信号（见 `pc-barrage-effect.vue`：
 *   `tick()` 返回真就每帧 `start()`）。所以**任何**能让 `finished` 永远为假的取值，
 *   都会让这块画布无声地烧帧到页面关闭 —— 没有报错、没有日志、CPU 一直转。
 *   已知会这样的只有 `NaN`（`NaN >= x` 恒为 false），而 `clamp` 挡不住它。
 *   `span.ts` 与各模板里都逐个挡过了，这里是防「下一个没想到的来源」。
 *
 *   取 65 分钟：合法的最长一条是 3599 秒的文字倒计时
 */
const MAX_TRACK_SEC = 3900;

/** 尺寸还没量出来时的重建重试间隔 */
const SPAWN_RETRY = 0.2;

const SCALE_MIN_PARTICLES = 20;
const SCALE_MAX_PARTICLES = 500;
/** 条数达到它即满规模 */
const DEFAULT_SCALE_FULL_COUNT = 40;
/** 规模相对作者基准值的上下限，防止极端刷屏把粒子数拉到不可控 */
const SCALE_FACTOR_MIN = 0.6;
const SCALE_FACTOR_MAX = 1.6;

/** 文字通道喂给模板的字符池上限 */
const MAX_GLYPHS = 200;

export interface PlayOptions {
  /**
   * 播完自动重来
   * @desc 舞台预览要它 —— 1.5 秒的一次性动画在你碰滑块之前就结束了，
   *   而盯着效果调参才是工作台的全部价值。生产层不要
   */
  loop?: boolean;
}

/** 工作台要显示的拉扯状态 */
export interface DriverDebugState {
  mode: EffectFeedMode;
  /** 驱动当前下发的主色占比 */
  ratio: number;
  /** 驱动当前下发的重心偏向 */
  bias: number;
  /** 窗内弹幕总条数 */
  count: number;
  /** A 派命中数 */
  primary: number;
  /** B 派命中数 */
  secondary: number;
  /** 距关窗还剩多少秒 */
  remaining: number;
}

export interface InteractiveDriver {
  play(anchor: BarrageAnchor, options?: PlayOptions): void;
  /** 换基准参数，热更新不重建 */
  updateParams(params: EffectParams): void;
  /** 尺寸变了：实例在构造时固化了尺寸，全部作废，窗保留着下一帧重建 */
  invalidate(): void;
  /** 每帧推进 + 绘制。返回是否还需要继续跑 */
  tick(ctx: CanvasRenderingContext2D, delta: number): boolean;
  /** 立即结束一切（拖进度条、换预览目标、卸载） */
  reset(): void;
  /**
   * 取当前窗的读数，没有窗时返回 undefined
   * @desc 给工作台显示用。作者看不到「缝合占比」在动的话，
   *   根本判断不出缓动是不是坏了 —— 它本来就慢
   */
  getDebugState(): DriverDebugState | undefined;
}

/**
 * 一条播放轨道
 * @desc 有 `feed` 的是互动窗，没有的是一次性转场。
 *
 *   缓动值（`ratio` / `bias` / `particles`）**挂在轨道上，不挂在实例上** ——
 *   没实现 `setSustain` 的模板靠「整轮循环」撑满窗长，每轮重建都会换一批随机粒子，
 *   缓动值要是跟着实例走，每 2 秒就被拉回中点一次，观众看到的是抽搐
 */
interface Track {
  anchor: BarrageAnchor;
  /**
   * 作者配的基准参数
   * @desc 驱动**只读它，绝不改它**。规模通道要按它缩放粒子数，
   *   要是把每帧算出来的结果写回去，基准就会逐帧漂移
   */
  base: EffectParams;
  /** 每帧真正下发给实例的参数 = base + 本驱动方式的覆盖 */
  delivered: EffectParams;
  instance?: EffectInstance;
  gapRemaining: number;
  loop: boolean;
  feed?: FeedWindow;
  ratio: number;
  bias: number;
  particles: number;
  closing: boolean;
  /**
   * 实例时钟的缩放系数，1 = 正常速度
   * @desc 大于 1 是慢放（`update` 收到的是 `delta / timeScale`）。
   *   值由 `span.ts` 的 `resolveTimeScale` 给出 —— 它是唯一知道「时长存在哪」的地方。
   *   互动轨道恒为 1
   */
  timeScale: number;
  /** 建轨时刻（`performance.now()`），只给 `MAX_TRACK_SEC` 那张兜底网用 */
  startedAt: number;
  /** 最近一次读数，供工作台显示 */
  lastReading?: FeedReading;
  /**
   * 这个模板要不要跟着弹幕显示区域走
   * @desc 建轨时从模板元数据上抄一份。区域变化由宿主 `invalidate()`，
   *   下一轮 `spawn` 会连同实例尺寸一起重算
   */
  followArea: boolean;
  /** 本次实例的绘制区域；`undefined` = 整个画布 */
  area?: EffectArea;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface UseInteractiveDriverOptions {
  getSize: () => EffectSize;
  /** 取时间窗内的弹幕样本 */
  getSample: (now: number, seconds: number) => BarrageSample;
  /**
   * 播放器的弹幕显示区域
   * @desc 只对声明了 `followBarrageArea` 的模板生效（见 `barrage-area.ts`）。
   *   返回 `undefined` 表示全画布。宿主在区域变化时必须 `invalidate()` ——
   *   实例在构造时固化了尺寸，驱动器自己发现不了
   */
  getArea?: () => EffectArea | undefined;
}

export const useInteractiveDriver = (options: UseInteractiveDriverOptions): InteractiveDriver => {
  const { getSize, getSample, getArea } = options;

  const tracks: Track[] = [];

  /** 条数 → 粒子数。按作者配的基准值缩放，而不是写死一个绝对量 */
  function targetParticles(
    descriptor: EffectTemplateDescriptor,
    base: number,
    count: number,
  ): number {
    const full = descriptor.scaleFullCount ?? DEFAULT_SCALE_FULL_COUNT;
    const factor = clamp(count / full, SCALE_FACTOR_MIN, SCALE_FACTOR_MAX);

    return clamp(Math.round(base * factor), SCALE_MIN_PARTICLES, SCALE_MAX_PARTICLES);
  }

  /** 弹幕原文 → 字符池。中文取单字，去空白，封顶 */
  function textToGlyphs(texts: string[]): string[] {
    const glyphs: string[] = [];

    for (const text of texts) {
      for (const char of Array.from(text)) {
        if (/\s/.test(char)) {
          continue;
        }

        glyphs.push(char);

        if (glyphs.length >= MAX_GLYPHS) {
          return glyphs;
        }
      }
    }

    return glyphs;
  }

  /**
   * 把窗内的读数换算成参数
   * @desc **只写本驱动方式声明过的字段** —— 规模模式的窗不该顺手把 ratio 也改掉，
   *   那会让作者配好的配色莫名其妙变样
   */
  function applyReading(track: Track, delta: number, now: number): void {
    const feed = track.feed;
    if (!feed) {
      return;
    }

    const reading: FeedReading = feed.read(getSample(now, feed.windowSec));
    track.lastReading = reading;

    const patch: EffectParams = { ...track.base };
    const descriptor = getEffectTemplate(track.anchor.template);

    if (feed.mode === 'polarity') {
      track.ratio = easeToward(track.ratio, reading.share, delta, PULL_TAU);
      track.bias = easeToward(track.bias, reading.share * 2 - 1, delta, PULL_TAU);
      patch.ratio = track.ratio;
      patch.bias = track.bias;
    } else if (feed.mode === 'scale') {
      const base = track.base.particles ?? descriptor?.defaults.particles ?? 120;

      track.particles = easeToward(
        track.particles,
        descriptor ? targetParticles(descriptor, base, reading.count) : base,
        delta,
        PULL_TAU,
      );
      patch.particles = Math.round(track.particles);
    } else if (feed.mode === 'text') {
      const glyphs = textToGlyphs(reading.texts);
      // 没弹幕时把字符池交还给模板内置池，别让雨幕空掉
      patch.glyphPool = glyphs.length > 0 ? glyphs : undefined;
    }

    /**
     * ★ 原文与驱动方式无关地注入
     * @desc 红蓝对抗要的是**整句话**，不是统计量。作者把它切成「规模」时，
     *   两派弹幕对冲的形态不该退化成没有字的粒子；切回「转场」时没有收集窗，
     *   模板会用自己的演示短语兜底。上面那几个分支只写各自声明过的字段，
     *   这三个是「谁需要谁读」的公共输入，不改变任何既有模板的行为
     */
    patch.barrageTexts = reading.texts;
    patch.barrageTextsA = reading.primaryTexts;
    patch.barrageTextsB = reading.secondaryTexts;

    track.delivered = patch;
    track.instance?.applyParams?.(patch);
  }

  function spawn(track: Track): void {
    const factory = effectTemplates[track.anchor.template];
    const fullSize = getSize();
    const area = track.followArea ? getArea?.() : undefined;
    // 模板的坐标全部是相对 `size` 的归一化值 —— 给它区域尺寸，
    // 它自然就按区域铺开，不必知道外面还有一整块画布
    const size: EffectSize = area ? { width: area.width, height: area.height } : fullSize;

    if (!factory || size.width < 1 || size.height < 1) {
      track.gapRemaining = SPAWN_RETRY;
      return;
    }

    track.area = area;

    const instance = factory(track.delivered, size);

    // 驻留：包络钉死、永不 finished。不支持它的模板退回「整轮循环 + 间隙」
    if (track.feed) {
      instance.setSustain?.(true);
    }

    track.instance = instance;
  }

  /** 推进一条轨道，返回是否保留 */
  function tickTrack(track: Track, delta: number, now: number): boolean {
    // 兜底网：无论如何都不让一条轨道活过 MAX_TRACK_SEC，见那个常量的注释
    if (now - track.startedAt > MAX_TRACK_SEC * 1000) {
      return false;
    }

    if (track.feed) {
      const closing = track.feed.isClosing(now);

      if (closing && !track.closing) {
        track.closing = true;
        // 关窗的收尾交给模板自己的淡出，不是在这里硬切
        track.instance?.setSustain?.(false);
      }

      if (!closing) {
        applyReading(track, delta, now);
      }
    }

    if (!track.instance) {
      if (track.closing) {
        // 间隙里关的窗：没有实例要收尾，直接结束
        return false;
      }

      track.gapRemaining -= delta;

      if (track.gapRemaining <= 0) {
        spawn(track);
      }

      return true;
    }

    /**
     * ★ 时间缩放就是这一行：实例内部 `elapsed` 的推进速度变成 `1 / timeScale`，
     *   而所有模板的 `finished` 都是 `elapsed >= DURATION` —— 于是「拉长」是
     *   **同一套动作慢放**，不是播两遍，也不需要任何模板配合
     *
     *   除法而不是乘法：除法天然把「实例秒」换算成「真实秒」，与 timeScale 的定义
     *   （真实秒 / 实例秒）一致，读代码时不用在脑子里翻转
     */
    track.instance.update(delta / track.timeScale);

    if (!track.instance.finished) {
      return true;
    }

    track.instance = undefined;

    if (track.closing) {
      return false;
    }

    // 窗内要循环撑满窗长；转场只在预览时循环
    if (track.feed || track.loop) {
      track.gapRemaining = LOOP_GAP;
      return true;
    }

    return false;
  }

  function createTrack(anchor: BarrageAnchor, playOptions?: PlayOptions): Track {
    const descriptor = getEffectTemplate(anchor.template);
    const effective: EffectParams = { ...descriptor?.defaults, ...anchor.params };
    const mode = resolveFeedMode(anchor, descriptor);

    return {
      anchor,
      base: effective,
      delivered: effective,
      // 0 = 立刻起播。之后每轮重建才走 LOOP_GAP
      gapRemaining: 0,
      loop: playOptions?.loop ?? false,
      feed: mode === 'static' ? undefined : createFeedWindow(feedOptionsOf(anchor, mode)),
      ratio: effective.ratio ?? 0.5,
      bias: effective.bias ?? 0,
      particles: effective.particles ?? 120,
      closing: false,
      timeScale: resolveTimeScale(anchor, descriptor),
      startedAt: performance.now(),
      // 缺省 false：绝大多数模板铺满播放器，只有红蓝对抗这类明确声明了才裁
      followArea: descriptor?.followBarrageArea ?? false,
    };
  }

  function play(anchor: BarrageAnchor, playOptions?: PlayOptions): void {
    const descriptor = getEffectTemplate(anchor.template);

    if (!descriptor || !effectTemplates[anchor.template]) {
      console.warn(`[barrage-effect] 未注册的特效模板：${anchor.template}`);
      return;
    }

    const size = getSize();
    if (size.width < 1 || size.height < 1) {
      return;
    }

    tracks.push(createTrack(anchor, playOptions));
  }

  /**
   * 换基准参数，热更新不重建
   * @desc 供工作台拖滑块用。工厂构造时会给每个粒子取随机数，
   *   每拖一下重建一次就是每秒重新随机 60 次，预览会疯狂闪烁
   */
  function updateParams(params: EffectParams): void {
    tracks.forEach(track => {
      track.base = params;

      // 互动窗：下一帧的读数会把它并进去，不用（也不该）现在直写 ——
      // 直写会先把驱动出来的 ratio / bias 冲掉，等下一帧才补回来
      if (track.feed) {
        return;
      }

      track.delivered = params;
      track.instance?.applyParams?.(params);
    });
  }

  function invalidate(): void {
    tracks.forEach(track => {
      track.instance = undefined;
      // 立刻重建，别等间隙
      track.gapRemaining = 0;
    });
  }

  function reset(): void {
    tracks.length = 0;
  }

  function tick(ctx: CanvasRenderingContext2D, delta: number): boolean {
    const now = performance.now();

    for (let index = tracks.length - 1; index >= 0; index -= 1) {
      if (!tickTrack(tracks[index], delta, now)) {
        tracks.splice(index, 1);
      }
    }

    if (tracks.length === 0) {
      return false;
    }

    /**
     * 粒子叠加发光
     * @desc save/restore 不是可选项：特效会把 globalAlpha 停在某个值上不还原，
     *   而 save/restore 本身会保存 globalCompositeOperation，所以必须在 save 之前设置
     */
    ctx.globalCompositeOperation = 'lighter';

    tracks.forEach(track => {
      if (!track.instance) {
        return;
      }

      ctx.save();

      /**
       * 弹幕区域：先移到区域原点，再裁掉溢出的粒子
       * @desc `translate` 放在 `clip` 之前，模板仍按 `(0, 0)` 起画 ——
       *   它们不知道区域在画布的哪个位置
       */
      if (track.area) {
        ctx.translate(track.area.x, track.area.y);
        ctx.beginPath();
        ctx.rect(0, 0, track.area.width, track.area.height);
        ctx.clip();
      }

      track.instance.draw(ctx);
      ctx.restore();
    });

    ctx.globalCompositeOperation = 'source-over';

    return true;
  }

  function getDebugState(): DriverDebugState | undefined {
    const track = tracks.find(item => item.feed);
    const feed = track?.feed;

    if (!track || !feed) {
      return undefined;
    }

    return {
      mode: feed.mode,
      ratio: track.ratio,
      bias: track.bias,
      count: track.lastReading?.count ?? 0,
      primary: track.lastReading?.primary ?? 0,
      secondary: track.lastReading?.secondary ?? 0,
      remaining: feed.remaining(performance.now()),
    };
  }

  return { play, updateParams, invalidate, tick, reset, getDebugState };
};
