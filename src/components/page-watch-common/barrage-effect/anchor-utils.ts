/**
 * @file 锚点数据工具
 * @desc 解析、校验、编解码。地址栏配置与配置面板共用同一套，保证两条入口的数据结构完全一致。
 */
import { effectTemplates, getEffectTemplate } from './effects';
import { MAX_WINDOW_SEC, MIN_WINDOW_SEC } from './feed-window';
import type { AnchorFeed, BarrageAnchor, EffectTemplateName } from './types';

/**
 * 受支持的模板
 * @desc 必须从注册表派生。手写死名单是个陷阱：下面的 normalizeAnchor 会把不在名单里的模板
 *   直接判为脏数据丢弃，且不发任何日志 —— 新增模板时漏改这里，导入、导出、地址栏三条路
 *   会一起静默丢掉它们。
 */
export const VALID_TEMPLATES = Object.keys(effectTemplates) as EffectTemplateName[];

let anchorIdSeed = 0;

/** 生成锚点标识 */
export function createAnchorId(): string {
  anchorIdSeed += 1;
  return `a${anchorIdSeed}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * 两个锚点之间的最小间隔，单位：秒
 * @desc 防止演示时在同一处堆出四个冲击波。它是**锚点的数据约束**，不是手势的，
 *   所以定义在这里：时间轴据此判「能不能放在这儿」，store 据此判「能不能挪到这儿」，
 *   两处必须同一把尺子 —— 各写一份的话，会出现「放不下但拖得动」
 */
export const MIN_ANCHOR_GAP = 1;

/** 该时间点是否不与任何其他锚点冲突 */
export function isSlotFree(anchors: BarrageAnchor[], time: number, excludeId?: string): boolean {
  return anchors.every(
    anchor => anchor.id === excludeId || Math.abs(anchor.time - time) >= MIN_ANCHOR_GAP,
  );
}

/**
 * 把落点吸附到离它最近的空位
 *
 * @desc 拖动时**不拒绝**非法落点，而是吸附过去。拒绝的表现是「条带弹回原处」，
 *   作者读到的是「拖不动 / 卡了」；吸附是「它自己挪了一格让开」——
 *   同一件事，后者不需要任何解释。
 *
 *   不必扫描整条时间轴：空位集合是「若干开区间的补集」，而一个点到某个集合的
 *   最近点**必定落在该集合某个区间的端点上**，所以只需要枚举 `a.time ± GAP`
 *   这些候选。已有 n 个锚点时是 O(n²)，n 是几十的量级，无所谓
 */
export function nearestFreeTime(
  anchors: BarrageAnchor[],
  time: number,
  excludeId?: string,
): number {
  const target = Math.max(0, Math.round(time));

  if (isSlotFree(anchors, target, excludeId)) {
    return target;
  }

  let best: number | undefined;

  for (const anchor of anchors) {
    if (anchor.id === excludeId) {
      continue;
    }

    for (const candidate of [anchor.time - MIN_ANCHOR_GAP, anchor.time + MIN_ANCHOR_GAP]) {
      // 时间轴上 0 之前放不下东西；候选本身也可能正压着第三个锚点
      if (candidate < 0 || !isSlotFree(anchors, candidate, excludeId)) {
        continue;
      }

      if (best === undefined || Math.abs(candidate - target) < Math.abs(best - target)) {
        best = candidate;
      }
    }
  }

  // 理论上到不了这儿（两端之外总有空位）；真到了就退回原值 ——
  // 宁可让两条重叠，也不能把锚点扔到一个用户没拖过的地方
  return best ?? target;
}

/**
 * 校验并归一化驱动配置
 * @desc 模板不支持的驱动方式一律整块丢掉，退回模板默认（也就是 `static`）——
 *   手改过的脏配置宁可当成转场播，也不能让一条写错的关键词把画面搞坏。
 *   丢掉时要报，否则作者只会看到「配了互动却和以前一模一样」
 */
function normalizeFeed(input: unknown, template: EffectTemplateName): AnchorFeed | undefined {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const feed = input as Partial<AnchorFeed>;
  const descriptor = getEffectTemplate(template);

  if (!feed.mode) {
    return undefined;
  }

  if (!descriptor?.feedModes.includes(feed.mode)) {
    console.warn(`[barrage-effect] ${template} 不支持驱动方式「${feed.mode}」，已按默认方式播放`);
    return undefined;
  }

  const result: AnchorFeed = { mode: feed.mode };

  const windowSec = Number(feed.windowSec);
  if (Number.isFinite(windowSec)) {
    result.windowSec = Math.min(Math.max(Math.round(windowSec), MIN_WINDOW_SEC), MAX_WINDOW_SEC);
  }

  if (typeof feed.wordsA === 'string' && feed.wordsA.trim()) {
    result.wordsA = feed.wordsA;
  }

  if (typeof feed.wordsB === 'string' && feed.wordsB.trim()) {
    result.wordsB = feed.wordsB;
  }

  /**
   * 主动答题
   * @desc ★ 必须显式写进白名单，否则导入、导出、地址栏三条路会一起**静默**丢掉它，
   *   作者只会看到「答题卡配了但不弹」。`collect: {}` 本身就是有效值（开启，
   *   提前秒数运行时取 `windowSec`），不能因为里面没有字段就整块丢掉。
   *
   *   也接受手写链接里的 `true` 简写 —— 反正是同一个语义，报错反而更难用
   */
  // 类型上 collect 是对象，但手写链接里可能写成 true；这里按 unknown 收
  const rawCollect = feed.collect as unknown;

  if (rawCollect === true) {
    result.collect = {};
  } else if (rawCollect && typeof rawCollect === 'object') {
    const source = rawCollect as { prompt?: unknown; leadSec?: unknown };
    const collect: NonNullable<AnchorFeed['collect']> = {};

    if (typeof source.prompt === 'string' && source.prompt.trim()) {
      collect.prompt = source.prompt.trim();
    }

    const leadSec = Number(source.leadSec);
    if (Number.isFinite(leadSec)) {
      collect.leadSec = Math.min(Math.max(Math.round(leadSec), MIN_WINDOW_SEC), MAX_WINDOW_SEC);
    }

    result.collect = collect;
  }

  return result;
}

/**
 * 校验并归一化单条锚点，脏数据返回 undefined
 * @desc ★ 返回的是**固定形状**对象 —— 新增字段不加进这里，导入、导出、地址栏
 *   三条路会一起**静默**丢掉它，无报错无日志
 */
export function normalizeAnchor(input: unknown): BarrageAnchor | undefined {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const anchor = input as Partial<BarrageAnchor>;
  const time = Number(anchor.time);

  if (!Number.isFinite(time) || time < 0) {
    return undefined;
  }

  if (!anchor.template || !VALID_TEMPLATES.includes(anchor.template)) {
    // 有值但不认识才值得报：漏注册模板时，这条日志是唯一的线索
    if (typeof anchor.template === 'string' && anchor.template) {
      console.warn(`[barrage-effect] 丢弃了未知模板的锚点：${anchor.template}`);
    }

    return undefined;
  }

  /**
   * 时长
   * @desc 这里只做**类型**上的收敛（强制成数、必须是正有限值），不做语义钳制 ——
   *   「这个数该落在哪个区间」取决于锚点怎么跑，那是 `span.ts` 的事，
   *   在这儿再判断一次就是把那层知识复制成第二份。
   *   手改过的地址栏配置里出现 `"spanSec": "6"` 也不会一路带到算术里去
   */
  const spanSec = Number(anchor.spanSec);

  return {
    id: typeof anchor.id === 'string' && anchor.id ? anchor.id : createAnchorId(),
    time,
    template: anchor.template,
    params: anchor.params,
    feed: normalizeFeed(anchor.feed, anchor.template),
    spanSec: Number.isFinite(spanSec) && spanSec > 0 ? spanSec : undefined,
  };
}

/**
 * 解析过程中被丢掉了多少条
 * @desc ★ 只给**导入**用。解析器一直是「脏数据静默丢弃」的，而导入是唯一的
 *   用户亲手粘贴文本的入口 —— 10 条里只进来 3 条却什么都不说，
 *   作者看到的是「导入成功了，但少了几个」，唯一的线索在 `console.warn` 里
 */
export interface ParseStats {
  /** 输入里一共有多少条 */
  total: number;
  /** 其中被判为脏数据丢掉的有多少条 */
  dropped: number;
}

/** 批量归一化并按时间升序排列 */
export function normalizeAnchors(input: unknown, stats?: ParseStats): BarrageAnchor[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const list = input
    .map(normalizeAnchor)
    .filter((item): item is BarrageAnchor => !!item)
    .sort((a, b) => a.time - b.time);

  if (stats) {
    stats.total = input.length;
    stats.dropped = input.length - list.length;
  }

  return list;
}

/** UTF-8 字符串转 base64 */
export function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
}

/** base64 转 UTF-8 字符串 */
export function decodeBase64(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = window.atob(normalized);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

/**
 * 解析锚点配置文本
 * @desc 依次尝试三种写法，取第一个能解析出结果的：
 *   1. base64 编码的 JSON 数组
 *   2. 直接是 JSON 数组
 *   3. `时间:模板` 简写，逗号分隔，如 `15:shockwave,42:converge`（方便手敲）
 */
export function parseAnchorsText(value: string, stats?: ParseStats): BarrageAnchor[] {
  const text = value.trim();
  if (!text) {
    return [];
  }

  for (const decode of [
    (raw: string) => JSON.parse(decodeBase64(raw)) as unknown,
    (raw: string) => JSON.parse(raw) as unknown,
  ]) {
    try {
      const result = decode(text);
      if (Array.isArray(result)) {
        // ★ stats 只可能被成功的那一次写：解码抛异常就走不到这里，
        //   解出来不是数组就 continue，两条路都不会污染计数
        return normalizeAnchors(result, stats);
      }
    } catch {
      // 换下一种写法继续尝试
    }
  }

  return normalizeAnchors(
    text.split(',').map(item => {
      const [time, template] = item.split(':');
      return { time: Number(time), template: template as EffectTemplateName };
    }),
    stats,
  );
}

/**
 * 导出为 base64 文本，可直接填进地址栏的 barrageAnchors 参数
 * @desc 导出时不带 id，id 由接收方重新生成，避免两份配置的 id 冲突。
 *   `feed` 只在存在时写出：旧版本的接收方读到的是熟悉的形状，不会因为多了字段而懵
 */
export function stringifyAnchors(anchors: BarrageAnchor[]): string {
  const plain = anchors.map(({ time, template, params, feed, spanSec }) => {
    const item: Record<string, unknown> = { time, template, params };

    if (feed) {
      item.feed = feed;
    }

    // 与 `feed` 同样只在存在时写出：旧版本的接收方读到的还是熟悉的形状
    if (spanSec !== undefined) {
      item.spanSec = spanSec;
    }

    return item;
  });

  return encodeBase64(JSON.stringify(plain));
}
