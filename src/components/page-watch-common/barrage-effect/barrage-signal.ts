/**
 * @file 弹幕信号缓冲
 * @desc 弹幕层与特效层之间的那根管子。弹幕层在每条消息上屏时推一个信号进来，
 *   特效层按时间窗取快照。
 *
 *   两条刻意的设计：
 *
 *   1. **不是什么响应式的东西** —— 普通数组 + 头指针，60Hz 读取不进 Vue 依赖系统。
 *      每条弹幕写一次 Pinia 会让工作台整棵子树重渲染。
 *
 *   2. **缓冲由消费者自持，不走模块级单例** —— 本仓库支持 `useMultiPolyvWatchApp`
 *      多实例观看，模块单例是全局的，两块播放器会互相串数据。信号走 app 级 emitter，
 *      每个实例订阅自己的缓冲。
 */
import { appEvents, useEventBusListener, type WatchAppEmitterType } from '@/app/app-events';

/** 一条上屏弹幕 */
export interface BarrageSignal {
  text: string;
  /** `performance.now()`，单调时钟 */
  at: number;
  self: boolean;
}

/** 一个时间窗内的弹幕快照 */
export interface BarrageSample {
  /** 窗内条数 */
  count: number;
  /** 窗内文本，按时间升序，最多 `MAX_TEXTS` 条 */
  texts: string[];
  /** 条/秒 */
  rate: number;
}

export interface BarrageSignalBuffer {
  push(signal: BarrageSignal): void;
  /** 取 `[now - seconds, now]` 的快照 */
  snapshot(now: number, seconds: number): BarrageSample;
  clear(): void;
}

/** 快照里最多带多少条原文。字符池只需要一个采样，全带上纯属浪费 */
const MAX_TEXTS = 32;

/** 默认容量。按 3 条/秒算，256 条够覆盖 85 秒，远超任何收集窗 */
const DEFAULT_CAPACITY = 256;

export function createSignalBuffer(capacity = DEFAULT_CAPACITY): BarrageSignalBuffer {
  const signals: Array<BarrageSignal | undefined> = new Array(capacity);
  /** 下一个写入位置 */
  let head = 0;
  let size = 0;

  function push(signal: BarrageSignal): void {
    signals[head] = signal;
    head = (head + 1) % capacity;
    size = Math.min(size + 1, capacity);
  }

  function snapshot(now: number, seconds: number): BarrageSample {
    const from = now - seconds * 1000;
    const texts: string[] = [];
    let count = 0;

    // 信号本身是升序的，所以从最新往回扫，遇到第一条过期的就可以停
    for (let step = 1; step <= size; step += 1) {
      const signal = signals[(head - step + capacity) % capacity];

      if (!signal || signal.at < from) {
        break;
      }

      count += 1;

      if (texts.length < MAX_TEXTS) {
        texts.unshift(signal.text);
      }
    }

    return {
      count,
      texts,
      rate: seconds > 0 ? count / seconds : 0,
    };
  }

  function clear(): void {
    signals.fill(undefined);
    head = 0;
    size = 0;
  }

  return { push, snapshot, clear };
}

/**
 * 弹幕上屏时调用：把一个信号推到 app 级总线上
 * @desc `emitter` 必须由调用方**在 setup 里**取好再传进来。不能在这里现取 ——
 *   `useGlobalInject()` 依赖 `inject('uniqueId')`，`useMultiPolyvWatchApp()` 依赖
 *   当前活跃的 pinia，两者在消息回调（setup 之外）里都会解析到错的实例。
 *   多实例观看时那就是**另一块播放器**的弹幕。
 */
export function emitBarrageSignal(emitter: WatchAppEmitterType, text: string, self: boolean): void {
  const signal: BarrageSignal = { text, at: performance.now(), self };

  emitter.emit(appEvents.barrageEffect.BarrageLanded, signal);
}

/**
 * 每来一条弹幕回调一次，不持有缓冲
 * @desc **必须挂在消息到达上而不是每帧轮询** —— 什么都没播的时候共享 rAF 是
 *   彻底停掉的，挂在帧上就得为「什么都没发生」永远跑着 60Hz，
 *   而这正是当初引入共享时钟要避免的事。
 *
 *   同样是 setup-only（内部是 `onMounted` / `onBeforeUnmount`）
 */
export function useBarrageSignalListener(listener: (signal: BarrageSignal) => void): void {
  useEventBusListener(appEvents.barrageEffect.BarrageLanded, listener);
}

/**
 * 订阅弹幕信号，返回自持的缓冲
 * @desc 生产层没有用它，它直接订阅（要顺带做密度判定，见 `pc-barrage-effect.vue`）。
 *   舞台预览不判定密度，用这个更省事
 */
export function useBarrageSignalBuffer(): BarrageSignalBuffer {
  const buffer = createSignalBuffer();

  useBarrageSignalListener(signal => buffer.push(signal));

  return buffer;
}
