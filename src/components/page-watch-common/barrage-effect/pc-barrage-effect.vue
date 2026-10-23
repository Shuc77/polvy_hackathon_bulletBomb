<!-- @file PC 端弹幕特效层 -->
<template>
  <div class="c-pc-barrage-effect">
    <canvas
      ref="canvasRef"
      class="c-pc-barrage-effect__canvas"
    ></canvas>

    <!-- 答题卡是 HTML 不是 canvas：它不参与特效绘制，也不受弹幕区域裁剪。
         收集区重叠时多张卡竖排，各倒各的；到点只移除自己那一张 -->
    <div
      v-if="activePrompts.length > 0"
      class="c-quiz-prompt-stack"
    >
      <quiz-prompt
        v-for="prompt in activePrompts"
        :key="prompt.key"
        :question="prompt.question"
        :hint-a="prompt.hintA"
        :hint-b="prompt.hintB"
        :remaining="prompt.remaining"
        :total="prompt.total"
        :accent="prompt.accent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { isMobile } from '@/assets/utils/browser';
import { useBarrageEffectStore } from '@/store/use-barrage-effect-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useBarrageFeed } from '../barrage/use-barrage-feed';
import { barrageAreaOf } from './barrage-area';
import { collectLeadSecOf, resolveCollectPrompt } from './collect';
import { getEffectTemplate } from './effects';
import { useEffectCanvas, type EffectFrame } from './use-effect-canvas';
import { useAnchorScheduler } from './use-anchor-scheduler';
import { createSignalBuffer, useBarrageSignalListener } from './barrage-signal';
import { createRuntimeAnchor, evaluateDensity } from './density-trigger';
import { playEffectSound } from './effect-sound';
import { useLiveEffectReceiver } from './live-effect';
import { useInteractiveDriver } from './interactive-driver';
import QuizPrompt from './quiz-prompt.vue';
import type { BarrageAnchor } from './types';

const canvasRef = ref<HTMLCanvasElement>();

const barrageEffectStore = useBarrageEffectStore();

/** 观众在播放器「弹幕位置」里选的那块区域，红蓝对抗要跟着它画 */
const playerStore = usePlayerStore();

/** 真实上屏弹幕的时间窗缓冲，由本实例自持 */
const signalBuffer = createSignalBuffer();

/**
 * 手机端没有 `pc-barrage`，上屏弹幕由播放器 SDK 自己处理
 * @desc 但特效层的密度判定与红蓝对抗仍要靠「刚刚上了哪些弹幕」的信号，
 *   这里补一个只发信号、不上屏的订阅；PC 端由 `pc-barrage` 负责，不能重复订阅
 */
const mobileFeed = isMobile ? useBarrageFeed(() => undefined) : undefined;

// 顺序不能倒：下面的 driver 要用 getSize
const { start, stop, requestDraw, getSize } = useEffectCanvas({
  canvasRef,
  onFrame: renderFrame,
  onSizeChange: () => {
    // 尺寸回调只可能由 ResizeObserver 的**异步**回调触发，走到这里 driver 必然已赋值
    // （`use-resize-observer` 里是 `observer.observe()`，首次回调也排在当前同步代码之后）
    // eslint-disable-next-line no-use-before-define
    driver.invalidate();
    // 先停掉再画一帧：这一帧里驱动器会告诉我们还有没有东西要画
    stop();
    requestDraw();
  },
});

const driver = useInteractiveDriver({
  getSize,
  getSample: (now, seconds) => signalBuffer.snapshot(now, seconds),
  // 只有声明了 `followBarrageArea` 的模板会读它；其余模板照旧铺满
  getArea: () =>
    barrageAreaOf(
      getSize(),
      playerStore.barrageLocationSetting[playerStore.currentBarrageLocationIndex],
    ),
});

/**
 * 观众换了弹幕位置：区域跟着换
 * @desc 实例在构造时固化了尺寸，必须作废重建；循环停着时也要补画一帧，
 *   否则画面上还留着旧区域的残影。
 *
 *   ★ 看的是「区域签名」而不是只盯 index：位置选项是异步从 SDK 同步进来的，
 *   初始为空数组。只盯 index 的话，选项晚到不会触发回调 —— 那时特效已经
 *   按全屏建好了实例
 */
watch(
  () => {
    const location = playerStore.barrageLocationSetting[playerStore.currentBarrageLocationIndex];

    return location ? `${location.direction}:${location.percent}` : 'full';
  },
  () => {
    driver.invalidate();
    requestDraw();
  },
);

function renderFrame({ ctx, delta }: EffectFrame): void {
  // start() 是幂等的（已在跑就早退），所以这里可以每帧无脑调用。
  //
  // ★ 判据必须是驱动器「还有没有轨道」而不是「有没有活着的实例」：
  //   窗内循环的间隙里实例是空的，按实例判会把共享 rAF 停掉，
  //   而停了就再也没有下一帧去结束间隙 —— 窗从此冻住
  if (driver.tick(ctx, delta)) {
    start();
    return;
  }

  stop();
}

/**
 * 放一个特效并确保时钟在跑
 *
 * @desc `start()` 不能省：触发是事件驱动的，此刻共享 rAF 多半是停的
 *   （没有东西在播时它引用计数归零会 `cancelAnimationFrame`）。
 *   只 play 不 start，特效会静静地挂在轨道上永远不画出来。
 *
 *   ★ 顺序也必须是「先 start 后 play」：`start()` 内部会 `syncSize()` 把画布尺寸量出来，
 *   而 `driver.play()` 拿不到有效尺寸就直接早退。反过来的话，这块画布第一次被触发时
 *   尺寸还是 0，这次触发会被**静默丢掉**（没有日志，看起来就像密度判定没生效）。
 *   先起循环不影响这一帧：`subscribeCanvasTicker` 是 rAF，play 一定排在下一帧之前
 */
function playAndRun(anchor: BarrageAnchor): void {
  start();
  driver.play(anchor);
  // 音效与画面同帧起跑：调用点必须和 driver.play 绑在一起，别拆到播放器事件里
  playEffectSound(anchor.template);
}

/**
 * 直播实时特效：管理员在工作台点一下，其他页面收到广播后在这里放映
 * @desc 发送端自己的回声会被 `useLiveEffectReceiver` 按页面标识跳过 ——
 *   那边的工作台舞台已经放过一次，这里再放就是重音
 */
useLiveEffectReceiver(anchor => {
  playAndRun(anchor);
});

/**
 * 已进入预滚、等待揭晓的答题卡
 * @desc 按锚点时间升序。收集区重叠时**全部渲染**（竖排），每个锚点到点后
 *   只移除自己那一张；跳过找不到文案的排队项，别让第一条堵住后面
 */
interface PromptEntry {
  anchor: BarrageAnchor;
  leadSec: number;
  remaining: number;
}

/** 交给模板显示的答题卡内容 */
interface PromptCard {
  key: string;
  question: string;
  hintA?: string;
  hintB?: string;
  remaining: number;
  total: number;
  accent?: string;
}

const promptQueue = ref<PromptEntry[]>([]);

const activePrompts = computed<PromptCard[]>(() => {
  const prompts: PromptCard[] = [];

  for (const entry of promptQueue.value) {
    const descriptor = getEffectTemplate(entry.anchor.template);
    const prompt = resolveCollectPrompt(entry.anchor, descriptor);

    if (!prompt) {
      continue;
    }

    prompts.push({
      key: entry.anchor.id,
      question: prompt.question,
      hintA: prompt.hintA,
      hintB: prompt.hintB,
      remaining: entry.remaining,
      total: entry.leadSec,
      accent: descriptor?.accent,
    });
  }

  return prompts;
});

function removePrompt(id: string): void {
  promptQueue.value = promptQueue.value.filter(item => item.anchor.id !== id);
}

function clearPrompts(): void {
  promptQueue.value = [];
}

function onApproach(anchor: BarrageAnchor): void {
  const leadSec = collectLeadSecOf(anchor, getEffectTemplate(anchor.template));

  if (!(leadSec > 0) || promptQueue.value.some(item => item.anchor.id === anchor.id)) {
    return;
  }

  promptQueue.value = [...promptQueue.value, { anchor, leadSec, remaining: leadSec }].sort(
    (a, b) => a.anchor.time - b.anchor.time,
  );
}

/**
 * 刷新倒计时，并丢掉已经过点的排队项
 * @desc 过点说明 `onHit` 这一帧已经放过了（或者播放器跳过了），
 *   留着会让答题卡停在 0 秒继续显示
 */
function onPromptProgress(currentTime: number): void {
  if (promptQueue.value.length === 0) {
    return;
  }

  const next: PromptEntry[] = [];

  promptQueue.value.forEach(entry => {
    const remaining = entry.anchor.time - currentTime;

    if (remaining > 0) {
      next.push(remaining === entry.remaining ? entry : { ...entry, remaining });
    }
  });

  promptQueue.value = next;
}

useAnchorScheduler({
  // 从 store 实时读取：配置面板里增删锚点后无需刷新即可生效
  getAnchors: () => barrageEffectStore.anchors,
  onHit: anchor => {
    // 到点答题卡必须立刻消失，再开演
    removePrompt(anchor.id);
    playAndRun(anchor);
  },
  getApproachLeadSec: anchor => collectLeadSecOf(anchor, getEffectTemplate(anchor.template)),
  onApproach,
  onProgress: onPromptProgress,
  onSeek: clearPrompts,
  // 工作台浮层盖住播放器时，真实图层上放特效没人看得见
  shouldSuppress: () => barrageEffectStore.workbenchVisible,
});

// 打开工作台时把答题卡收掉：它会被浮层盖住，关掉后也不该拿旧倒计时接着演
watch(
  () => barrageEffectStore.workbenchVisible,
  visible => {
    if (visible) {
      clearPrompts();
    }
  },
);

/**
 * 弹幕到达：先入缓冲，再判密度
 *
 * @desc 两件事**在同一个回调里按顺序做**，不是两个订阅各做各的。
 *   分成两个订阅就要依赖 emitter 按注册顺序回调，密度判定可能读到
 *   还没把这条消息算进去的快照 —— 阈值于是变成「比配置多一条」。
 *   顺序写死在这里，这个不确定性就不存在了。
 */
useBarrageSignalListener(signal => {
  signalBuffer.push(signal);

  // 工作台开着时不炸：作者正在浮层里调参，特效会在看不见的地方被消耗掉
  if (barrageEffectStore.workbenchVisible) {
    return;
  }

  const config = barrageEffectStore.density;
  const now = performance.now();

  if (
    !evaluateDensity(
      signalBuffer.snapshot(now, config.windowSec),
      config,
      barrageEffectStore.lastFiredAt,
      now,
    )
  ) {
    return;
  }

  // ★ 先记冷却再放。放的过程中消息还在进，顺序反了会在同一批里连放好几次
  barrageEffectStore.markDensityFired(now);
  // 参数走频道级共享配置：与直播手动触发、点播时间轴是同一份
  playAndRun(
    createRuntimeAnchor(config.template, barrageEffectStore.liveTemplateConfigOf(config.template)),
  );
});

onMounted(() => {
  // 先把尺寸量出来，playAnchor 才拿得到有效画布大小
  requestDraw();

  mobileFeed?.start();

  if (barrageEffectStore.anchors.length > 0) {
    console.info('[barrage-effect] 已加载时间锚点', barrageEffectStore.anchors);
  }
});

onBeforeUnmount(() => {
  driver.reset();
  clearPrompts();
});
</script>

<style lang="scss">
.c-pc-barrage-effect {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
.c-pc-barrage-effect__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
