/**
 * @file 字形粒子场
 * @desc 把一个字形采样成一组粒子目标点，并保证**不同字形之间的点一一对应**。
 *   文字类模板（倒计时，以及后面的文字转场）共用这一套。
 *
 *   核心在「对应关系」，不在采样。采样只是把字画到离屏画布上数 alpha 像素，
 *   谁都会写；难的是字形 A 变成字形 B 时，**哪个粒子该去哪个点**。
 *   无序对应的话粒子会互相穿过去，看到的是一团糊，而不是「字在变形」。
 *
 *   这里的做法：**按质心角度排序**，第 i 个粒子在 A 里站角度序第 i 位，
 *   在 B 里也站角度序第 i 位。于是形变是绕字形中心的一次流动，
 *   不需要任何配对表，也不需要按字形对预先算排列。
 *
 *   ★ 另一条路是贪心最近邻（路径最短、最整齐），但要多一个空间网格才不至于 O(n²)，
 *   而且得为每对字形各存一份排列。角度排序的观感已经够好，先用它；
 *   真觉得某些字形对不好看，再换贪心也只是把这一个函数换掉。
 */
import type { EffectSize } from '../types';

/** 一个归一化到 [0, 1] 的点，坐标相对采样盒 */
export interface GlyphPoint {
  x: number;
  y: number;
}

export interface GlyphFieldOptions {
  /** 采样用的字体串，如 `700 120px sans-serif` */
  font: string;
  /** 采样盒尺寸（像素）。★ 所有字形必须用同一个盒子，否则槽位对不齐 */
  box: EffectSize;
  /** 目标粒子数。采样结果多于它按等距抽稀，少于它按等距重复补齐 */
  count: number;
  /** 初始采样步长（像素）。太密没意义，粒子本来看不出那么细 */
  step?: number;
}

export interface GlyphField {
  glyph: string;
  /**
   * 归一化点，**长度恒为 count**，已按质心角度升序
   * @desc `readonly` 不是形式主义：这个数组可能是缓存里的共享对象，
   *   改它会同时改掉所有正在用同一字号的实例。类型上先拦住
   */
  points: readonly GlyphPoint[];
  /** 空字形（空格、字体里没有的字）为 true */
  readonly empty: boolean;
}

const DEFAULT_STEP = 4;

/** alpha 高于它的像素才算字的笔画。抗锯齿边缘的浅像素不要 */
const ALPHA_THRESHOLD = 40;

/** 采样步长的下限。再往下就是逐像素扫，一个字形要几十万次循环 */
const MIN_STEP = 1;

function createSampler(box: EffectSize): CanvasRenderingContext2D | undefined {
  const canvas = document.createElement('canvas');

  canvas.width = Math.max(1, Math.ceil(box.width));
  canvas.height = Math.max(1, Math.ceil(box.height));

  // willReadFrequently：这块画布的唯一用途就是被 getImageData 读一次，
  // 不提示的话浏览器会把它放在 GPU 上，读回时再往 CPU 拷一遍
  return canvas.getContext('2d', { willReadFrequently: true }) ?? undefined;
}

/** 数一遍落在笔画上的采样点 */
function samplePoints(ctx: CanvasRenderingContext2D, glyph: string, step: number): GlyphPoint[] {
  const { width, height } = ctx.canvas;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(glyph, width / 2, height / 2);

  const data = ctx.getImageData(0, 0, width, height).data;
  const points: GlyphPoint[] = [];

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

/**
 * 采出一个字形
 *
 * @desc 稀疏字形（`:` `1` `i`）在默认步长下点数可能远少于目标值，直接抽稀会让
 *   数字看起来只剩几十个粒子。所以这里会**逐步减半步长重采**，直到够数为止 ——
 *   冒号本来就该用更细的采样才画得出形状
 */
export function buildGlyphField(glyph: string, options: GlyphFieldOptions): GlyphField {
  const { font, box, count } = options;
  const ctx = createSampler(box);

  if (!ctx || count <= 0) {
    return { glyph, points: [], empty: true };
  }

  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let step = Math.max(MIN_STEP, Math.floor(options.step ?? DEFAULT_STEP));
  let raw = samplePoints(ctx, glyph, step);

  while (raw.length < count && step > MIN_STEP) {
    step = Math.max(MIN_STEP, Math.floor(step / 2));
    raw = samplePoints(ctx, glyph, step);
  }

  if (raw.length === 0) {
    return { glyph, points: [], empty: true };
  }

  /**
   * 抽稀 / 补齐到正好 count 个
   * @desc 补的时候用 `i % n` 摊开而不是全堆在最后一点上：堆叠会在那个位置
   *   画出一块明显更亮的斑，摊开只是稍密一点，看不出来
   */
  const points: GlyphPoint[] = new Array(count);
  const span = raw.length / count;

  for (let index = 0; index < count; index += 1) {
    const source = raw[Math.floor(index * span) % raw.length];
    points[index] = { x: source.x / box.width, y: source.y / box.height };
  }

  let sumX = 0;
  let sumY = 0;

  points.forEach(point => {
    sumX += point.x;
    sumY += point.y;
  });

  const centerX = sumX / count;
  const centerY = sumY / count;

  /**
   * 按质心角度升序 —— 这就是「第 i 个粒子」的身份来源。
   * 索引稳定，所以同一个粒子在任何字形里都是角度序的同一位，
   * 字形切换时它走的是最短的那条弧，而不是横穿整个字
   */
  points.sort(
    (a, b) => Math.atan2(a.y - centerY, a.x - centerX) - Math.atan2(b.y - centerY, b.x - centerX),
  );

  return { glyph, points, empty: false };
}

/**
 * 采样结果缓存
 *
 * @desc ★ 必须缓存，不然缩略图会周期性卡顿。模板库的卡片是「播完一轮就重建实例」
 *   的循环（见 `template-card.vue`），而倒计时一个实例要采 11 个字形 ——
 *   不缓存就是每隔几秒重新造 11 块离屏画布 + `getImageData`，白白冻结主线程一次。
 *
 *   这里和 rain 的字符池不一样：那些是**实例状态**，多实例之间必须隔离；
 *   而字形场是 (字体, 盒子, 粒子数) 的**纯函数结果**，谁用都是同一份，
 *   共享不串数据。代价是调用方**不得修改**返回的点。
 *
 * 容量按「同时存在的不同字号」算：缩略图一批、舞台一批、生产一批，8 个足够。
 */
const CACHE_LIMIT = 8;

const fieldCache = new Map<string, Map<string, GlyphField>>();

/**
 * 清空字形缓存
 *
 * @desc ★ 字体就绪之后必须调一次，否则「重建」是个空操作。
 *   字体没加载完时采样到的是后备字体的形状，而**那时用的字体串和加载完之后一模一样**
 *   （`700 33px "PingFang SC", ...` 这个字符串不会变），所以缓存键也一模一样 ——
 *   不清的话重建直接命中缓存，把那份错的形状原样拿回来，永远修不好。
 *
 *   已经发出去的 Map 不受影响（调用方自己拿着引用），清掉的只是「以后别再采一遍」
 */
export function invalidateGlyphCache(): void {
  fieldCache.clear();
}

function cacheKey(options: GlyphFieldOptions): string {
  const { font, box, count } = options;

  return `${font}|${Math.round(box.width)}x${Math.round(box.height)}|${count}|${
    options.step ?? DEFAULT_STEP
  }`;
}

/**
 * 批量采一组字形（带缓存）
 * @desc 字体可能还没加载完（首屏第一次构造就是），所以调用方应当在
 *   `document.fonts.ready` 之后重建一次 —— 缓存是按字体串作键的，
 *   换了字体自然就是另一份，不会被旧的后备字体形状污染
 */
export function buildGlyphFields(
  glyphs: readonly string[],
  options: GlyphFieldOptions,
): Map<string, GlyphField> {
  const key = cacheKey(options);
  const cached = fieldCache.get(key);

  if (cached) {
    return cached;
  }

  const fields = new Map<string, GlyphField>();

  glyphs.forEach(glyph => {
    fields.set(glyph, buildGlyphField(glyph, options));
  });

  // Map 保持插入顺序，第一个键就是最老的
  if (fieldCache.size >= CACHE_LIMIT) {
    const oldest = fieldCache.keys().next().value;

    if (oldest !== undefined) {
      fieldCache.delete(oldest);
    }
  }

  fieldCache.set(key, fields);

  return fields;
}
