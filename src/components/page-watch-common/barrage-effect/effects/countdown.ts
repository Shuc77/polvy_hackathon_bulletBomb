/**
 * @file 文字倒计时（纯转场）
 * @desc ★ 唯一一个「与弹幕无关」的模板：不读 ratio、不读 bias、不参与收集窗，
 *   只看时间轴 —— 命中锚点就开始倒数，观众实时看着数字往下走。
 *
 *   字形是**粒子拼的**，不是一个 fillText 画出来的大字。两个阶段：
 *
 *   1. **入场**：散在四周的像素聚成首位数（`GATHER_SEC`）。这是一次性的。
 *   2. **跳字**：之后每跳一秒，粒子贴着新数字的轮廓流过去 —— 不是「散开再重聚」，
 *      那放到秒级倒计时上等于每分钟把文字炸开重组 60 次，盖在视频上非常吵。
 *
 *   ★ 这两件事**必须各用各的进度**。入场进度由 `elapsed` 驱动（只增不减），
 *   跳字进度是 `slot.progress`（`syncText` 每秒把它重置为 0）。
 *   早期版本想让入场复用 `slot.progress`，那会让数字**每秒散开重聚一次** ——
 *   正好就是上面那条被禁止的事。
 *
 *   它有意打破了另外六个模板共守的两条约定，都是必要的：
 *
 *   1. **时长由 params 派生**（`countdownSec`），不是模块常量。倒计时的时长本来就是
 *      发布者要配的东西，写死没有意义。`applyParams` 改它只影响何时结束，不重建实例。
 *      （对比：另外六个模板的 DURATION 全是模块常量，`finished` 一律 `elapsed >= DURATION`。）
 *      时间轴上的条带长度就是改这个值，见 `../span.ts`。
 *
 *   2. **自己声明 `source-over` 并画一层暗底**。合成器现在统一走实体混色，
 *      但倒计时是给人读的：白字在亮画面上必须靠衬底才立得住，
 *      不能指望宿主或视频本身。合成器在 `draw()` 外有 `save/restore`，改完会被复原。
 *
 *   粒子是**贴图**不是 `arc`：逐粒子建路径（两遍、一千三百多个）在这里是实打实的
 *   每帧开销，而底下压着实时视频。见 `SPRITE_STEPS`。
 *   同样**不用 `shadowBlur`** —— 逐次绘制都要走一遍模糊核，比上面那条更贵。
 */
import {
  buildGlyphFields,
  invalidateGlyphCache,
  type GlyphField,
  type GlyphPoint,
} from './glyph-field';
import { createRoundSprite } from './particle-sprite';
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

export const COUNTDOWN_DEFAULTS: EffectParams = {
  colorPrimary: '#ffffff',
  colorSecondary: '#4f7cff',
  centerX: 0.5,
  centerY: 0.5,
  countdownSec: 300,
  caption: '距离开始还有',
  /** 每个数字槽的粒子数。取滑块上限，和改造前每个字 300 粒的观感基本一致 */
  particles: 280,
};

const DEFAULT_SECONDS = 300;
const MIN_SECONDS = 3;
const MAX_SECONDS = 3599;

/**
 * 时长上下界，导出给 `../span.ts` 用
 * @desc 别名导出**同一份定义**，不是并列再写一对常量 —— 两处各写一份的话，
 *   「模板里钳 3 秒、时间轴上允许拖到 2 秒」这种偏差会静默存在
 */
export { MIN_SECONDS as COUNTDOWN_MIN_SEC, MAX_SECONDS as COUNTDOWN_MAX_SEC };

/** 入场淡入时长，单位：秒 */
const FADE_IN = 0.4;

/** 收尾淡出时长，单位：秒 */
const FADE_OUT = 1;

/** 每秒跳字时的搏动衰减速度（越大越干脆） */
const BEAT_DECAY = 0.14;

/** 每秒跳字时的缩放幅度 */
const BEAT_SCALE = 0.06;

const FONT_STACK = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

/**
 * 入场聚合时长，单位：秒
 * @desc 刻意**短于 1 秒**：倒计时在 `elapsed` 跨过整秒时跳第一次字
 *   （`formatClock` 是向上取整），入场晚于那一刻就会被第一次形变打断
 */
const GATHER_SEC = 0.9;

/** 入场逐粒子错峰的幅度，相对于入场时长的比例 */
const GATHER_STAGGER = 0.34;

/** 一个字形的形变时长，单位：秒。比一秒短得多，跳字要干脆 */
const MORPH_SEC = 0.42;

/**
 * 逐粒子错峰的幅度，单位：形变进度的比例
 * @desc 所有粒子同时到位看着像整块贴图在平移；错开一点才是「粒子流过去」
 */
const MORPH_STAGGER = 0.32;

/**
 * 每个数字槽的**满采样**粒子数，也是配置的上限
 * @desc 字形场一次采满这么多点，滑杆调小只是从里面均匀抽稀 ——
 *   按配置值直接重建字形场的话，拖一次滑杆要重采 11 个字形，必然卡顿
 */
const DIGIT_PARTICLES = 300;

/** 冒号槽在满采样时的粒子数。它的笔画面积小得多，给同样多只是浪费 */
const COLON_PARTICLES = 120;

/** 滑杆的上下限。下限沿用其它模板，低于它看不出字形 */
const MIN_PARTICLES = 20;
const MAX_PARTICLES = DIGIT_PARTICLES;

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

/**
 * 粒子贴图的绘制边长相对粒子直径的倍数
 * @desc 贴图自带柔和的透明外圈，所以「辉光」不需要第二遍绘制 ——
 *   它是贴图本身的一部分，一次 drawImage 同时给出圆、辉光和颜色
 */
const SPRITE_SCALE = 3.1;

/**
 * 颜色量化档数
 * @desc ★ 贴图必须预渲染且**按颜色分档**：给每个粒子单独建一块画布是灾难，
 *   而 `drawImage` 又不能给贴图上色。所以把主色→辅色的渐变切成 16 档，
 *   每个粒子取最近的一档。16 档在一条渐变上肉眼分不出台阶
 */
const SPRITE_STEPS = 16;

/** 成形后呼吸飘动的频率与振幅（振幅相对粒子直径） */
const DRIFT_FREQ_X = 1.7;
const DRIFT_FREQ_Y = 1.31;
const DRIFT_AMP = 0.55;

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
  /**
   * 当前要画多少粒子
   * @desc 可改：滑杆调「粒子数量」时只动这个数，字形场保持满采样，
   *   绘制时按比例均匀抽稀（见 `drawSlot`）
   */
  count: number;
  /**
   * 逐粒子的贴图档位
   * @desc ★ 按**字形场点下标**存，长度固定为 `DIGIT_PARTICLES` ——
   *   抽稀后画的是场里的第 0、k、2k… 个点，下标会顶到 299，
   *   按当前 `count` 分配数组会越界读成 undefined
   */
  readonly tints: number[];
  /**
   * 逐粒子的**散开起点**，归一化到字形盒（可以落在盒外）
   * @desc 只在这个空间里表达。`drawSlot` 的插值用的就是盒坐标，
   *   「散到整个画布」在这里没有对应物，硬做要给每个槽再加一套映射。
   *   长度同样固定为 `DIGIT_PARTICLES`，理由见 `tints`
   */
  readonly scatter: GlyphPoint[];
  /** 当前显示的字符 */
  glyph: string;
  /** 形变起点字符 */
  from: string;
  /** 0 → 1 的形变进度。★ 只归跳字用，入场另有进度 */
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
   *   颜色表不会被建出来，整屏粒子会没有贴图可读
   */
  let primary = '';
  let secondary = '';
  let centerX = size.width / 2;
  let centerY = size.height / 2;

  let elapsed = 0;

  /**
   * 字号同时受宽高约束
   * @desc ★ 只按高度算是个真 bug：五个槽加起来是 3.14 倍字号宽，
   *   工作台预览画布一窄就直接溢出画布。`width / 3.4` 给这条链留了余量
   */
  const fontSize = clamp(Math.min(size.height * 0.28, size.width / 3.4), 24, 240);
  const font = `700 ${Math.round(fontSize)}px ${FONT_STACK}`;
  const sampleBox = { width: DIGIT_BOX.width * fontSize, height: DIGIT_BOX.height * fontSize };

  /**
   * 字形场
   * @desc 一次把 11 个字形全采出来。每个大约几毫秒，加起来是构造期的一次性开销；
   *   换来的是跳字时零重新采样 —— 每秒一次的重采样会在跳字那一刻掉帧，
   *   而跳字恰恰是最需要顺的时刻
   */
  let fields: Map<string, GlyphField> = buildGlyphFields(GLYPH_SET, {
    font,
    box: sampleBox,
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
          box: sampleBox,
          count: DIGIT_PARTICLES,
          step: SAMPLE_STEP,
        });
      })
      .catch(() => {
        // 拿不到就用后备字体的形状，能看，不该因此报错
      });
  }

  /** 主色→辅色的量化贴图，`rebuildPalette` 里填 */
  let sprites: HTMLCanvasElement[] = [];

  function createSlots(): Slot[] {
    return SLOT_KINDS.map(kind => {
      const count = kind === 'colon' ? COLON_PARTICLES : DIGIT_PARTICLES;

      return {
        kind,
        count,
        tints: [],
        // 按满采样长度分配，抽稀后按下标取值不会越界
        scatter: new Array<GlyphPoint>(DIGIT_PARTICLES),
        glyph: '0',
        from: '0',
        // 构造时直接从终态开始：首帧不该有一次多余的形变
        // （入场另有进度，见 `drawSlot`）
        progress: 1,
      };
    });
  }

  const slots: Slot[] = createSlots();

  /**
   * 重建贴图与槽内档位
   * @desc 档位按粒子的**规范位置**混，不按它在字形里的实际坐标 ——
   *   否则每次跳字粒子都会换色，等于给画面加了一层无意义的闪烁。
   *   规范位置 = 槽序号 + 槽内序号，与显示的是哪个字无关
   */
  function rebuildPalette(): void {
    const baseRgb = hexToRgb(primary);
    const highlightRgb = hexToRgb(secondary);

    sprites = Array.from({ length: SPRITE_STEPS }, (_, step) => {
      const amount = step / (SPRITE_STEPS - 1);

      // 解析不了就整份退回主色，至少不是一块黑
      const color = baseRgb && highlightRgb ? mixToCss(baseRgb, highlightRgb, amount) : primary;

      return createRoundSprite(color);
    });

    slots.forEach((slot, slotIndex) => {
      // 按满采样长度铺满：抽稀后仍按字形场下标取档位，与当前 count 无关
      for (let index = 0; index < DIGIT_PARTICLES; index += 1) {
        const blend = (slotIndex + index / Math.max(1, DIGIT_PARTICLES - 1)) / slots.length;

        slot.tints[index] = Math.round(clamp(blend, 0, 1) * (SPRITE_STEPS - 1));

        // 散开起点：绕着字形盒一圈偏外的位置，角度与半径都只由 seed 决定。
        // 用 Math.random 的话每帧都会重新散一次
        const angle = particleSeed(index * 3 + 1) * Math.PI * 2;
        const radius = 0.8 + particleSeed(index * 7 + 5) * 1.15;

        slot.scatter[index] = {
          x: 0.5 + Math.cos(angle) * radius * 0.95,
          y: 0.5 + Math.sin(angle) * radius * 0.75,
        };
      }
    });
  }

  function applyParams(params: EffectParams): void {
    /**
     * ★ 必须先挡非有限值再钳制：`clamp` **挡不住 `NaN`**（`Math.max(NaN, 3)` 就是 `NaN`），
     *   而 `total` 一旦是 NaN，下面 `finished` 的 `elapsed >= total` **永远为 false** ——
     *   实例永不结束，驱动器于是每帧都要求继续，共享 rAF 被永久钉住
     */
    const requested = Number(params.countdownSec);

    total = Number.isFinite(requested)
      ? Math.round(clamp(requested, MIN_SECONDS, MAX_SECONDS))
      : DEFAULT_SECONDS;

    caption = params.caption ?? (COUNTDOWN_DEFAULTS.caption as string);
    centerX = (params.centerX ?? COUNTDOWN_DEFAULTS.centerX!) * size.width;
    centerY = (params.centerY ?? COUNTDOWN_DEFAULTS.centerY!) * size.height;

    /**
     * 粒子数：只改每个槽画多少个，字形场不重建
     * @desc 满采样是 `DIGIT_PARTICLES` 个点，配置值不能超过它；
     *   冒号按满采样时的比例跟着缩放，否则数字变稀了冒号还是一样密
     */
    const requestedParticles = Number(params.particles ?? COUNTDOWN_DEFAULTS.particles);
    const digitCount = Number.isFinite(requestedParticles)
      ? Math.round(clamp(requestedParticles, MIN_PARTICLES, MAX_PARTICLES))
      : (COUNTDOWN_DEFAULTS.particles as number);
    const colonCount = Math.max(1, Math.round((digitCount * COLON_PARTICLES) / DIGIT_PARTICLES));

    slots.forEach(slot => {
      slot.count = slot.kind === 'colon' ? colonCount : digitCount;
    });

    const nextPrimary = params.colorPrimary ?? (COUNTDOWN_DEFAULTS.colorPrimary as string);
    const nextSecondary = params.colorSecondary ?? (COUNTDOWN_DEFAULTS.colorSecondary as string);

    // 只在真的变了才重算：驱动器对互动轨道是每帧调 applyParams 的，
    // 这里虽然是 static 不会被那样调，但别给以后埋一个「每帧造 16 张画布」的坑
    if (nextPrimary !== primary || nextSecondary !== secondary) {
      primary = nextPrimary;
      secondary = nextSecondary;
      rebuildPalette();
    }
  }

  // primary 初值为空串，所以这次一定会建贴图
  applyParams(initialParams);

  /**
   * 把槽位对齐到首个显示值
   * @desc `createSlots()` 跑在 `applyParams` 之前（它要用 slots 建贴图），
   *   所以这里的 `total` 才是最终值。对齐完把 `progress` 顶回 1 —— 入场是
   *   「散开 → 聚成这个数」，不该先来一次形变
   */
  syncText(formatClock(total));
  slots.forEach(slot => {
    slot.progress = 1;
  });

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

  function drawCaption(ctx: CanvasRenderingContext2D, alpha: number): void {
    if (!caption) {
      return;
    }

    ctx.globalAlpha = alpha;
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
   * @desc 每个粒子：算它在哪个阶段（入场还是跳字）、插值出位置、叠一点飘动、画一张贴图
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
    const spriteSize = particleSize * SPRITE_SCALE;
    const top = centerY - box.height / 2;

    /**
     * 从满采样的字形场里**均匀抽稀**
     * @desc 场里的点已经按质心角度升序，直接取前 `count` 个只会留下一个扇形，
     *   数字会缺掉大半个。按 `fieldCount / count` 的步长横跨整个数组，
     *   抽出来才是「同一字形、密度更低」。起点和终点用同一个下标，
     *   形变对应关系不会被抽稀打乱
     */
    const fieldCount = toField.points.length;
    const count = Math.min(slot.count, fieldCount);
    const step = fieldCount / Math.max(1, count);

    for (let index = 0; index < count; index += 1) {
      const pointIndex = Math.floor(index * step);
      const target = toField.points[pointIndex];
      const origin = fromField.points[pointIndex];
      const scatter = slot.scatter[pointIndex];

      if (!target || !origin || !scatter) {
        continue;
      }

      // 逐粒子错峰：seed 靠近 1 的粒子晚一点出发。入场与跳字共用同一个 seed，
      // 所以一个粒子在两种阶段里的「早晚」是一致的，看着像同一批粒子
      const seed = particleSeed(pointIndex);
      const entering = elapsed < GATHER_SEC;

      let source: GlyphPoint;
      let eased: number;

      if (entering) {
        const local = clamp(
          (elapsed / GATHER_SEC - seed * GATHER_STAGGER) / (1 - GATHER_STAGGER),
          0,
          1,
        );

        source = scatter;
        eased = easeOutCubic(local);
      } else {
        const local = clamp((slot.progress - seed * MORPH_STAGGER) / (1 - MORPH_STAGGER), 0, 1);

        // 还没出发的粒子停在上一个字形的位置上，所以它们是「等在那」而不是凭空出现
        source = origin;
        eased = easeOutCubic(local);
      }

      let x = left + (source.x + (target.x - source.x) * eased) * box.width;
      let y = top + (source.y + (target.y - source.y) * eased) * box.height;

      // 落位之后的呼吸飘动。★ 必须是 `elapsed` 的纯函数，不能累加 ——
      // 累加的话飘动速度会跟着时间缩放的系数一起变
      if (!entering) {
        const drift = particleSize * DRIFT_AMP * (0.35 + seed * 0.65);

        x += Math.sin(elapsed * DRIFT_FREQ_X + seed * 6.283) * drift;
        y += Math.cos(elapsed * DRIFT_FREQ_Y + seed * 4.71) * drift;
      }

      // ★ 每一处 globalAlpha 都要**再乘上入场/收尾的 alpha** ——
      // 直接赋 1 会把外面那层淡入淡出整个盖掉，首尾变成硬闪
      ctx.globalAlpha = alpha * (0.35 + eased * 0.65);

      const sprite = sprites[slot.tints[pointIndex]];
      if (sprite) {
        ctx.drawImage(sprite, x - spriteSize / 2, y - spriteSize / 2, spriteSize, spriteSize);
      }
    }
  }

  function drawDigits(ctx: CanvasRenderingContext2D, remaining: number, alpha: number): void {
    const beat = beatIntensity(remaining);
    const scale = 1 + beat * BEAT_SCALE;

    const totalWidth = slots.reduce((sum, slot) => sum + boxOf(slot, scale).width, 0);
    let left = centerX - totalWidth / 2;

    slots.forEach(slot => {
      drawSlot(ctx, slot, left, scale, alpha);
      left += boxOf(slot, scale).width;
    });
  }

  /** 底下一条总进度：观众看得见「还剩多少比例」，不只是数字 */
  function drawProgress(ctx: CanvasRenderingContext2D, remaining: number, alpha: number): void {
    // 别超出画布 —— 数字那行已经按宽度收敛过了，这条横条也得跟着收敛
    const width = Math.min(fontSize * 5.4, size.width * 0.82);
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

      // 文案与进度条等粒子聚拢得差不多再出现 —— 它们和入场抢视线的话，
      // 「散开的像素聚成数字」这件事就看不见了
      const chrome = clamp((elapsed - GATHER_SEC * 0.6) / 0.4, 0, 1);

      if (chrome > 0) {
        drawCaption(ctx, alpha * chrome);
        drawProgress(ctx, remaining, alpha * chrome);
      }

      drawDigits(ctx, remaining, alpha);

      ctx.globalAlpha = previousAlpha;
      ctx.globalCompositeOperation = previousComposite;
    },

    applyParams,
  };
};
