/**
 * @file 弹幕特效类型
 */

/** 特效模板标识 */
export type EffectTemplateName =
  | 'shockwave'
  | 'converge'
  | 'confetti'
  | 'pulse'
  | 'rain'
  | 'split'
  | 'countdown';

/**
 * 特效的驱动方式
 * @desc 这是「转场」与「弹幕互动」的分界线：
 *   - `static` 是转场：出厂参数一次性播放，**不读弹幕**
 *   - 其余三种读弹幕，具体读什么见各自的注释
 *
 *   一个模板支持的驱动方式列在它的 `feedModes` 里，第一项即默认。
 *   **只有 `['static']` 的模板是纯转场**（如文字倒计时）；其余都是「既能独立当转场、
 *   也能联合弹幕互动」。层级上：`params` 决定「长什么样」，驱动方式决定「怎么被驱动」。
 */
export type EffectFeedMode =
  | 'static'
  /** 规模：收集窗内的弹幕条数 → 粒子数 */
  | 'scale'
  /** 文字：弹幕原文 → 字符（目前只有数据雨用得上） */
  | 'text'
  /** 对冲：两派关键词的支持占比 → 主色占比与重心偏向 */
  | 'polarity';

/** 锚点上的驱动配置 */
export interface AnchorFeed {
  mode: EffectFeedMode;
  /** 收集窗时长（秒），仅互动模式有效 */
  windowSec?: number;
  /** 对冲用：A 派关键词，逗号分隔 */
  wordsA?: string;
  /** 对冲用：B 派关键词，逗号分隔 */
  wordsB?: string;
}

/** 画布尺寸 */
export interface EffectSize {
  width: number;
  height: number;
}

/**
 * 特效参数
 * @desc 全部可选。开发者预设的是一套「骨架」，缺省值即空场降级形态；
 *   数据驱动时由观众行为算出具体数值覆盖之。
 */
export interface EffectParams {
  /** 粒子总量 */
  particles?: number;
  /** 主色 */
  colorPrimary?: string;
  /** 辅色 */
  colorSecondary?: string;
  /** 主色占比，0 ~ 1（数据驱动时来自得票率） */
  ratio?: number;
  /** 重心偏向，-1 ~ 1（数据驱动时来自票数差值） */
  bias?: number;
  /** 中心点横向相对位置，0 ~ 1 */
  centerX?: number;
  /** 中心点纵向相对位置，0 ~ 1 */
  centerY?: number;
  /**
   * 字符池，供数据雨从弹幕原文取字
   * @desc 缺省用模板内置的 ASCII 池。热更新时**存量雨滴不重掷**，
   *   靠雨滴出画重生自然换血 —— 几秒内铺满，不会瞬间跳变
   */
  glyphPool?: string[];
  /** 文字倒计时：倒计时总时长（秒） */
  countdownSec?: number;
  /** 文字倒计时：说明文案，画在数字上方 */
  caption?: string;
}

/** 一条时间锚点 */
export interface BarrageAnchor {
  /**
   * 稳定标识
   * @desc 调度器据此记录「是否已触发」，配置面板增删改锚点时不会与已触发记录错位
   */
  id: string;
  /** 触发时间，单位：秒 */
  time: number;
  /** 特效模板 */
  template: EffectTemplateName;
  /** 特效参数 */
  params?: EffectParams;
  /**
   * 驱动配置
   * @desc 缺省时按模板 `feedModes` 的第一项走（即出厂形态）。
   *   ★ 这个字段必须同时加进 `anchor-utils.ts` 的 `normalizeAnchor` 与 `stringifyAnchors`，
   *   否则导入、导出、地址栏三条路会一起**静默**把它丢掉
   */
  feed?: AnchorFeed;
  /**
   * 这个特效播多久，单位：秒。缺省（undefined）= 模板的自然时长
   *
   * @desc 时间轴上那条可拖拽的条带写的就是它。但**它落到哪个字段，取决于锚点怎么跑**，
   *   这层的映射统一收在 `span.ts` 里，别在这里就地判断：
   *   - `countdown` → 长度就是内容，写进 `params.countdownSec`
   *   - 互动模式 → 长度就是收集窗，写进 `feed.windowSec`
   *   - 其余 → 它自己，驱动器据此做**整体时间缩放**（慢放/快放，不是循环）
   *
   *   ★ 这个字段必须同时加进 `anchor-utils.ts` 的 `normalizeAnchor` 与 `stringifyAnchors`，
   *   否则导入、导出、地址栏三条路会一起**静默**把它丢掉
   */
  spanSec?: number;
}

/** 一个正在播放的特效 */
export interface EffectInstance {
  /** 是否播放完毕 */
  readonly finished: boolean;
  /** 推进一帧 */
  update(delta: number): void;
  /** 绘制 */
  draw(ctx: CanvasRenderingContext2D): void;
  /**
   * 热更新参数
   * @desc 供工作台拖动滑块时调用。**不重建实例**是硬要求 —— 工厂在构造时会对每个粒子取随机数，
   *   每拖一下重建就是每秒重新随机 60 次，预览会疯狂闪烁。
   *
   *   实现约定：**随机量在构造时确定，来自 params 的量在绘制时读取**。
   */
  applyParams?(params: EffectParams): void;
  /**
   * 收进 / 退出「驻留模式」，供收集窗内持续播放
   *
   * @desc 为什么必须有它：模板的时长是模块常量（1.5 ~ 2.8 秒），而收集窗默认 6 秒。
   *   靠「播完重建」撑满窗长，`split` 会在每轮末尾把光幕淡掉 —— 观众看到的是
   *   **每 2.2 秒暗一次的呼吸灯**，而收集窗想要的是「整屏 100%、缝被一直拽着」。
   *
   *   约定（实现方只需 4 ~ 20 行）：
   *   - `setSustain(true)`：`finished` 恒为 `false`，**同时把出场包络钉死**（`fade ≡ 1`；
   *     split 额外把合拢进度锁在 1，否则光幕会重新合一遍）
   *   - `setSustain(false)`：把 `elapsed` 对齐到「尾部淡出起点」，此后照常走完淡出 ——
   *     **关窗的收尾是模板自带的淡出，不是驱动层硬切**
   *
   *   不实现的模板：驱动层退回「整轮循环 + 间隙」，关窗时等这一轮自然播完
   */
  setSustain?(sustain: boolean): void;
}

/** 特效工厂 */
export type EffectFactory = (params: EffectParams, size: EffectSize) => EffectInstance;

/** 模板展示元数据，模板库卡片、参数面板「恢复默认」、时间轴投放幽灵共用 */
export interface EffectTemplateMeta {
  /** 中文名 */
  label: string;
  /** 一句话说明，给发布者看 */
  description: string;
  /** 卡片封面的强调色，纯展示用 */
  accent: string;
  /** 典型参数，兼作缩略图预览参数与「恢复默认」的目标值 */
  defaults: EffectParams;
  /**
   * 支持的驱动方式，第一项为默认
   * @desc 只有 `['static']` 的是纯转场。模板库据此分组并打徽标，
   *   参数面板据此决定要不要显示驱动方式选择
   */
  feedModes: EffectFeedMode[];
  /**
   * 新拖入时间轴时默认用的驱动方式
   * @desc ★ 只在**创建那一刻**读一次，由 `addAnchorAt` 显式写进锚点的 `feed.mode`。
   *   **改这一个字段动不了任何既有配置** —— 旧存档、旧分享链接、已导出的配置里
   *   根本没有 `feed`，它们走 `resolveFeedMode` 的 `feedModes[0]` 兜底，
   *   而那个兜底恒为 `static`，一个字都不动。
   *
   *   为什么不干脆把互动项挪到 `feedModes` 第一位：那个数组是**唯一的默认通道**，
   *   重排等于让所有没有 `feed` 的既有配置从「放一次」静默变成「开收集窗」；
   *   `span.ts` 的 `spanCaseOf` 也读它，条带长度与可拖区间会跟着一起变，
   *   作者既有的 `spanSec` 会变成静默失效的死数据。模块里没有 schema 版本号，
   *   也没有迁移代码 —— 没有安全的重排方式，只有「创建时写明」这一条路。
   *
   *   与 `density-trigger.ts` 的 `createTriggerAnchor` 是同一条纪律的两面：
   *   那边显式写 `static` 防被默认值改味，这边显式写互动值求默认就是互动
   *
   *   缺省即不写 `feed`（纯转场模板，如文字倒计时）
   */
  defaultFeedMode?: EffectFeedMode;
  /**
   * 规模通道的满规模条数，缺省 40
   * @desc 各模板的 `particles` 语义不同（三个 1:1，三个是预算除以 3 / 2.5 / 3.5），
   *   视觉密度本来就不可比 —— 这里逐模板标定「多少条弹幕算满」
   */
  scaleFullCount?: number;
  /**
   * 缩略图专用参数覆盖
   * @desc 卡片是按「几秒一轮」循环预览的，而 `defaults` 是给生产用的。
   *   倒计时就是反例：生产默认 300 秒，缩略图里会永远停在 05:00 一动不动。
   */
  thumbnailParams?: EffectParams;
  /**
   * 密度触发专用参数覆盖
   * @desc 与 `thumbnailParams` 是同一个问题的两种场合：`defaults` 是「作者按时间轴放」时
   *   想要的参数，而密度触发是**事件驱动的爆点**，要的是短促。
   *   倒计时是唯一的例子 —— 生产默认 300 秒，谁也不会想让 8 条弹幕炸出一个 5 分钟的倒计时
   */
  triggerParams?: EffectParams;
  /**
   * 这个模板「本来」跑多久，单位：秒
   * @desc 就是模板模块里的 `DURATION` 常量，用别名导出来挂在这儿 —— 只为让
   *   时间轴知道「拖拽前的默认条带长度」。改它只影响默认值和缩放基准，
   *   模板自己的 `finished` 判据仍然读它自己那份常量（同一份定义，不会打架）
   *
   *   ★ `countdown` **不设**这一项：它的时长由 `params.countdownSec` 派生，
   *   是 v4 就写明的有意破例，由 `span.ts` 特判
   */
  naturalSec?: number;
}

/** 注册表里的一项 */
export interface EffectTemplateDescriptor extends EffectTemplateMeta {
  name: EffectTemplateName;
  factory: EffectFactory;
}
