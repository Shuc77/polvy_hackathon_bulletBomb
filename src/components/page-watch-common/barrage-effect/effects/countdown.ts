/**
 * @file 文字倒计时（纯转场）
 * @desc ★ 唯一一个「与弹幕无关」的模板：不读 ratio、不读 bias、不参与收集窗，
 *   只看时间轴 —— 命中锚点就开始倒数，观众实时看着数字往下走。
 *
 *   字形是**粒子拼的**，不是一个 fillText 画出来的大字。散开的粒子聚成首位数，
 *   之后每跳一秒，粒子贴着新数字的轮廓流过去 —— 不是「散开再重聚」，
 *   那放到秒级倒计时上等于每分钟把文字炸开重组 60 次，盖在视频上非常吵。
 *   形变的对应关系由 `glyph-field` 负责，见那个文件头。
 *
 *   它有意打破了另外六个模板共守的两条约定，都是必要的：
 *
 *   1. **时长由 params 派生**（`countdownSec`），不是模块常量。倒计时的时长本来就是
 *      发布者要配的东西，写死没有意义。`applyParams` 改它只影响何时结束，不重建实例。
 *      （对比：另外六个模板的 DURATION 全是模块常量，`finished` 一律 `elapsed >= DURATION`。）
 *
 *   2. **自己把 globalCompositeOperation 改回 `source-over`**。合成器是按 `lighter`
 *      加法混合调用 `draw()` 的 —— 那对粒子很漂亮，但白字叠在亮画面上会糊掉。
 *      倒计时是给人读的，可读性优先。合成器在 `draw()` 外有 `save/restore`，改完会被复原。
 *
 *   另外**不用 `shadowBlur` 做发光**：canvas 2D 的 shadowBlur 是逐次绘制都要走一遍
 *   模糊核，上千个粒子加上它就是十几毫秒一帧，而它下面还压着实时视频。
 *   这里改成「先画一遍放大的低透明度副本」当辉光，两遍 fillRect 就够，成本可以忽略。
 */
import { buildGlyphFields, invalidateGlyphCache, type GlyphField } from './glyph-field';
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

export const COUNTDOWN_DEFAULTS: EffectParams = {
  colorPrimary: '#ffffff',
  colorSecondary: '#4f7cff',
  centerX: 0.5,
  centerY: 0.5,
  countdownSec: 300,
  caption: '距离开始还有',
};

const DEFAULT_SECONDS = 300;
const MIN_SECONDS = 3;
const MAX_SECONDS = 3599;

/** 入场淡入时长，单位：秒 */
const FADE_IN = 0.4;

/** 收尾淡出时长，单位：秒 */
const FADE_OUT = 1;

/** 每秒跳字时的搏动衰减速度（越大越干脆） */
const BEAT_DECAY = 0.14;

/** 每秒跳字时的缩放幅度 */
const BEAT_SCALE = 0.06;

const FONT_STACK = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

/** 一个字形的形变时长，单位：秒。比一秒短得多，跳字要干脆 */
const MORPH_SEC = 0.42;

/**
 * 逐粒子错峰的幅度，单位：形变进度的比例
 * @desc 所有粒子同时到位看着像整块贴图在平移；错开一点才是「粒子流过去」
 */
const MORPH_STAGGER = 0.32;

/** 每个数字槽的粒子数 */
const DIGIT_PARTICLES = 300;

/** 冒号槽的粒子数。它的笔画面积小得多，给同样多只是浪费 */
const COLON_PARTICLES = 120;

/** 采样盒相对字号的比例。所有字形共用同一套比例，槽位才对得齐 */
const DIGIT_BOX = { width: 0.7, height: 1.3 };
const COLON_BOX = { width: 0.34, height: 1.3 };

/** 采样初始步长（像素） */
const SAMPLE_STEP = 4;

/** 显示模板：两位分、冒号、两位秒 */
const SLOT_KINDS = ['digit', 'digit', 'colon', 'digit', 'digit'] as const;

const GLYPH_SET = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':'];

/** 粒子边长相对字号的比例 */
const PARTICLE_SIZE_RATIO = 0.028;

/** 辉光副本的放大倍数与透明度 */
const BLOOM_SCALE = 2.4;
const BLOOM_ALPHA = 0.16;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** 向上取整到秒：剩 299.4 秒时显示 05:00 而不是 04:59，读起来更符合直觉 */
function formatClock(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;

  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb | undefined {
  const clean = hex.replace('#', '').trim();

  // 只认 6 位十六进制。`rgb()`、颜色名一律当解析失败，退回不混色
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return undefined;
  }

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function mixToCss(from: Rgb, to: Rgb, amount: number): string {
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);

  return `rgb(${mix(from.r, to.r)}, ${mix(from.g, to.g)}, ${mix(from.b, to.b)})`;
}

/** 稳定的逐粒子权重。不用 Math.random：位置一旦重排，观感就散 */
function particleSeed(index: number): number {
  return ((index * 9301 + 49297) % 233280) / 233280;
}

interface Slot {
  readonly kind: 'digit' | 'colon';
  readonly count: number;
  /** 槽内粒子的稳定颜色，构造时定好 */
  readonly colors: string[];
  /** 当前显示的字符 */
  glyph: string;
  /** 形变起点字符 */
  from: string;
  /** 0 → 1 的形变进度 */
  progress: number;
}

export const createCountdown: EffectFactory = (
  initialParams: EffectParams,
  size: EffectSize,
): EffectInstance => {
  let total = DEFAULT_SECONDS;
  let caption = COUNTDOWN_DEFAULTS.caption as string;
  /**
   * 颜色留空，等第一次 applyParams 填
   * @desc 不预置成默认值：那样「传进来的就是默认色」时判等为真，
   *   颜色表不会被建出来，整屏粒子会没有 fillStyle 可读
   */
  let primary = '';
  let secondary = '';
  let centerX = size.width / 2;
  let centerY = size.height / 2;

  let elapsed = 0;

  // 字号只由画布高度决定，而画布尺寸在构造时就固化了 —— 所以字形场建一次就够
  const fontSize = clamp(size.height * 0.22, 28, 190);
  const font = `700 ${Math.round(fontSize)}px ${FONT_STACK}`;

  /**
   * 字形场
   * @desc 一次把 11 个字形全采出来。每个大约几毫秒，加起来是构造期的一次性开销；
   *   换来的是跳字时零重新采样 —— 每秒一次的重采样会在跳字那一刻掉帧，
   *   而跳字恰恰是最需要顺的时刻
   */
  let fields: Map<string, GlyphField> = buildGlyphFields(GLYPH_SET, {
    font,
    box: { width: DIGIT_BOX.width * fontSize, height: DIGIT_BOX.height * fontSize },
    count: DIGIT_PARTICLES,
    step: SAMPLE_STEP,
  });

  /**
   * 字体可能还没就绪
   * @desc 首屏第一次构造时 `document.fonts` 里可能还没有这个字体，采出来的是
   *   后备字体的形状。等字体全部就绪后重建一次即可 —— 已经加载过的字体这里会立刻
   *   兑现，重建等于空转，不会闪
   */
  const fontReady = document.fonts?.ready;
  if (fontReady) {
    fontReady
      .then(() => {
        // 见 `invalidateGlyphCache` 的注释：不清缓存的话这次重建会拿回后备字体的形状
        invalidateGlyphCache();

        fields = buildGlyphFields(GLYPH_SET, {
          font,
          box: { width: DIGIT_BOX.width * fontSize, height: DIGIT_BOX.height * fontSize },
          count: DIGIT_PARTICLES,
          step: SAMPLE_STEP,
        });
      })
      .catch(() => {
        // 拿不到就用后备字体的形状，能看，不该因此报错
      });
  }

  function createSlots(): Slot[] {
    return SLOT_KINDS.map(kind => ({
      kind,
      count: kind === 'colon' ? COLON_PARTICLES : DIGIT_PARTICLES,
      colors: [],
      glyph: '0',
      from: '0',
      // 构造时直接从终态开始：首帧不该有一次多余的形变
      progress: 1,
    }));
  }

  const slots: Slot[] = createSlots();

  /**
   * 重建槽内颜色表
   * @desc 颜色按粒子的**规范位置**混，不按它在字形里的实际坐标 ——
   *   否则每次跳字粒子都会换色，等于给画面加了一层无意义的闪烁。
   *   规范位置 = 槽序号 + 槽内序号，与显示的是哪个字无关
   */
  function rebuildColors(): void {
    const baseRgb = hexToRgb(primary);
    const highlightRgb = hexToRgb(secondary);

    slots.forEach((slot, slotIndex) => {
      for (let index = 0; index < slot.count; index += 1) {
        if (!baseRgb || !highlightRgb) {
          slot.colors[index] = primary;
          continue;
        }

        const blend = (slotIndex + index / Math.max(1, slot.count - 1)) / slots.length;
        slot.colors[index] = mixToCss(baseRgb, highlightRgb, clamp(blend, 0, 1));
      }
    });
  }

  function applyParams(params: EffectParams): void {
    total = Math.round(clamp(params.countdownSec ?? DEFAULT_SECONDS, MIN_SECONDS, MAX_SECONDS));
    caption = params.caption ?? (COUNTDOWN_DEFAULTS.caption as string);
    centerX = (params.centerX ?? COUNTDOWN_DEFAULTS.centerX!) * size.width;
    centerY = (params.centerY ?? COUNTDOWN_DEFAULTS.centerY!) * size.height;

    const nextPrimary = params.colorPrimary ?? (COUNTDOWN_DEFAULTS.colorPrimary as string);
    const nextSecondary = params.colorSecondary ?? (COUNTDOWN_DEFAULTS.colorSecondary as string);

    // 只在真的变了才重算：驱动器对互动轨道是每帧调 applyParams 的，
    // 这里虽然是 static 不会被那样调，但别给以后埋一个「每帧拼 1500 个颜色串」的坑
    if (nextPrimary !== primary || nextSecondary !== secondary) {
      primary = nextPrimary;
      secondary = nextSecondary;
      rebuildColors();
    }
  }

  // primary 初值为空串，所以这次一定会建颜色表
  applyParams(initialParams);

  /** 把显示文本同步进各槽，变了的槽重新开始一次形变 */
  function syncText(text: string): void {
    slots.forEach((slot, index) => {
      const next = text[index];

      if (!next || next === slot.glyph) {
        return;
      }

      slot.from = slot.glyph;
      slot.glyph = next;
      slot.progress = 0;
    });
  }

  /**
   * 跳字搏动
   * @desc `remaining` 每跨过一个整秒，小数部分就从 0.999 掉回 0 ——
   *   所以「离上次跳字过了多久」是 `1 - 小数部分`，用它做一个指数衰减的脉冲
   */
  function beatIntensity(remaining: number): number {
    const sinceBeat = 1 - (remaining - Math.floor(remaining));

    return Math.exp(-sinceBeat / BEAT_DECAY);
  }

  /** 衬底：保证在任何画面上都读得清，不做这层的话亮场里白字会化掉 */
  function drawScrim(ctx: CanvasRenderingContext2D): void {
    const radius = fontSize * 3.6;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCaption(ctx: CanvasRenderingContext2D): void {
    if (!caption) {
      return;
    }

    ctx.fillStyle = secondary;
    ctx.font = `500 ${Math.round(fontSize * 0.24)}px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(caption, centerX, centerY - fontSize * 0.86);
  }

  /** 槽的显示盒宽 / 高，单位：像素 */
  function boxOf(slot: Slot, scale: number): { width: number; height: number } {
    const ratio = slot.kind === 'colon' ? COLON_BOX : DIGIT_BOX;

    return { width: ratio.width * fontSize * scale, height: ratio.height * fontSize * scale };
  }

  /**
   * 一个槽的粒子
   * @desc 三件事：算这个粒子形变到哪（含逐粒子错峰）、插值出位置、画辉光与本体的两遍
   */
  function drawSlot(
    ctx: CanvasRenderingContext2D,
    slot: Slot,
    left: number,
    scale: number,
    alpha: number,
  ): void {
    const box = boxOf(slot, scale);
    const fromField = fields.get(slot.from);
    const toField = fields.get(slot.glyph);

    if (!toField || toField.empty || !fromField) {
      return;
    }

    const particleSize = Math.max(1, fontSize * scale * PARTICLE_SIZE_RATIO);
    const half = particleSize / 2;
    const bloomSize = particleSize * BLOOM_SCALE;
    const bloomHalf = bloomSize / 2;

    for (let index = 0; index < slot.count; index += 1) {
      const target = toField.points[index];
      const origin = fromField.points[index];

      if (!target || !origin) {
        continue;
      }

      // 逐粒子错峰：seed 靠近 1 的粒子晚一点出发
      const seed = particleSeed(index) * MORPH_STAGGER;
      const local = clamp((slot.progress - seed) / (1 - MORPH_STAGGER), 0, 1);
      const eased = easeOutCubic(local);

      const x = left + (origin.x + (target.x - origin.x) * eased) * box.width;
      const y = centerY - box.height / 2 + (origin.y + (target.y - origin.y) * eased) * box.height;

      // 还没出发的粒子停在上一个字形的位置上，所以它们是「等在那」而不是凭空出现
      ctx.fillStyle = slot.colors[index];

      // ★ 每一处 globalAlpha 都要**再乘上入场/收尾的 alpha** ——
      // 直接赋 1 会把外面那层淡入淡出整个盖掉，首尾变成硬闪
      ctx.globalAlpha = alpha * BLOOM_ALPHA * (0.4 + eased * 0.6);
      ctx.fillRect(x - bloomHalf, y - bloomHalf, bloomSize, bloomSize);

      ctx.globalAlpha = alpha * (0.45 + eased * 0.55);
      ctx.fillRect(x - half, y - half, particleSize, particleSize);
    }
  }

  function drawDigits(ctx: CanvasRenderingContext2D, remaining: number, alpha: number): void {
    const beat = beatIntensity(remaining);
    const scale = 1 + beat * BEAT_SCALE;

    const totalWidth = slots.reduce((sum, slot) => sum + boxOf(slot, scale).width, 0);
    let left = centerX - totalWidth / 2;

    ctx.globalAlpha = alpha;

    slots.forEach(slot => {
      drawSlot(ctx, slot, left, scale, alpha);
      left += boxOf(slot, scale).width;
    });
  }

  /** 底下一条总进度：观众看得见「还剩多少比例」，不只是数字 */
  function drawProgress(ctx: CanvasRenderingContext2D, remaining: number, alpha: number): void {
    const width = fontSize * 5.4;
    const height = Math.max(2, fontSize * 0.04);
    const left = centerX - width / 2;
    const top = centerY + fontSize * 0.82;
    const progress = clamp(remaining / total, 0, 1);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(left, top, width, height);

    ctx.fillStyle = secondary;
    ctx.fillRect(left, top, width * progress, height);
  }

  return {
    get finished(): boolean {
      return elapsed >= total;
    },

    update(delta: number): void {
      elapsed += delta;

      // 形变推进放在 update：draw 拿不到 delta
      slots.forEach(slot => {
        if (slot.progress < 1) {
          slot.progress = clamp(slot.progress + delta / MORPH_SEC, 0, 1);
        }
      });

      syncText(formatClock(Math.max(0, total - elapsed)));
    },

    draw(ctx: CanvasRenderingContext2D): void {
      const remaining = Math.max(0, total - elapsed);

      // 首尾淡入淡出；其余时间恒为 1
      const alpha = clamp(
        Math.min(elapsed / FADE_IN, remaining / Math.min(FADE_OUT, total * 0.25)),
        0,
        1,
      );
      if (alpha <= 0) {
        return;
      }

      const previousAlpha = ctx.globalAlpha;
      const previousComposite = ctx.globalCompositeOperation;

      // 见文件头第 2 条：倒计时是给人读的，必须离开加法混合
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha;

      drawScrim(ctx);
      drawCaption(ctx);
      drawDigits(ctx, remaining, alpha);
      drawProgress(ctx, remaining, alpha);

      ctx.globalAlpha = previousAlpha;
      ctx.globalCompositeOperation = previousComposite;
    },

    applyParams,
  };
};
