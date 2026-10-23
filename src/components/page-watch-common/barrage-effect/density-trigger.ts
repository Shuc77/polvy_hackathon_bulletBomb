/**
 * @file 密度触发
 * @desc 「弹幕够热闹就自动放一个」。锚点触发要时间轴，而**直播没有时间轴** ——
 *   时间锚点调度器挂在 `PlayerEvents.TimeUpdate` 上，直播下进度恒为 0，
 *   这个事件一次都不会来。所以密度触发是直播场景下唯一可用的触发路径。
 *
 *   三条不能想当然的地方：
 *
 *   1. **必须事件驱动，不能每帧轮询** —— 什么都没播的时候共享 rAF 是彻底停掉的
 *      （引用计数归零就会 `cancelAnimationFrame`）。挂在帧上等于为了「什么都没发生」
 *      永远跑着 60Hz，而这正是当初引入共享时钟要避免的事。所以订阅弹幕到达。
 *
 *   2. **冷却用墙上时钟，不能用播放时间** —— 直播下 `currentTime` 永远不前进，
 *      用播放时间做冷却就是「冷却永远不结束」或者「永远在冷却」。同理整个判定
 *      跑在 `performance.now()` 上，与信号缓冲同一个时基。
 *
 *   3. **冷却不是可选项** —— 阈值之上每来一条消息都触发，观众刷起来就是一秒一个，
 *      画面糊成一片。默认 12 秒一个，节奏才像「爆点」而不是「故障」。
 */
import { createAnchorId } from './anchor-utils';
import { getEffectTemplate } from './effects';
import type { BarrageSample } from './barrage-signal';
import type { BarrageAnchor, EffectTemplateName, LiveTemplateConfig } from './types';

export interface DensityTriggerConfig {
  /** 总开关。默认关 —— 作者没配就炸，属于惊吓不属于功能 */
  enabled: boolean;
  /** 统计窗口，单位：秒 */
  windowSec: number;
  /** 窗内达到多少条算「热闹」 */
  threshold: number;
  /** 两次触发之间的最短间隔，单位：秒 */
  cooldownSec: number;
  /** 触发时放哪个模板 */
  template: EffectTemplateName;
}

export const DENSITY_DEFAULTS: DensityTriggerConfig = {
  enabled: false,
  windowSec: 3,
  threshold: 8,
  cooldownSec: 12,
  // 彩带礼花：它的语义本来就是「庆祝」，与「热闹了」天然是一回事
  template: 'confetti',
};

export const MIN_DENSITY_WINDOW_SEC = 1;
export const MAX_DENSITY_WINDOW_SEC = 30;
export const MIN_DENSITY_THRESHOLD = 2;
export const MAX_DENSITY_THRESHOLD = 100;
export const MIN_DENSITY_COOLDOWN_SEC = 3;
export const MAX_DENSITY_COOLDOWN_SEC = 120;

/** 面板要显示的东西 */
export interface DensityState {
  enabled: boolean;
  /** 窗内当前条数 */
  count: number;
  threshold: number;
  /** 冷却剩余秒数，0 表示已就绪 */
  cooldownRemaining: number;
  /**
   * 此刻来消息的话会不会放
   * @desc ★ 面板读数与真正的判定**共用这一个布尔**。分开算就一定会出现
   *   「面板显示会放、实际不放」这类最难查的不一致，而它们本来就是同一个判断
   */
  armed: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 校验并归一化触发配置
 * @desc 配置是存在 localStorage 里的，可能是手改过的脏数据。
 *   数字一律收敛到合法区间：把 `windowSec` 填成 0 会让窗口永远为空
 *   （阈值再低也触发不了），填成 `NaN` 则连比较都为假
 */
export function normalizeDensityConfig(input: unknown): DensityTriggerConfig {
  if (!input || typeof input !== 'object') {
    return { ...DENSITY_DEFAULTS };
  }

  const raw = input as Partial<DensityTriggerConfig>;

  const template = raw.template as EffectTemplateName | undefined;

  return {
    enabled: raw.enabled === true,
    windowSec: clamp(
      Math.round(Number(raw.windowSec) || DENSITY_DEFAULTS.windowSec),
      MIN_DENSITY_WINDOW_SEC,
      MAX_DENSITY_WINDOW_SEC,
    ),
    threshold: clamp(
      Math.round(Number(raw.threshold) || DENSITY_DEFAULTS.threshold),
      MIN_DENSITY_THRESHOLD,
      MAX_DENSITY_THRESHOLD,
    ),
    cooldownSec: clamp(
      Math.round(Number(raw.cooldownSec) || DENSITY_DEFAULTS.cooldownSec),
      MIN_DENSITY_COOLDOWN_SEC,
      MAX_DENSITY_COOLDOWN_SEC,
    ),
    template: template && getEffectTemplate(template) ? template : DENSITY_DEFAULTS.template,
  };
}

/**
 * 读当前状态
 * @desc `sample` 必须是**同一条消息到达时**取的快照。窗内条数天然是「最近
 *   `windowSec` 秒内的条数」，所以冷启动时不会误判：0.5 秒里来了 8 条，
 *   密度本来就是 16 条/秒，远在阈值之上，放是对的
 */
export function readDensityState(
  sample: BarrageSample,
  config: DensityTriggerConfig,
  lastFiredAt: number | undefined,
  now: number,
): DensityState {
  const cooldownRemaining =
    lastFiredAt === undefined ? 0 : Math.max(0, config.cooldownSec - (now - lastFiredAt) / 1000);

  return {
    enabled: config.enabled,
    count: sample.count,
    threshold: config.threshold,
    cooldownRemaining,
    armed: config.enabled && cooldownRemaining <= 0 && sample.count >= config.threshold,
  };
}

/** 该不该放。判定只有 `readDensityState` 一处 */
export function evaluateDensity(
  sample: BarrageSample,
  config: DensityTriggerConfig,
  lastFiredAt: number | undefined,
  now: number,
): boolean {
  return readDensityState(sample, config, lastFiredAt, now).armed;
}

/**
 * 造一个运行期锚点
 *
 * @desc 它**不存在于 store 里**，也不出现在时间轴上 —— 密度触发和直播手动触发
 *   都不是配置，是运行期事件。id 照样给：驱动器按 id 无关的方式持有轨道，但给一个
 *   稳定的 id 能让日志和调试可读。
 *
 *   ★ 驱动方式恒为 `static`，这是有意的，不是偷懒：
 *   - 这两条路都是「点一下就放一个」，要的是一闪而过的爆点，不是持续 6 秒的互动窗
 *   - 互动窗本身要读弹幕密度，拿密度去开一个读密度的窗是套娃，语义上说不通
 *   - 直播下没有任何东西会关掉一个常驻特效，`static` 的一次性播放天然自清
 *
 *   显式写出 `mode: 'static'` 而不是靠「省略即默认」：万一将来某个模板把
 *   `feedModes[0]` 换成互动方式，这里不会跟着静默变味
 */
export function createRuntimeAnchor(
  template: EffectTemplateName,
  config?: LiveTemplateConfig,
): BarrageAnchor {
  const descriptor = getEffectTemplate(template);

  return {
    id: createAnchorId(),
    time: 0,
    template,
    /**
     * 有显式配置就用它，没有才用触发场合的短版（如倒计时的 10 秒）
     * @desc ★ **不能**写成 `{ ...triggerParams, ...config.params }`：回放里只改了
     *   时长的那条倒计时，params 里没有 caption，垫上 triggerParams 的文案后，
     *   直播放出来的说明和参数面板里显示的（模板默认文案）就对不上了。
     *   有配置时原样使用，缺的字段由模板默认值补 —— 与作者在面板里看到的一致。
     *   驱动器会把整份 params 并到模板默认值之上
     */
    params: config?.params ? { ...config.params } : { ...descriptor?.triggerParams },
    ...(config?.spanSec !== undefined ? { spanSec: config.spanSec } : {}),
    feed: { mode: 'static' },
  };
}
