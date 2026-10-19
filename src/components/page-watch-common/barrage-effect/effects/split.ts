/**
 * @file 红蓝对抗分割特效
 * @desc 复刻直播 PK 里的「两派弹幕对冲」：
 *   - 红蓝两色的整条弹幕从左右外缘向中点推进，碰到中间的亮缝后**缓慢消融**；
 *   - 亮缝的位置由 `bias` 决定（票差），谁领先就把缝往对面推，左右拉扯；
 *   - 缝本身带高频抖动、染色光晕和向外飞散的火花/电弧，粒子用低透明度
 *     叠画出模糊感；
 *   - `ratio` 决定两派文字的亮度与光晕强弱。
 *
 *   特效层整体跑在 `lighter` 合成下，但**文字必须走 `source-over`** ——
 *   黑色描边在 `lighter` 里加的是 0，压不住底下的亮画面，字会糊在视频里。
 *   所以本模板在 draw 内自行切换合成方式，并包在自己的 save/restore 里。
 */
import type { EffectFactory, EffectInstance, EffectParams, EffectSize } from '../types';

/** 静态播放总时长。文字要跑到缝前再消融，比原来的 2.2 秒长一些 */
const DURATION = 3.4;

/** 导出给注册表当 `naturalSec` 用。别名导出**同一份定义**，不会再写第二遍 */
export { DURATION as SPLIT_DURATION };

/** 分割线的横向活动范围，防止贴边 */
const DIVIDER_RANGE = 0.35;

/** 出场后的整体淡出时长，单位：秒 */
const FADE_OUT = 0.6;

/** 文字从外缘冲向分割线的基准速度：占区域宽度的比例 / 秒 */
const TEXT_SPEED_RATIO = 0.2;

/** 窄画布下的最低速度，免得一条弹幕要跑半个动画时长 */
const MIN_TEXT_SPEED = 60;

/** 字号相对区域高度的比例与上下限（像素） */
const FONT_RATIO = 0.055;
const MIN_FONT = 12;
const MAX_FONT = 26;

/** 行高相对字号的倍数 */
const ROW_HEIGHT_RATIO = 1.75;

/** 最多几行；再多在播放器高度里会挤 */
const MAX_ROWS = 9;

/** 同一行两条弹幕之间至少留出几个字号的空隙 */
const ROW_GAP_RATIO = 1.2;

/** 一条弹幕从碰到分割线到完全消融的时长 */
const DISSOLVE_SEC = 0.8;

/** 每消融一条弹幕溅出的碎屑数 */
const DISSOLVE_FLAKES = 6;

/** 文字密度：每个粒子换算多少条弹幕（两侧各算） */
const TEXTS_PER_PARTICLE = 0.125;
const MIN_TEXTS = 8;
const MAX_TEXTS = 24;

/** 火花速率：每个粒子每秒多少颗 */
const SPARK_RATE_PER_PARTICLE = 0.2;
const MIN_SPARK_RATE = 12;
const MAX_SPARK_RATE = 60;

/** 巨量粒子下的硬上限 */
const MAX_SPARKS = 64;
const MAX_FLAKES = 160;

/**
 * 渐变里的「完全透明」端点
 * @desc 渐变的 alpha 只能写进颜色里，`globalAlpha` 是整块乘上去的，
 *   表达不了「从透明渐到实色」。提出来只是免得写六遍
 */
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** 没有弹幕原文时用的演示短语。静态驱动与刚拖进时间轴时都靠它 */
const FALLBACK_PRIMARY = [
  '红队必胜',
  '给我冲',
  '顶住',
  '火力全开',
  '别退',
  '压过去',
  '拿下',
  '再来一波',
];

const FALLBACK_SECONDARY = [
  '蓝队冲鸭',
  '守住',
  '反打',
  '不虚',
  '接招',
  '往前顶',
  '别想赢',
  '加把劲',
];

/** 默认参数，同时是「恢复默认」的目标值 */
export const SPLIT_DEFAULTS: EffectParams = {
  particles: 160,
  // 左红右蓝，与直播 PK 的常见配色一致
  colorPrimary: '#ff3553',
  colorSecondary: '#2f7bff',
  ratio: 0.5,
  bias: 0,
  centerX: 0.5,
  centerY: 0.5,
};

type Side = 'primary' | 'secondary';

const SIDES: Side[] = ['primary', 'secondary'];

interface BarrageTextItem {
  side: Side;
  text: string;
  /** primary（左侧）存右边缘；secondary（右侧）存左边缘 —— 都是**朝缝的那条边** */
  x: number;
  /** 行中心 */
  y: number;
  width: number;
  speed: number;
  /** 基础不透明度，随该派占比变化 */
  alpha: number;
  /** 0 = 正常；> 0 = 已消融的秒数 */
  dissolve: number;
  /** 这一条消融要多久（每条略有差别，避免整齐划一） */
  dissolveSpan: number;
  /** 抖动相位 */
  seed: number;
}

interface Spark {
  x: number;
  y: number;
  /** 上一帧位置，用来画拖尾 */
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
}

interface Flake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 估算一行文字的宽度
 * @desc 不用 `measureText`：它需要 ctx，而工厂构造时还没有画布。
 *   这里只用于「从哪儿开始跑」和碰撞时的条带裁剪，几个像素的误差看不出来。
 *   中日韩字符按一个字宽算，其余按 0.56 个
 */
function estimateTextWidth(text: string, fontSize: number): number {
  let units = 0;

  for (const char of Array.from(text)) {
    units += /[一-鿿]/.test(char) ? 1 : 0.56;
  }

  return Math.max(fontSize, units * fontSize);
}

export const createSplit: EffectFactory = (
  initialParams: EffectParams,
  size: EffectSize,
): EffectInstance => {
  const fontSize = Math.round(clamp(size.height * FONT_RATIO, MIN_FONT, MAX_FONT));
  const rowHeight = fontSize * ROW_HEIGHT_RATIO;
  const rowCount = Math.max(1, Math.min(MAX_ROWS, Math.floor(size.height / rowHeight)));
  const textSpeed = Math.max(size.width * TEXT_SPEED_RATIO, MIN_TEXT_SPEED);

  /**
   * 按「一条弹幕大约占三个字宽」估算每行能排几条
   * @desc 缩略图只有 76px 高、一百多像素宽，按粒子数算出来的密度会挤成一团。
   *   这里只限制**初始铺场**的密度，后续投放仍由 `rowFreeAt` 控制间距
   */
  const halfPath = Math.max(size.width / 2, fontSize * 4);
  const textsPerRowCap = Math.max(1, Math.floor(halfPath / (fontSize * 3)));
  const textSpaceCap = rowCount * textsPerRowCap;

  let ratio = 0.5;
  let bias = 0;
  let primary = SPLIT_DEFAULTS.colorPrimary!;
  let secondary = SPLIT_DEFAULTS.colorSecondary!;

  let elapsed = 0;
  /** 收集窗内驻留：包络钉死，永不出 finished */
  let sustain = false;

  /** 当前分割线位置（含高频抖动） */
  let seamX = size.width / 2;

  /** 两侧各最多同时存在多少条弹幕；由粒子数量换算，再被行数封顶 */
  let textBudget = 20;
  let sparkRate = 32;
  let maxSparks = 53;

  let poolA: string[] = [];
  let poolB: string[] = [];
  let cursorA = 0;
  let cursorB = 0;

  let spawnClockA = 0.08;
  let spawnClockB = 0.22;
  let sparkAccumulator = 0;

  const texts: BarrageTextItem[] = [];
  const sparks: Spark[] = [];
  const flakes: Flake[] = [];

  /**
   * 每一行下一次可以投放弹幕的时刻（实例秒）
   * @desc 同一行两条弹幕至少隔开「一个自身宽度 + 空隙」。不记纵坐标而是
   *   记这个时间，投放时只要找最早空出来的一行即可
   */
  const rowFreeAt: Record<Side, number[]> = {
    primary: new Array<number>(rowCount).fill(Number.POSITIVE_INFINITY),
    secondary: new Array<number>(rowCount).fill(Number.POSITIVE_INFINITY),
  };

  /** 整体淡出系数 */
  function envelopeFade(): number {
    return sustain ? 1 : clamp((DURATION - elapsed) / FADE_OUT, 0, 1);
  }

  /** 第 row 行的中心纵坐标 */
  function rowCenter(row: number): number {
    if (rowCount <= 1) {
      return size.height / 2;
    }

    const margin = fontSize * 0.9;
    const top = margin;
    const bottom = Math.max(top, size.height - margin);

    return top + ((bottom - top) * row) / (rowCount - 1);
  }

  /**
   * 参数热更新
   * @desc 不重建实例：文字的随机相位、正在跑的弹幕都保留着。
   *   随机量在构造时确定，来自 params 的量每一帧重新读
   */
  function applyParams(params: EffectParams): void {
    ratio = clamp(params.ratio ?? SPLIT_DEFAULTS.ratio!, 0, 1);
    bias = clamp(params.bias ?? SPLIT_DEFAULTS.bias!, -1, 1);
    primary = params.colorPrimary ?? SPLIT_DEFAULTS.colorPrimary!;
    secondary = params.colorSecondary ?? SPLIT_DEFAULTS.colorSecondary!;

    const particles = params.particles ?? SPLIT_DEFAULTS.particles!;

    textBudget = Math.min(
      rowCount * 3,
      textSpaceCap,
      Math.round(clamp(particles * TEXTS_PER_PARTICLE, MIN_TEXTS, MAX_TEXTS)),
    );
    sparkRate = clamp(particles * SPARK_RATE_PER_PARTICLE, MIN_SPARK_RATE, MAX_SPARK_RATE);
    maxSparks = Math.round(clamp(particles / 3, 16, MAX_SPARKS));

    /**
     * 原文池
     * @desc 优先用按阵营分好的；没有关键词配置时退到全量原文；
     *   静态驱动下两者都没有，用内置演示短语把画面撑起来。
     *   **池子一旦拿到真实文本就不再退回演示短语** —— 窗关掉后文字还会再跑一会儿，
     *   中途换池会让同一帧里的字突然全变
     */
    const all = params.barrageTexts;
    const sideA = params.barrageTextsA;
    const sideB = params.barrageTextsB;
    /**
     * 有关键词配置时，某一派暂时零命中也不该借用对面的原文 ——
     * 把蓝队的话顶在红队头上比暂时用演示短语更像 bug。
     * 两边都零命中（通常是压根没配关键词）才退回全量原文
     */
    const classified = (sideA?.length ?? 0) > 0 || (sideB?.length ?? 0) > 0;

    if (sideA && sideA.length > 0) {
      poolA = sideA;
    } else if (!classified && all && all.length > 0) {
      poolA = all;
    } else if (poolA.length === 0) {
      poolA = FALLBACK_PRIMARY;
    }

    if (sideB && sideB.length > 0) {
      poolB = sideB;
    } else if (!classified && all && all.length > 0) {
      poolB = all;
    } else if (poolB.length === 0) {
      poolB = FALLBACK_SECONDARY;
    }
  }

  function pickText(side: Side): string {
    const pool = side === 'primary' ? poolA : poolB;

    if (pool.length === 0) {
      return '';
    }

    const cursor = side === 'primary' ? cursorA : cursorB;
    const text = pool[cursor % pool.length];

    if (side === 'primary') {
      cursorA = cursor + 1;
    } else {
      cursorB = cursor + 1;
    }

    return text;
  }

  /** 当前分割线：bias 已被驱动器缓动过，这里只叠一层高频抖动 */
  function updateSeam(): void {
    const target = (0.5 + bias * DIVIDER_RANGE) * size.width;

    seamX = target + Math.sin(elapsed * 11.3) * 1.6 + Math.sin(elapsed * 7.7 + 1.3) * 1.1;
  }

  /** 一条弹幕碰到缝时溅出的碎屑：朝缝里飘，半秒内散尽 */
  function spawnDissolveFlakes(item: BarrageTextItem): void {
    const color = item.side === 'primary' ? primary : secondary;
    const dir = item.side === 'primary' ? 1 : -1;

    for (let index = 0; index < DISSOLVE_FLAKES; index += 1) {
      const life = 0.35 + Math.random() * 0.5;

      flakes.push({
        x: item.x + (Math.random() - 0.5) * 6,
        y: item.y + (Math.random() - 0.5) * fontSize * 0.8,
        vx: dir * (20 + Math.random() * 70),
        vy: (Math.random() - 0.5) * 70,
        life,
        maxLife: life,
        color,
        size: 1 + Math.random() * 2.2,
      });
    }

    if (flakes.length > MAX_FLAKES) {
      flakes.splice(0, flakes.length - MAX_FLAKES);
    }
  }

  /**
   * 投一条弹幕
   * @param progress 0 = 刚从外缘进场，1 = 已到缝前
   * @param initial 初始铺场：允许直接落在半路，也允许已经处于消融中
   */
  function spawnText(side: Side, row: number, progress: number, initial: boolean): void {
    const text = pickText(side);

    if (!text) {
      return;
    }

    const width = estimateTextWidth(text, fontSize);
    const gap = fontSize * ROW_GAP_RATIO;

    let actualProgress = clamp(progress, 0, 1);
    let dissolve = 0;

    if (initial && progress > 0.86 && Math.random() < 0.55) {
      // 一小部分初始弹幕直接以「正在消融」的样子出现，画面一开场就有冲突感
      actualProgress = 0.97 + Math.random() * 0.03;
      dissolve = Math.random() * DISSOLVE_SEC * 0.55 + 0.001;
    }

    const startX = side === 'primary' ? -width : size.width + width;
    const x = startX + (seamX - startX) * actualProgress;
    const speed = textSpeed * (0.97 + Math.random() * 0.06);

    const item: BarrageTextItem = {
      side,
      text,
      x,
      y: rowCenter(row),
      width,
      speed,
      alpha: 0.8 + (side === 'primary' ? ratio : 1 - ratio) * 0.18,
      dissolve,
      dissolveSpan: DISSOLVE_SEC * (0.8 + Math.random() * 0.5),
      seed: Math.random() * Math.PI * 2,
    };

    texts.push(item);

    // 这一行下一次能再放一条的时刻：等这条的尾部离开出生点
    const travel = side === 'primary' ? item.x + gap : size.width - item.x + gap;
    const release = elapsed + Math.max(0, travel) / speed;

    rowFreeAt[side][row] = initial ? Math.min(rowFreeAt[side][row], release) : release;

    if (dissolve > 0) {
      spawnDissolveFlakes(item);
    }
  }

  /**
   * 开场铺场
   * @desc 静态动画只有 3.4 秒，不能从空屏幕慢慢长出来 —— 先把两侧的弹幕
   *   撒在半路，第一帧就是「已经打起来了」的样子
   */
  function seedTexts(): void {
    const perSide = textBudget;

    /**
     * 没配关键词时两边共用同一个原文池
     * @desc 两条游标都从 0 开始的话，左右会**同时**出现同一句话，像照镜子。
     *   把 B 侧游标推开半个池子，同样的输入也会错开成一问一答
     */
    if (poolA === poolB) {
      cursorB = Math.floor(poolB.length / 2);
    }

    for (const side of SIDES) {
      for (let index = 0; index < perSide; index += 1) {
        const row = index % rowCount;
        // 整条路径均匀铺开：开场第一帧就要有贴着缝的弹幕，不能全挤在外缘
        const spread = perSide <= 1 ? 0.5 : index / (perSide - 1);
        const progress = clamp(0.08 + spread * 0.84 + (Math.random() - 0.5) * 0.06, 0.04, 0.96);

        spawnText(side, row, progress, true);
      }
    }

    // 没被初始弹幕占到的行立刻开放
    for (const side of SIDES) {
      for (let row = 0; row < rowCount; row += 1) {
        if (!Number.isFinite(rowFreeAt[side][row])) {
          rowFreeAt[side][row] = 0;
        }
      }
    }
  }

  /** 找一条已经空出来的行；没有就返回 -1，下一帧再试 */
  function pickRow(side: Side): number {
    let best = -1;
    let bestRelease = Number.POSITIVE_INFINITY;
    const releases = rowFreeAt[side];

    for (let row = 0; row < rowCount; row += 1) {
      if (releases[row] <= elapsed && releases[row] < bestRelease) {
        best = row;
        bestRelease = releases[row];
      }
    }

    return best;
  }

  function updateTexts(delta: number): void {
    const next: BarrageTextItem[] = [];

    for (const item of texts) {
      if (item.dissolve > 0) {
        item.dissolve += delta;

        if (item.dissolve < item.dissolveSpan) {
          next.push(item);
        }

        continue;
      }

      item.x += (item.side === 'primary' ? 1 : -1) * item.speed * delta;

      const reached = item.side === 'primary' ? item.x >= seamX : item.x <= seamX;

      if (reached) {
        // 不把它拉回 seamX：缝可能刚被拉到这条弹幕身侧，硬拉会看见一次瞬移。
        // 越过几像素由消融裁剪自己吃掉
        item.dissolve = 0.0001;
        spawnDissolveFlakes(item);
      }

      next.push(item);
    }

    texts.length = 0;
    texts.push(...next);
  }

  function spawnSpark(): void {
    const colorRoll = Math.random();
    // 五五开时让蓝侧拿加时：参考画面的缝是蓝白羽流，平票时偏白也偏冷
    const winner = ratio > 0.5 ? primary : secondary;
    const loser = ratio > 0.5 ? secondary : primary;
    const color = colorRoll < 0.55 ? '#ffffff' : colorRoll < 0.8 ? winner : loser;

    const life = 0.3 + Math.random() * 0.6;
    const y =
      size.height *
      clamp(0.5 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.34, 0.05, 0.95);

    sparks.push({
      x: seamX + (Math.random() - 0.5) * 3,
      y,
      px: seamX,
      py: y,
      vx: (Math.random() - 0.5) * 120,
      vy: (Math.random() - 0.5) * 120,
      life,
      maxLife: life,
      color,
      width: 0.8 + Math.random() * 1.4,
    });
  }

  function updateSparks(delta: number): void {
    sparkAccumulator += delta * sparkRate;

    const spawnCount = Math.floor(sparkAccumulator);
    sparkAccumulator -= spawnCount;

    for (let index = 0; index < spawnCount; index += 1) {
      if (sparks.length >= maxSparks) {
        break;
      }

      spawnSpark();
    }

    const next: Spark[] = [];

    for (const spark of sparks) {
      spark.life -= delta;

      if (spark.life <= 0) {
        continue;
      }

      spark.px = spark.x;
      spark.py = spark.y;
      spark.x += spark.vx * delta;
      spark.y += spark.vy * delta;
      spark.vx *= 0.98;
      spark.vy *= 0.98;
      next.push(spark);
    }

    sparks.length = 0;
    sparks.push(...next);
  }

  function updateFlakes(delta: number): void {
    const next: Flake[] = [];

    for (const flake of flakes) {
      flake.life -= delta;

      if (flake.life <= 0) {
        continue;
      }

      flake.x += flake.vx * delta;
      flake.y += flake.vy * delta;
      flake.vx *= 0.96;
      flake.vy *= 0.96;
      next.push(flake);
    }

    flakes.length = 0;
    flakes.push(...next);
  }

  function updateSpawn(delta: number): void {
    // 收尾阶段不再补新弹幕，让画面自然空下去
    if (!sustain && DURATION - elapsed <= FADE_OUT) {
      return;
    }

    let activeA = 0;
    let activeB = 0;

    for (const item of texts) {
      if (item.side === 'primary') {
        activeA += 1;
      } else {
        activeB += 1;
      }
    }

    if (activeA < textBudget) {
      spawnClockA -= delta;

      if (spawnClockA <= 0) {
        const row = pickRow('primary');

        if (row >= 0) {
          spawnText('primary', row, 0, false);
          spawnClockA = 0.1 + Math.random() * 0.12;
        } else {
          spawnClockA = 0.04;
        }
      }
    }

    if (activeB < textBudget) {
      spawnClockB -= delta;

      if (spawnClockB <= 0) {
        const row = pickRow('secondary');

        if (row >= 0) {
          spawnText('secondary', row, 0, false);
          spawnClockB = 0.1 + Math.random() * 0.12;
        } else {
          spawnClockB = 0.04;
        }
      }
    }
  }

  /** 两侧的底色：从外缘向缝渐强，给「两个阵营」一个空间感 */
  function drawWashes(ctx: CanvasRenderingContext2D, fade: number): void {
    if (seamX <= 0 || seamX >= size.width) {
      return;
    }

    ctx.globalCompositeOperation = 'source-over';

    ctx.globalAlpha = 0.16 * fade * (0.35 + ratio * 0.65);
    const left = ctx.createLinearGradient(0, 0, seamX, 0);
    left.addColorStop(0, TRANSPARENT);
    left.addColorStop(1, primary);
    ctx.fillStyle = left;
    ctx.fillRect(0, 0, seamX, size.height);

    ctx.globalAlpha = 0.16 * fade * (0.35 + (1 - ratio) * 0.65);
    const right = ctx.createLinearGradient(size.width, 0, seamX, 0);
    right.addColorStop(0, TRANSPARENT);
    right.addColorStop(1, secondary);
    ctx.fillStyle = right;
    ctx.fillRect(seamX, 0, size.width - seamX, size.height);
  }

  function drawTexts(ctx: CanvasRenderingContext2D, fade: number): void {
    if (texts.length === 0) {
      return;
    }

    // ★ 文字必须 source-over：黑色描边在 lighter 里加的是 0，等于没有
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `700 ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, fontSize * 0.16);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.82)';

    for (const item of texts) {
      const dissolveT = item.dissolve > 0 ? Math.min(item.dissolve / item.dissolveSpan, 1) : 0;
      const alpha = item.alpha * fade * Math.pow(1 - dissolveT, 0.9);

      if (alpha <= 0.01) {
        continue;
      }

      // 消融时越抖越弱，像被缝「吃」掉了
      const shake = dissolveT * 2.4;
      const drawX = item.x + Math.sin(elapsed * 43 + item.seed) * shake;
      const drawY = item.y + Math.cos(elapsed * 37 + item.seed * 1.7) * shake * 0.6;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (dissolveT > 0) {
        // 从靠近缝的一侧开始消失：剩下的部分一直缩到远离缝的那一端
        const visible = item.width * (1 - dissolveT);
        const clipX = item.side === 'primary' ? drawX - item.width : drawX + item.width * dissolveT;

        ctx.beginPath();
        ctx.rect(clipX, drawY - fontSize, visible, fontSize * 2);
        ctx.clip();
      }

      ctx.textAlign = item.side === 'primary' ? 'right' : 'left';
      ctx.strokeText(item.text, drawX, drawY);
      ctx.fillStyle = item.side === 'primary' ? primary : secondary;
      ctx.fillText(item.text, drawX, drawY);
      ctx.restore();
    }
  }

  /** 中间的亮缝：白光核心 + 两侧染色光晕 + 几根抖动的电弧丝 */
  function drawSeam(ctx: CanvasRenderingContext2D, fade: number): void {
    const coreWidth =
      Math.max(2, fontSize * 0.16) *
      (1 + Math.sin(elapsed * 13.1) * 0.25 + Math.sin(elapsed * 5.3 + 1.7) * 0.15);
    const glowWidth = Math.max(fontSize * 2.4, 40);

    ctx.globalCompositeOperation = 'lighter';

    ctx.globalAlpha = 0.35 * fade * (0.85 + 0.15 * Math.sin(elapsed * 9.7));
    const core = ctx.createLinearGradient(seamX - coreWidth * 2, 0, seamX + coreWidth * 2, 0);
    core.addColorStop(0, TRANSPARENT);
    core.addColorStop(0.5, '#ffffff');
    core.addColorStop(1, TRANSPARENT);
    ctx.fillStyle = core;
    ctx.fillRect(seamX - coreWidth * 2, 0, coreWidth * 4, size.height);

    ctx.globalAlpha = 0.14 * fade * (0.55 + ratio * 0.45);
    const leftGlow = ctx.createLinearGradient(seamX - glowWidth, 0, seamX, 0);
    leftGlow.addColorStop(0, TRANSPARENT);
    leftGlow.addColorStop(1, primary);
    ctx.fillStyle = leftGlow;
    ctx.fillRect(seamX - glowWidth, 0, glowWidth, size.height);

    ctx.globalAlpha = 0.14 * fade * (0.55 + (1 - ratio) * 0.45);
    const rightGlow = ctx.createLinearGradient(seamX + glowWidth, 0, seamX, 0);
    rightGlow.addColorStop(0, TRANSPARENT);
    rightGlow.addColorStop(1, secondary);
    ctx.fillStyle = rightGlow;
    ctx.fillRect(seamX, 0, glowWidth, size.height);

    // 电弧丝：每根一条轻微摆动的二次曲线，纯靠低透明度叠加出「电」的感觉
    for (let index = 0; index < 5; index += 1) {
      const drift = Math.sin(elapsed * (1.6 + index * 0.37) + index * 1.9) * glowWidth * 0.32;
      const alpha =
        (0.06 + Math.abs(Math.sin(elapsed * (1.1 + index * 0.23) + index)) * 0.08) * fade;
      const x = seamX + drift;

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = index % 3 === 0 ? '#ffffff' : index % 2 === 0 ? primary : secondary;
      ctx.lineWidth = 1 + (index % 2) * 0.6;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(
        seamX + drift + Math.sin(elapsed * 2.7 + index) * glowWidth * 0.12,
        size.height * 0.5,
        x + Math.sin(elapsed * 1.7 + index) * 4,
        size.height,
      );
      ctx.stroke();
    }
  }

  function drawSparks(ctx: CanvasRenderingContext2D, fade: number): void {
    for (const spark of sparks) {
      const lifeRatio = spark.life / spark.maxLife;

      ctx.globalAlpha = lifeRatio * 0.75 * fade;
      ctx.strokeStyle = spark.color;
      ctx.lineWidth = spark.width;
      ctx.beginPath();
      ctx.moveTo(spark.px, spark.py);
      ctx.lineTo(spark.x, spark.y);
      ctx.stroke();

      // 大而淡的一圈就是「模糊」：不用 ctx.filter，代价低得多
      ctx.globalAlpha = lifeRatio * 0.16 * fade;
      ctx.fillStyle = spark.color;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.width * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFlakes(ctx: CanvasRenderingContext2D, fade: number): void {
    for (const flake of flakes) {
      const lifeRatio = flake.life / flake.maxLife;

      ctx.globalAlpha = lifeRatio * 0.65 * fade;
      ctx.fillStyle = flake.color;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = lifeRatio * 0.12 * fade;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function update(delta: number): void {
    elapsed += delta;

    updateSeam();
    updateTexts(delta);
    updateSparks(delta);
    updateFlakes(delta);
    updateSpawn(delta);
  }

  function draw(ctx: CanvasRenderingContext2D): void {
    const fade = envelopeFade();

    if (fade <= 0) {
      return;
    }

    // 整块包在自己的 save/restore 里：本模板会改合成方式与 globalAlpha，
    // 不能把这些留给同一帧里的下一条轨道
    ctx.save();

    drawWashes(ctx, fade);
    drawTexts(ctx, fade);

    ctx.globalCompositeOperation = 'lighter';
    drawSeam(ctx, fade);
    drawSparks(ctx, fade);
    drawFlakes(ctx, fade);

    ctx.restore();
  }

  /**
   * 收进 / 退出驻留
   * @desc 关窗时把 elapsed 对齐到尾部淡出起点：合拢与火花都从「满」开始走，
   *   画面连续。硬切会在一帧之内把整块画面抹掉
   */
  function setSustain(next: boolean): void {
    if (next === sustain) {
      return;
    }

    sustain = next;

    if (!next) {
      elapsed = DURATION - FADE_OUT;
    }
  }

  applyParams(initialParams);
  updateSeam();
  seedTexts();

  return {
    get finished(): boolean {
      return !sustain && elapsed >= DURATION;
    },

    update,

    draw,

    applyParams,

    setSustain,
  };
};
