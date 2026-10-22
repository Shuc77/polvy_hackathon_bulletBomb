/**
 * @file 汇聚吸入特效
 * @desc 冲击波的反向：粒子自画面外缘被吸向一点，越靠近越快、越亮，最后收束成一次闪光。
 *
 *   填了 `answerText` 之后它会多走一段：观众的回答被漩涡吸进中心，**同一批粒子**
 *   再按字错峰飞向答案的字形采样点，把答案直接「拼」出来 —— 和文字倒计时一样，
 *   文字是粒子形成的，不是另一层 `fillText` 突然盖上去。
 *   这条扩展是为答题/揭晓场景准备的 —— 可以是「A」也可以是「光合作用」这种整句话。
 *
 *   ★ `answerText` 为空时，逐帧行为与旧版完全一致。这是兼容旧配置的底线：
 *   旧存档、旧分享链接里没有这个字段，它们看到的必须还是那次 1.6 秒的闪光。
 */
import { buildGlyphField } from './glyph-field';
import { createRoundSprite } from './particle-sprite';
import { estimateTextUnits, splitIntoLines } from './text-metrics';
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

const DURATION = 1.6;

/** 导出给注册表当 `naturalSec` 用。别名导出**同一份定义**，不会再写第二遍 */
export { DURATION as CONVERGE_DURATION };

/** 答案揭晓的默认 / 上下界，导出给 `span.ts` 与参数面板共用 */
export const CONVERGE_ANSWER_DURATION = 7;
export const CONVERGE_ANSWER_MIN_SEC = 5;
export const CONVERGE_ANSWER_MAX_SEC = 12;

const MIN_PARTICLES = 20;
const MAX_PARTICLES = 500;

/** 收束闪光在进度条的这个位置开始 */
const FLASH_AT = 0.78;

/** 黄金角，让粒子均匀铺满一圈 */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * 答案形态的阶段比例
 * @desc 7 秒总长下：吸入约 3.2 秒（46%），粒子拼字约 2 秒（28%），
 *   停留约 1 秒，最后 0.7 秒淡出。比例而不是绝对秒数 ——
 *   作者把条带拖长时，所有阶段一起变慢
 */
const ABSORB_RATIO = 0.46;
const FORM_RATIO = 0.28;
const FADE_SEC = 0.7;

/** 逐字成形：单字时长相对成形窗口的比例，以及上下限（秒） */
const FORM_CHAR_RATIO = 0.55;
const FORM_CHAR_MIN_SEC = 0.5;
const FORM_CHAR_MAX_SEC = 1.3;

/** 成形时逐粒子错峰的幅度，相对单字时长 */
const FORM_PARTICLE_STAGGER = 0.28;

/**
 * 字形采样密度
 * @desc 以 `MAX_FONT` 下的字数宽为基准：一个字宽约 430 个点，拉丁按字宽折算。
 *   小字号按面积平方缩小 —— 字只有 20px 时还塞 430 个点，粒子会挤成一片亮斑。
 *
 *   ★ 这个值直接决定字清不清楚：原来的 110 点（56px 下）相邻粒子的实心核
 *   连不上，中文的多笔画字形只剩一团发光的点。现在 72px 下 430 点、56px 下
 *   约 260 点，两种字号的点距都约 2.2px，和实心核直径相当，笔画才能连成线
 */
const ANSWER_POINTS_PER_UNIT = 430;
const MIN_POINTS_PER_CHAR = 8;

/**
 * 答案模式内部补足的粒子上限
 * @desc 字形要读得出来，粒子数必须覆盖采样点。作者配的 200 个点铺不满
 *   一整句，所以答案模式会自动补到采样点数；这个上限防止超长答案拖垮帧率
 */
const ANSWER_MAX_PARTICLES = 3000;

/** 答案最多显示多少个字。手改地址栏也不能把排版撑爆 */
const MAX_ANSWER_CHARS = 80;

/**
 * 最多拆几行
 * @desc 正常情况下是 1~2 行；4 行是给「小画布 + 80 字长答案」的兜底，
 *   否则字号会被压到 12px 以下仍然溢出
 */
const MAX_ANSWER_LINES = 4;

const MIN_FONT = 12;
/**
 * 答案字号上限
 * @desc 56px 在一屏播放器里偏小，尤其长句会被压成一排小点。72px 的高度
 *   仍只占单行块的 17% 左右，不会盖住画面主要内容
 */
const MAX_FONT = 72;
const ANSWER_WIDTH_RATIO = 0.82;
const ANSWER_HEIGHT_RATIO = 0.34;
const LINE_HEIGHT_RATIO = 1.15;

/**
 * 吸入阶段最多展示多少条答题原文
 * @desc 6 条时只够看到「有几条弹幕」，撑不起「所有回答都被吸进来」的规模感。
 *   14 条分两圈错开飞入，再多就会在画面上糊成一团
 */
const MAX_SAMPLE_TEXTS = 14;
const SAMPLE_MAX_CHARS = 16;

const FONT_STACK = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

/** 默认参数，同时是「恢复默认」的目标值 */
export const CONVERGE_DEFAULTS: EffectParams = {
  particles: 200,
  colorPrimary: '#7c5cff',
  colorSecondary: '#2ee6a8',
  ratio: 0.5,
  bias: 0,
  centerX: 0.5,
  centerY: 0.5,
  answerText: '',
  revealSec: CONVERGE_ANSWER_DURATION,
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

/**
 * 答案字形上的一个粒子落点
 * @desc 由字形采样得到，坐标已经是画布像素。粒子按索引均匀映射到这些点，
 *   所以落点总数少于粒子数时会有小幅度的重复，靠抖动错开
 */
interface AnswerTarget {
  x: number;
  y: number;
  /** 属于第几个可见字，决定成形的起跑时间 */
  charOrder: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 缓入：越接近中心越快，「被吸」的加速感全靠它 */
function easeInCubic(progress: number): number {
  return progress * progress * progress;
}

/** 缓出：粒子从中心铺到字形上，先快后慢 */
function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

/** 稳定的逐粒子权重。不用 Math.random：位置一旦重排，观感就散 */
function particleSeed(index: number): number {
  return ((index * 9301 + 49297) % 233280) / 233280;
}

/** 圆角矩形路径。不用 `ctx.roundRect`：它的浏览器覆盖还不够 */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** 截断到指定字符数，按码点而不是 UTF-16 单元数 */
function clampText(text: string, maxChars: number): string {
  // 换行与连续空白压成单个空格：canvas 的 fillText 不认换行，
  // 而多行输入框里按一下 Enter 就会混进 \n
  const chars = Array.from(text.replace(/\s+/g, ' ').trim());

  return chars.length > maxChars ? chars.slice(0, maxChars).join('') : chars.join('');
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
  let centerX = size.width / 2;
  let centerY = size.height / 2;
  let sinkX = size.width / 2;
  let sinkY = size.height / 2;
  let maxRadius = Math.hypot(size.width, size.height) * 0.62;

  let elapsed = 0;

  /**
   * 驻留请求
   * @desc ★ 和 `answerActive` 分开存。驱动器在实例刚建好时就调 `setSustain(true)`，
   *   那时作者可能还没填答案；之后才填上答案时，这次驻留请求应该立刻生效，
   *   否则答案只亮默认的 7 秒就重来一轮
   */
  let sustainRequested = false;

  /** 关窗时刻的 elapsed；非 undefined 表示正在走收尾淡出 */
  let closingElapsed: number | undefined;

  /* ---------------- 答案形态的状态 ---------------- */

  let answerText = '';
  let revealSec = CONVERGE_ANSWER_DURATION;

  /** 答案字形的粒子落点。粒子按索引均匀铺到这些点上 */
  let answerTargets: AnswerTarget[] = [];
  /** 可见字数（不含空格），逐字错峰的节拍总数 */
  let answerDrawCount = 0;
  let answerBox: EffectSize = { width: 1, height: 1 };
  /** 答案块的水平中心。排版时算好固定下来，bias 变化时暗底不会和字错位 */
  let answerCenter = size.width / 2;
  /** 整个答案块的高度，给局部暗底用 */
  let answerBlockHeight = MIN_FONT * LINE_HEIGHT_RATIO;
  let answerFont = `700 ${MIN_FONT}px ${FONT_STACK}`;
  let answerFontSize = MIN_FONT;
  /** 答案文案 + 尺寸的指纹。只有它变了才重新采样字形 */
  let answerSignature = '';

  /** 粒子贴图。按颜色缓存，换色才重建 */
  let primarySprite: HTMLCanvasElement | undefined;
  let secondarySprite: HTMLCanvasElement | undefined;
  let spritePrimary = '';
  let spriteSecondary = '';

  /** 吸入阶段画出来的答题原文，首次拿到非空读数时冻结 */
  let sampleTexts: string[] = [];
  let samplesFrozen = false;

  function answerActive(): boolean {
    return answerText.length > 0;
  }

  function absorbSec(): number {
    return revealSec * ABSORB_RATIO;
  }

  /** 整句答案逐字拼出来占用的时间窗 */
  function formWindowSec(): number {
    return revealSec * FORM_RATIO;
  }

  /** 只有「答案模式 + 收集窗还开着」才算驻留 */
  function effectiveSustain(): boolean {
    return sustainRequested && answerActive();
  }

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

  /**
   * 重建答案的逐字排版与字形采样点
   *
   * @desc ★ 用指纹守卫，绝不每帧重排。互动模式下 `applyParams` 是每帧调的，
   *   而一次采样要造离屏画布 + `getImageData`，每帧做一次会直接掉帧。
   *   粒子数不进指纹 —— 落点固定，粒子只是铺上去。
   *
   *   每个可见字单独采一个字形场：盒子以字心为中心，宽度取字宽的 1.16 倍
   *   （给笔画留边），高度取 1.3 倍字号。采样器按盒中心绘制，所以盒宽不会
   *   改变字的水平位置
   */
  function rebuildAnswerLayout(): void {
    const signature = `${answerText}|${Math.round(size.width)}x${Math.round(size.height)}`;

    if (signature === answerSignature) {
      return;
    }

    answerSignature = signature;

    if (!answerText) {
      answerTargets = [];
      answerDrawCount = 0;
      answerBlockHeight = MIN_FONT * LINE_HEIGHT_RATIO;
      return;
    }

    const units = Math.max(0.56, estimateTextUnits(answerText));
    const maxWidth = size.width * ANSWER_WIDTH_RATIO;
    const maxBlockHeight = size.height * ANSWER_HEIGHT_RATIO;

    // 按「最小字号下每行能放多少字宽」决定拆几行，最多 4 行
    const minUnitsPerLine = Math.max(1, maxWidth / MIN_FONT);
    const lineCount = clamp(Math.ceil(units / minUnitsPerLine), 1, MAX_ANSWER_LINES);
    const lines = splitIntoLines(answerText, Math.ceil(units / lineCount), lineCount);

    if (lines.length === 0) {
      answerTargets = [];
      answerDrawCount = 0;
      answerBlockHeight = MIN_FONT * LINE_HEIGHT_RATIO;
      return;
    }

    const maxLineUnits = Math.max(...lines.map(estimateTextUnits), 1);

    /**
     * 每个字最多分到多少个采样点
     * @desc 总点数按 `ANSWER_MAX_PARTICLES` 封顶，并把预算**平均分给每个可见字**。
     *   不能只靠最后的粒子数截断：那会先按全密度采出几千个点再整体抽稀，
     *   既白做一遍采样，也容易出现某些字分得多、某些字分得少。
     *   平均分配是整句一起变稀，读起来仍然是完整的
     */
    const visibleCharCount = lines.reduce(
      (sum, line) => sum + Array.from(line).filter(char => char.trim().length > 0).length,
      0,
    );
    const perCharBudget = Math.max(
      MIN_POINTS_PER_CHAR,
      Math.floor(ANSWER_MAX_PARTICLES / Math.max(1, visibleCharCount)),
    );

    /**
     * ★ 两行以上时字号上限要按**总块高**再除行距
     * @desc 只按单行高度算的话，两行会撑到画面 78% 高 —— 字比答案本身还抢眼
     */
    const maxFontByHeight = maxBlockHeight / (1 + LINE_HEIGHT_RATIO * (lines.length - 1));
    const fontSize = clamp(Math.min(maxFontByHeight, maxWidth / maxLineUnits), MIN_FONT, MAX_FONT);
    const lineHeight = fontSize * LINE_HEIGHT_RATIO;

    answerFontSize = fontSize;
    answerFont = `700 ${Math.round(fontSize)}px ${FONT_STACK}`;
    answerBox = {
      width: Math.max(fontSize, fontSize * maxLineUnits + fontSize * 0.2),
      height: fontSize * 1.3,
    };
    answerBlockHeight = (lines.length - 1) * lineHeight + fontSize * 1.3;

    /**
     * 逐字排版 + 采样
     * @desc 行内按估算字宽从左往右排。空格占位但不采样，
     *   所以成形节拍只数可见字 —— 否则长句里的空格会偷走一段动画时间
     */
    answerCenter = answerCenterX();
    const centerAnswer = answerCenter;
    const firstLineY = centerY - ((lines.length - 1) * lineHeight) / 2;
    const targets: AnswerTarget[] = [];
    let drawIndex = 0;

    lines.forEach((line, lineIndex) => {
      const lineWidth = estimateTextUnits(line) * fontSize;
      let cursorX = centerAnswer - lineWidth / 2;

      Array.from(line).forEach(char => {
        const width = estimateTextUnits(char) * fontSize;

        if (char.trim().length === 0) {
          cursorX += width;
          return;
        }

        const charUnits = Math.max(0.3, estimateTextUnits(char));
        const boxWidth = Math.max(fontSize * 0.3, width * 1.16);
        const boxHeight = fontSize * 1.3;
        // 采样点随字号面积缩放：大字号要密，小字号密了只会糊成一团
        const density = (fontSize / MAX_FONT) ** 2;
        const field = buildGlyphField(char, {
          font: answerFont,
          box: { width: boxWidth, height: boxHeight },
          count: Math.max(
            MIN_POINTS_PER_CHAR,
            Math.min(perCharBudget, Math.round(ANSWER_POINTS_PER_UNIT * charUnits * density)),
          ),
          step: 2,
        });

        if (!field.empty) {
          const left = cursorX + width / 2 - boxWidth / 2;
          const top = firstLineY + lineIndex * lineHeight - boxHeight / 2;

          field.points.forEach(point => {
            targets.push({
              x: left + point.x * boxWidth,
              y: top + point.y * boxHeight,
              charOrder: drawIndex,
            });
          });
        }

        drawIndex += 1;
        cursorX += width;
      });
    });

    answerTargets = targets;
    answerDrawCount = drawIndex;
  }

  /** 冻结吸入阶段要画的原文。之后不随每帧读数换池，否则吸到一半字会全变 */
  function freezeSamples(params: EffectParams): void {
    if (samplesFrozen) {
      return;
    }

    const texts = params.barrageTexts;
    if (!texts || texts.length === 0) {
      return;
    }

    const unique: string[] = [];

    texts.forEach(text => {
      const trimmed = text.trim();

      if (!trimmed || unique.includes(trimmed)) {
        return;
      }

      unique.push(trimmed);
    });

    if (unique.length > 0) {
      sampleTexts = unique.slice(0, MAX_SAMPLE_TEXTS);
      samplesFrozen = true;
    }
  }

  function applyParams(params: EffectParams): void {
    ratio = clamp(params.ratio ?? CONVERGE_DEFAULTS.ratio!, 0, 1);
    bias = clamp(params.bias ?? CONVERGE_DEFAULTS.bias!, -1, 1);
    primary = params.colorPrimary ?? CONVERGE_DEFAULTS.colorPrimary!;
    secondary = params.colorSecondary ?? CONVERGE_DEFAULTS.colorSecondary!;

    // 贴图按颜色缓存，拖调色板时最多每帧重建两张 32px 画布
    if (primary !== spritePrimary || secondary !== spriteSecondary) {
      spritePrimary = primary;
      spriteSecondary = secondary;
      // 拼字用实心核更大的贴图：默认粒子的外晕占半径 58%，字会糊
      primarySprite = createRoundSprite(primary, { coreRatio: 0.72 });
      secondarySprite = createRoundSprite(secondary, { coreRatio: 0.72 });
    }

    centerX = (params.centerX ?? CONVERGE_DEFAULTS.centerX!) * size.width;
    centerY = (params.centerY ?? CONVERGE_DEFAULTS.centerY!) * size.height;

    // bias 把汇聚点推向一侧：得票多的一侧成为「漩涡中心」
    sinkX = centerX + bias * size.width * 0.2;
    sinkY = centerY;
    maxRadius = Math.hypot(size.width, size.height) * 0.62;

    const requestedReveal = Number(params.revealSec);
    revealSec = Number.isFinite(requestedReveal)
      ? clamp(requestedReveal, CONVERGE_ANSWER_MIN_SEC, CONVERGE_ANSWER_MAX_SEC)
      : CONVERGE_ANSWER_DURATION;

    answerText = clampText(params.answerText ?? '', MAX_ANSWER_CHARS);
    rebuildAnswerLayout();

    const baseParticles = Math.round(
      clamp(params.particles ?? CONVERGE_DEFAULTS.particles!, MIN_PARTICLES, MAX_PARTICLES),
    );
    // 答案模式：粒子必须铺满字形采样点，否则拼出来的字是残缺的
    const targetParticles = answerActive()
      ? Math.max(baseParticles, answerTargets.length)
      : baseParticles;

    syncParticles(clamp(targetParticles, MIN_PARTICLES, ANSWER_MAX_PARTICLES));

    freezeSamples(params);
  }

  applyParams(initialParams);

  /**
   * 字体可能还没就绪
   * @desc 与倒计时同一套处理：首屏第一次构造时量到的是后备字体的宽。
   *   字宽只影响排版，但字体一换，同样字号的真实宽度会变、行宽就偏了。
   *   就绪后按当前指纹重排一次
   */
  const fontReady = document.fonts?.ready;
  if (fontReady) {
    fontReady
      .then(() => {
        answerSignature = '';
        rebuildAnswerLayout();
      })
      .catch(() => {
        // 拿不到就用后备字体的形状，能看，不该因此报错
      });
  }

  /* ---------------- 通用绘制 ---------------- */

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

  /** 原版的一次径向闪光 */
  function drawOriginalFlash(ctx: CanvasRenderingContext2D, progress: number): void {
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

  /* ---------------- 原版（无答案） ---------------- */

  function drawOriginalParticles(ctx: CanvasRenderingContext2D): void {
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

  function drawOriginal(ctx: CanvasRenderingContext2D): void {
    const progress = clamp(elapsed / DURATION, 0, 1);

    ctx.save();
    drawContractingRing(ctx, progress);
    drawOriginalParticles(ctx);
    drawOriginalFlash(ctx, progress);
    ctx.restore();
  }

  /* ---------------- 答案形态 ---------------- */

  /** 答案区域的水平中心，夹在画布内，避免 bias 把长句推出边缘 */
  function answerCenterX(): number {
    const half = answerBox.width / 2;
    const min = half + 8;
    const max = size.width - half - 8;

    if (max <= min) {
      return size.width / 2;
    }

    return clamp(sinkX, min, max);
  }

  /**
   * 吸入阶段的运动学位置
   *
   * @desc 三条曲线叠出「被吸」的物理感，而不是直线插值：
   *   1. 半径按缓入缩小 —— 外圈几乎不动，越靠近中心掉得越快；
   *   2. 角度随吸入进度旋转，方向和强度由粒子种子决定 —— 形成漩涡；
   *   3. 同一函数可以用稍早的时刻再采一次，两点连线就是速度方向的拖尾。
   *
   *   全部是 `absorption` 的纯函数，不累加状态，暂停 / 拖进度条都不会漂
   */
  function absorbPoseOf(
    particle: Particle,
    absorption: number,
  ): { x: number; y: number; distance: number } {
    const t = clamp(absorption, 0, 1);
    const isPrimary = particle.colorSeed < ratio;
    const favor = isPrimary ? 1 + bias * 0.25 : 1 - bias * 0.25;
    const distance = particle.startDistance * favor * maxRadius * (1 - easeInCubic(t));
    const seed = particleSeed(particle.index * 13 + 5);
    const swirlDirection = seed > 0.5 ? 1 : -1;
    const swirl = swirlDirection * (0.35 + seed * 1.35) * easeInCubic(t);
    const angle = particle.angle + swirl;

    return {
      x: sinkX + Math.cos(angle) * distance,
      y: sinkY + Math.sin(angle) * distance,
      distance,
    };
  }

  /**
   * 吸入 → 粒子拼字
   *
   * @desc 和文字倒计时同一套思路：答案不是 `fillText` 画上去的，而是**同一批
   *   粒子**落到字形采样点上拼出来的。吸入结束时粒子已经聚在中心，随后按字
   *   错峰沿螺旋线飞向各自的目标点 —— 漩涡散开就是文字，中间没有「粒子淡出、
   *   文字凭空出现」的交接缝。
   *
   *   两点细节：
   *   1. 拖尾按**像素**封顶。缓入末尾粒子速度极高，若只按固定时间差采点，
   *      尾巴会越来越长。
   *   2. 落点按索引均匀映射并加稳定抖动：粒子数多于落点时，重复落点不会
   *      叠成一个亮斑
   */
  function drawAnswerParticles(ctx: CanvasRenderingContext2D, fade: number): void {
    const absorb = absorbSec();
    const formWindow = formWindowSec();
    const charSec = clamp(formWindow * FORM_CHAR_RATIO, FORM_CHAR_MIN_SEC, FORM_CHAR_MAX_SEC);
    const stagger =
      answerDrawCount > 1 ? Math.max(0, formWindow - charSec) / (answerDrawCount - 1) : 0;
    const totalTargets = answerTargets.length;
    const particleCount = Math.max(1, particles.length);
    /**
     * 拼字时的粒子直径
     * @desc 约字号的 7.5%。采样点距在字与字之间基本恒定（点数按字号面积缩放），
     *   所以尺寸也不能随字号缩得太小 —— 否则小字号的实心核又连不上
     */
    const spriteSize = clamp(answerFontSize * 0.075, 2.2, 4.4);

    particles.forEach(particle => {
      // 逐粒子延迟：早入场的先到中心，画面才有层次
      const absorption = clamp(
        (elapsed - particle.delay) / Math.max(0.1, absorb - particle.delay),
        0,
        1,
      );
      const isPrimary = particle.colorSeed < ratio;
      const color = isPrimary ? primary : secondary;

      // ---------- 吸入阶段：漩涡 + 速度线 ----------
      if (elapsed < absorb) {
        const pose = absorbPoseOf(particle, absorption);
        const alpha = (0.3 + absorption * 0.7) * fade;

        if (absorption > 0.08) {
          const tail = absorbPoseOf(particle, absorption - 0.08);
          const dx = pose.x - tail.x;
          const dy = pose.y - tail.y;
          const length = Math.hypot(dx, dy);
          const cap = Math.max(6, particle.size * 2.5);

          if (length > 0.1) {
            // 超出封顶就沿速度方向把尾巴裁短，只保留靠近粒子的那一段
            const scale = Math.min(1, cap / length);

            ctx.globalAlpha = alpha * 0.34 * (1 - absorption * 0.5);
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(0.8, particle.size * 0.9);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(pose.x - dx * scale, pose.y - dy * scale);
            ctx.lineTo(pose.x, pose.y);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
          pose.x,
          pose.y,
          Math.max(0.6, particle.size * (1 - absorption * 0.6)),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        return;
      }

      // ---------- 成形阶段：从漩涡中心飞向字形落点 ----------
      const target =
        totalTargets > 0
          ? answerTargets[Math.floor((particle.index * totalTargets) / particleCount)]
          : undefined;

      if (!target) {
        // 答案里没有可采样的字（理论上不会走到）：中心散开淡出兜底
        const post = clamp((elapsed - absorb) / Math.max(0.1, formWindow), 0, 1);
        const alpha = (1 - post) * (1 - post) * 0.8 * fade;

        if (alpha <= 0.01) {
          return;
        }

        const seed = particleSeed(particle.index * 13 + 5);
        const drift = maxRadius * 0.06 * easeOutCubic(post);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
          sinkX + Math.cos(particle.angle + seed * 3) * drift,
          sinkY + Math.sin(particle.angle + seed * 3) * drift,
          Math.max(0.5, particle.size * 0.4),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        return;
      }

      const seed = particleSeed(particle.index);
      const charStart = absorb + target.charOrder * stagger;
      const delay = seed * charSec * FORM_PARTICLE_STAGGER;
      const local = clamp((elapsed - charStart - delay) / Math.max(0.1, charSec - delay), 0, 1);
      const eased = easeOutCubic(local);

      // 同一落点可能被多个粒子共享，加一点稳定抖动。
      // 幅度必须远小于采样点距（约 2px），否则字的边缘会重新散开
      const jitter = answerFontSize * 0.01;
      const targetX = target.x + (particleSeed(particle.index * 17 + 3) - 0.5) * jitter;
      const targetY = target.y + (particleSeed(particle.index * 29 + 7) - 0.5) * jitter;

      /**
       * 螺旋出中心
       * @desc 直接线性插值会像被磁铁吸住一样笔直弹过去。这里用极坐标：
       *   角度从「目标角再倒转一个 whirl」收拢到目标角，半径从中心小轨道
       *   扩到目标半径 —— 粒子是旋着飞出去的，终点仍然精确落在目标上
       */
      const orbitRadius = Math.max(1, maxRadius * 0.018);
      const targetAngle = Math.atan2(targetY - sinkY, targetX - sinkX);
      const targetRadius = Math.hypot(targetX - sinkX, targetY - sinkY);
      const whirl = (seed > 0.5 ? 1 : -1) * (0.35 + seed * 0.9);
      const angle = targetAngle - whirl * (1 - eased);
      const radius = orbitRadius + (targetRadius - orbitRadius) * eased;

      let x = sinkX + Math.cos(angle) * radius;
      let y = sinkY + Math.sin(angle) * radius;

      // 落位后的呼吸飘动。必须是 elapsed 的纯函数，不能累加。
      // 振幅压在 1px 以内：再大一点，实心核就连不上相邻采样点了
      if (local >= 1) {
        const drift = Math.max(0.3, answerFontSize * 0.006) * (0.35 + seed * 0.65);

        x += Math.sin(elapsed * 1.7 + seed * 6.283) * drift;
        y += Math.cos(elapsed * 1.31 + seed * 4.71) * drift;
      }

      const sprite = isPrimary ? primarySprite : secondarySprite;

      if (!sprite) {
        return;
      }

      const drawSize = spriteSize * (0.85 + seed * 0.3);

      ctx.globalAlpha = (0.35 + eased * 0.65) * fade;
      ctx.drawImage(sprite, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);
    });
  }

  /** 答案形态的闪光：起点与吸入结束对齐，而不是按总时长的 78% */
  function drawAnswerFlash(ctx: CanvasRenderingContext2D, fade: number): void {
    const absorb = absorbSec();
    const flashAt = absorb * FLASH_AT;

    if (elapsed < flashAt) {
      return;
    }

    const flashProgress = clamp((elapsed - flashAt) / Math.max(0.1, absorb - flashAt), 0, 1);
    const radius = Math.max(maxRadius * 0.34 * flashProgress, 1);
    const gradient = ctx.createRadialGradient(sinkX, sinkY, 0, sinkX, sinkY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    gradient.addColorStop(0.4, primary);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.globalAlpha = (1 - flashProgress) * fade;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sinkX, sinkY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 把观众的回答作为可读的弹幕胶囊吸进中心
   *
   * @desc 「收集」这件事要看得见。粒子只是抽象的点，原文被吸进去才是
   *   「所有回答都被收下了」的直接证据。
   *
   *   ★ 只描边 + 彩字在亮视频上会糊成一片（实测几乎看不见），所以每条回答
   *   都做成深色胶囊 + 派别色描边 + 白字：对比度来自胶囊本身，不再依赖背景。
   *   淡出推迟到最后 30% —— 吸入过程中要一直读得清，别还没看清就没影了
   */
  function drawAbsorbSamples(ctx: CanvasRenderingContext2D, fade: number): void {
    const absorb = absorbSec();
    if (sampleTexts.length === 0 || elapsed >= absorb) {
      return;
    }

    // 跟着答案字号走，但设下限：13px 在 1080p 上根本读不出来
    const fontSize = clamp(Math.round(answerFontSize * 0.36), 14, 24);
    const intro = clamp(elapsed / 0.25, 0, 1);
    const count = sampleTexts.length;
    /**
     * 起吸半径
     * @desc 按 `maxRadius` 铺开时，很多标签一开始在画布外，前半段根本看不见。
     *   这里按画布短边收一圈，保证 14 条从第一帧起就在画面里
     */
    const reach = Math.min(maxRadius * 0.55, Math.min(size.width, size.height) * 0.42);

    ctx.font = `600 ${fontSize}px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    sampleTexts.forEach((text, index) => {
      const seed = particleSeed(index * 11 + 7);
      // 两圈错开半径，14 条不会挤在同一圈上
      const ring = index % 2 === 0 ? 1 : 0.7;
      const baseAngle = index * GOLDEN_ANGLE + (seed - 0.5) * 0.6;
      // 错峰出发：最后一条大约到吸入时长的三分之一才开始动
      const start = (index / Math.max(1, count - 1)) * absorb * 0.32;
      const local = clamp((elapsed - start) / Math.max(0.2, absorb - start), 0, 1);
      const eased = easeInCubic(local);
      const distance = (0.6 + seed * 0.45) * ring * reach * (1 - eased);
      // 和粒子同方向的漩涡：越靠近中心转得越快
      const swirlDirection = seed > 0.5 ? 1 : -1;
      const angle = baseAngle + swirlDirection * eased * (0.8 + seed * 1.6);
      const x = sinkX + Math.cos(angle) * distance;
      const y = sinkY + Math.sin(angle) * distance;
      // 最后 30% 才淡出，前面一直保持可读
      const fadeOut = 1 - clamp((local - 0.7) / 0.3, 0, 1);
      const alpha = intro * fadeOut * 0.96 * fade;

      if (alpha <= 0.01) {
        return;
      }

      const label = clampText(text, SAMPLE_MAX_CHARS);
      const textWidth = ctx.measureText(label).width;
      const padX = fontSize * 0.45;
      const chipWidth = textWidth + padX * 2;
      const chipHeight = fontSize * 1.55;
      const accent = index % 2 === 0 ? primary : secondary;
      const scale = 1 - eased * 0.22;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(swirlDirection * eased * 0.32);
      ctx.scale(scale, scale);

      // 深色胶囊：亮视频上也能读清
      ctx.globalAlpha = alpha * 0.82;
      ctx.fillStyle = 'rgba(9, 13, 20, 0.84)';
      roundRectPath(ctx, -chipWidth / 2, -chipHeight / 2, chipWidth, chipHeight, chipHeight / 2);
      ctx.fill();

      // 派别色描边，仍能一眼分出 A / B
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(1, fontSize * 0.07);
      ctx.stroke();

      ctx.fillStyle = '#f7f9ff';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });
  }

  /**
   * 答案身后的局部暗底
   * @desc 粒子拼出的字要在亮画面上读得清。只在答案块附近压暗，不做整屏遮罩 ——
   *   那会把视频主要内容一起盖住。形状是椭圆，跟着多行答案的高度走
   */
  function drawAnswerScrim(ctx: CanvasRenderingContext2D, fade: number): void {
    const start = absorbSec();

    if (elapsed < start || answerTargets.length === 0) {
      return;
    }

    const intensity = clamp((elapsed - start) / 0.8, 0, 1) * fade;

    if (intensity <= 0.01) {
      return;
    }

    const width = Math.max(answerBox.width, answerFontSize * 2);
    const height = Math.max(answerBlockHeight, answerFontSize * 1.4);
    const radius = width * 0.72;
    const squash = height / width;

    ctx.save();
    ctx.translate(answerCenter, centerY);
    // 纵向压扁成椭圆；渐变与圆弧一起被压，读起来仍是一块柔和的椭圆
    ctx.scale(1, squash);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${(0.38 * intensity).toFixed(3)})`);
    gradient.addColorStop(0.62, `rgba(0, 0, 0, ${(0.26 * intensity).toFixed(3)})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function envelopeAlpha(): number {
    if (!answerActive()) {
      return 1;
    }

    if (closingElapsed !== undefined) {
      return clamp(1 - (elapsed - closingElapsed) / FADE_SEC, 0, 1);
    }

    if (effectiveSustain()) {
      return 1;
    }

    return clamp((revealSec - elapsed) / FADE_SEC, 0, 1);
  }

  function drawAnswer(ctx: CanvasRenderingContext2D): void {
    const fade = envelopeAlpha();

    if (fade <= 0) {
      return;
    }

    ctx.save();

    ctx.globalCompositeOperation = 'source-over';
    drawContractingRing(ctx, clamp(elapsed / absorbSec(), 0, 1));
    // 暗底垫在粒子和原文下面，只压暗答案块附近
    drawAnswerScrim(ctx, fade);
    drawAnswerParticles(ctx, fade);
    drawAnswerFlash(ctx, fade);

    // 原文胶囊最后画：吸入阶段它们不能被粒子盖住
    drawAbsorbSamples(ctx, fade);

    ctx.restore();
  }

  /**
   * 收进 / 退出驻留
   * @desc 没有答案文案时**完全不介入**：旧配置在收集窗里靠「整轮循环」撑满，
   *   这里要是改了 finished 的语义，旧特效会从循环变成钉死。
   *
   *   有答案时：开窗钉住包络、答案停留呼吸；关窗从**当前时刻**开始 0.6 秒淡出。
   *   不把 elapsed 硬对齐到某个阶段 —— 窗比揭晓短时硬对齐会把「吸入」直接跳掉
   */
  function setSustain(next: boolean): void {
    if (!answerActive()) {
      sustainRequested = next;
      closingElapsed = undefined;
      return;
    }

    if (next) {
      sustainRequested = true;
      closingElapsed = undefined;
      return;
    }

    if (!sustainRequested || closingElapsed !== undefined) {
      return;
    }

    sustainRequested = false;
    closingElapsed = elapsed;
  }

  return {
    get finished(): boolean {
      if (!answerActive()) {
        return elapsed >= DURATION;
      }

      if (closingElapsed !== undefined) {
        return elapsed >= closingElapsed + FADE_SEC;
      }

      if (effectiveSustain()) {
        return false;
      }

      return elapsed >= revealSec;
    },

    update(delta: number): void {
      elapsed += delta;
    },

    draw(ctx: CanvasRenderingContext2D): void {
      if (answerActive()) {
        drawAnswer(ctx);
        return;
      }

      drawOriginal(ctx);
    },

    applyParams,

    setSustain,
  };
};
