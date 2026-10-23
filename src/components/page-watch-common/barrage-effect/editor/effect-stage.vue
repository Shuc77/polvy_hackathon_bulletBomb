<template>
  <div class="c-effect-stage">
    <div class="c-effect-stage__head">
      <span class="c-effect-stage__title">{{ stageTitle }}</span>

      <!-- 预览模式：时间轴预览跟随播放进度叠加全部锚点；单个特效循环预览当前选中项 -->
      <div class="c-effect-stage__modes">
        <button
          type="button"
          class="c-effect-stage__mode"
          :class="{ 'is-active': mode === 'timeline' }"
          :disabled="!timeAxisAvailable"
          :title="timeAxisAvailable ? '跟随播放进度叠加全部锚点' : '直播中没有时间轴'"
          @click="emit('update:mode', 'timeline')"
        >
          时间轴预览
        </button>
        <button
          type="button"
          class="c-effect-stage__mode"
          :class="{ 'is-active': mode === 'source' }"
          @click="emit('update:mode', 'source')"
        >
          单个特效
        </button>
      </div>

      <span
        class="c-effect-stage__status"
        :class="{ 'is-live': hasVideo }"
      >
        {{ hasVideo ? '已镜像播放器画面' : '等待播放器画面…' }}
      </span>

      <!-- 红蓝对抗画在弹幕区域里，而不是整块播放器。区域本身不归作者调 ——
           它是观众在播放器控制栏「弹幕位置」里自己选的，这里只负责照做 -->
      <span
        v-if="descriptor?.followBarrageArea"
        class="c-effect-stage__area"
        title="跟随播放器控制栏里的「弹幕位置」设置"
      >
        弹幕区域 {{ areaLabel }}
      </span>

      <span
        v-if="debug"
        class="c-effect-stage__debug"
      >
        A {{ debug.primary }} · B {{ debug.secondary }} · 条数 {{ debug.count }} · 缝位
        {{ seamPercent }}%
      </span>

      <template v-if="mode === 'source' && descriptor">
        <button
          type="button"
          class="c-effect-stage__replay"
          @click="restart"
        >
          ▶ 重播
        </button>
        <button
          type="button"
          class="c-effect-stage__cancel"
          @click="emit('cancel-preview')"
        >
          ✕ 取消预览
        </button>
      </template>
      <span
        v-else-if="mode === 'timeline'"
        class="c-effect-stage__playhint"
      >
        {{ isPlaying ? '跟随播放中' : '按时间轴播放键预览' }}
      </span>
    </div>

    <!-- 时间轴模式下没有选中锚点时，舞台代表的是整条时间轴，不归某一张模板卡管；
         这时候把某张卡的模拟弹幕条挂出来，会让作者以为点一下只影响那张卡 -->
    <mock-barrage-bar
      v-if="isInteractive && (mode === 'source' || !!selectedAnchorId)"
      :words-a="feed?.wordsA"
      :words-b="feed?.wordsB"
      :enabled="mockFeedActive"
    />

    <div class="c-effect-stage__canvas-wrap">
      <canvas
        ref="canvasRef"
        class="c-effect-stage__canvas"
      />

      <!-- 答题卡：单个特效预览固定 3 秒，只为看清「答题 → 揭晓」的流程；
           时间轴预览走真实提前秒数与播放进度，和生产层同一套调度。
           收集区重叠时两张卡一起倒数，见 `.c-quiz-prompt-stack` -->
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
          :skippable="mode === 'source'"
          @skip="skipPreview"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { usePlayerStore } from '@/store/use-player-store';
import { barrageAreaLabel, barrageAreaOf } from '../barrage-area';
import { collectLeadSecOf, resolveCollectPrompt } from '../collect';
import { playEffectSound } from '../effect-sound';
import { getEffectTemplate } from '../effects';
import { resolveFeedMode } from '../feed-window';
import { spanOf } from '../span';
import type { AnchorFeed, BarrageAnchor, EffectParams, EffectTemplateName } from '../types';
import { useEffectCanvas, type EffectFrame } from '../use-effect-canvas';
import { useAnchorScheduler } from '../use-anchor-scheduler';
import { useInteractiveDriver, type DriverDebugState } from '../interactive-driver';
import { useBarrageSignalBuffer, useBarrageSignalListener } from '../barrage-signal';
import QuizPrompt from '../quiz-prompt.vue';
import { useStageCompositor } from './stage-compositor';
import { createStageBarrage } from './stage-barrage';
import MockBarrageBar from './mock-barrage-bar.vue';

/** 读数的刷新间隔（毫秒）。4Hz 够看，又不必把每帧的值搬进响应式系统 */
const DEBUG_INTERVAL = 250;

/**
 * 舞台答题卡的预览时长（秒）
 * @desc 固定值，不读配置。真实的提前收集可能是 30 秒，在工作台里干等 30 秒
 *   没法调参；3 秒足够看清提示 → 倒计时 → 揭晓的节奏
 */
const PREVIEW_LEAD_SEC = 3;

interface StagePrompt {
  /** 答题卡的稳定标识；时间轴预览里用锚点 id，避免换题时沿用旧倒计时 */
  key: string;
  question: string;
  hintA?: string;
  hintB?: string;
  remaining: number;
  total: number;
  accent?: string;
}

const props = defineProps<{
  /**
   * 预览模式
   * @desc `timeline` 跟随播放器进度，把时间轴上全部锚点当作生产层来放；
   *   `source` 循环预览当前选中的单个锚点/模板，供调参使用
   */
  mode: 'timeline' | 'source';
  /** 时间轴上的全部锚点；时间轴预览用 */
  anchors?: BarrageAnchor[];
  /** 当前选中的锚点 id；时间轴预览里改参数只更新这一条轨道 */
  selectedAnchorId?: string;
  /** 播放器是否在播放，只用于时间轴预览的提示 */
  isPlaying?: boolean;
  /**
   * 播放头当前时间，单位：秒
   * @desc 时间轴预览进入 / seek 时，补播「已经开场但还没结束」的特效 ——
   *   否则 0s 开始、长 300 秒的倒计时在 00:05 打开工作台会一片空白
   */
  currentTime?: number;
  /** 时间轴是否可用；直播下为 false */
  timeAxisAvailable?: boolean;
  /**
   * 单个特效模式预览的模板
   * @desc 直播下允许为空：模板库没选中任何卡片时，舞台只镜像直播画面，不循环特效
   */
  template?: EffectTemplateName;
  /** 已与模板默认值合并过的最终参数 */
  params: EffectParams;
  /** 选中锚点的驱动配置；没选中锚点时空，按模板默认方式预览 */
  feed?: AnchorFeed;
  /**
   * 选中锚点的时长（秒）
   * @desc ★ 它不进 `params`，而是 `Track.timeScale` 的输入 —— 所以必须显式传进来，
   *   并进下面那个重建的 watch key。漏掉的话作者拖完条带预览**什么都不变**，
   *   而那恰好是工作台存在的全部理由
   */
  span?: number;
  /** 选中锚点的 id；变化时重来，让每次改选都从头播一遍 */
  anchorKey?: string;
  /**
   * 密度触发的预览锚点
   * @desc ★ 判定靠**引用变化**，所以工作台每次点击都要换一个新对象
   *   （`createRuntimeAnchor` 每次都生成新的 id，引用必然不同）。
   *   **不传 `loop`**：触发锚点恒为 `static` 一次性播放，
   *   预览要和生产逐帧一致，不能这里循环那里不循环
   */
  triggerAnchor?: BarrageAnchor;
}>();

const emit = defineEmits<{
  (e: 'update:mode', mode: 'timeline' | 'source'): void;
  (e: 'cancel-preview'): void;
}>();

const canvasRef = ref<HTMLCanvasElement>();

const descriptor = computed(() => getEffectTemplate(props.template));

/**
 * 舞台标题
 * @desc 时间轴模式下屏幕上可能同时出现多个模板，标题不能写某一个模板的名字 ——
 *   否则作者会以为「数据雨」正在播，而实际上那是 02:30 的锚点，眼前这一帧是另一个
 */
const stageTitle = computed(() => {
  if (props.mode === 'timeline') {
    return '时间轴画面';
  }

  // 直播下没选中模板时舞台就是一块干净的播放器镜像，标题别再写「预览」
  return descriptor.value?.label ?? (props.timeAxisAvailable ? '预览' : '直播画面');
});

/** 观众在播放器「弹幕位置」里选的那块区域 */
const playerStore = usePlayerStore();

/**
 * 当前弹幕区域
 * @desc 舞台不另设控件：作者在这里看到的就是观众那边会得到的。
 *   区域来自播放器控制栏，工作台打开时改不了它 —— 那是**观众**的设置
 */
const areaLabel = computed(() =>
  barrageAreaLabel(playerStore.barrageLocationSetting[playerStore.currentBarrageLocationIndex]),
);

/** 当前画的是真实画面还是占位；同值写入不会触发渲染，可以放心每帧赋 */
const hasVideo = ref(false);

const { drawVideoLayer } = useStageCompositor();

/** 舞台订阅的缓冲与生产层是同一个事件的两个订阅者 —— 这就是「预览即生产」 */
const signalBuffer = useBarrageSignalBuffer();

/**
 * 上屏弹幕的舞台镜像
 * @desc ★ 工作台是整屏不透明的，真实的弹幕层就在它底下、一根毛都看不见 ——
 *   所以「点一下模拟弹幕，屏幕上什么都没发生」不是按钮坏了，是没有能显示它的地方。
 *   这里订阅的是**和特效层同一个** `BarrageLanded`，只是画在舞台画布上。
 *   模拟的、真实的走同一条路，所以镜像出来的东西不会和实际驱动的量对不上
 */
const stageBarrage = createStageBarrage();

useBarrageSignalListener(signal => stageBarrage.push(signal.text));

// 顺序不能倒：下面的 driver 要用 getSize
const { requestDraw, getSize } = useEffectCanvas({
  canvasRef,
  onFrame: renderFrame,
  onSizeChange: () => {
    // 实例在构造时固化了尺寸。时间轴预览里的转场可能只播一次，
    // 不重建的话窗口一改大小，这一发就会按旧尺寸画完 —— 拖全屏时最明显
    // eslint-disable-next-line no-use-before-define
    driver.invalidate();
  },
  // 舞台画面大，dpr 放开到 2；缩略图那边才需要压
  dprCap: 2,
  autoStart: true,
});

const driver = useInteractiveDriver({
  getSize,
  getSample: (now, seconds) => signalBuffer.snapshot(now, seconds),
  // 与生产层同一个换算：只有声明了 `followBarrageArea` 的模板会读它
  getArea: () =>
    barrageAreaOf(
      getSize(),
      playerStore.barrageLocationSetting[playerStore.currentBarrageLocationIndex],
    ),
});

/**
 * 观众换了弹幕位置：舞台跟着换
 * @desc 实例在构造时固化了尺寸，必须作废重建。舞台的时钟一直在跑，
 *   不用像生产层那样补画一帧
 */
watch(
  () => {
    const location = playerStore.barrageLocationSetting[playerStore.currentBarrageLocationIndex];

    return location ? `${location.direction}:${location.percent}` : 'full';
  },
  () => {
    driver.invalidate();
  },
);

/* ---------------- 时间轴预览 ---------------- */

/** 单个特效预览的答题卡（固定 3 秒），时间轴模式不用它 */
const previewPrompt = ref<StagePrompt>();

interface TimelinePromptEntry {
  anchor: BarrageAnchor;
  leadSec: number;
  remaining: number;
}

/** 时间轴预览里已经进入预滚、等待揭晓的答题卡 */
const timelinePromptQueue = ref<TimelinePromptEntry[]>([]);

/**
 * 当前该显示哪些答题卡
 * @desc 单个特效模式只有一张；时间轴模式把**所有仍在预滚**的锚点都排出来 ——
 *   收集区重叠时只显示队首，会让后一个特效看起来没有题目
 */
const activePrompts = computed<StagePrompt[]>(() => {
  if (props.mode === 'source') {
    return previewPrompt.value ? [previewPrompt.value] : [];
  }

  const prompts: StagePrompt[] = [];

  timelinePromptQueue.value.forEach(entry => {
    const entryDescriptor = getEffectTemplate(entry.anchor.template);
    const prompt = resolveCollectPrompt(entry.anchor, entryDescriptor);

    if (!prompt) {
      return;
    }

    prompts.push({
      key: entry.anchor.id,
      question: prompt.question,
      hintA: prompt.hintA,
      hintB: prompt.hintB,
      remaining: entry.remaining,
      total: entry.leadSec,
      accent: entryDescriptor?.accent,
    });
  });

  return prompts;
});

function clearTimelinePrompts(): void {
  timelinePromptQueue.value = [];
}

/**
 * 时间轴预览里待补播的一帧
 * @desc 不在 setup 里直接 `driver.play`：首帧之前画布还没量出尺寸，
 *   `play` 会因为尺寸为 0 静默丢弃。放到 `renderFrame` 里，尺寸一定已就绪
 */
let activeInitPending = props.mode === 'timeline';
let activeInitTime = props.currentTime ?? 0;

/**
 * 本次 seek / 进入时间轴时用「开场偏移」建过轨的锚点
 * @desc 调度器可能在同一秒再命中一次，靠它跳过重复开演。
 *   锚点时间一变就整组作废 —— 那条轨道代表的是旧位置
 */
const activeInitIds = new Set<string>();

/**
 * 补播「播放头已经进入其播放区间」的特效
 * @desc ★ 调度器只按**跨越**开演。从 00:05 打开工作台时，0s 开始、长 300 秒的
 *   倒计时早就跨过去了 —— 不补的话舞台就是空的，看起来像这条特效没生效。
 *
 *   用 `startAt` 快进到当前进度，而不是从头发一遍：倒计时应该显示 04:55，
 *   不是重新从 05:00 数。正在收集（还没到触发点）和已经播完的都不补
 */
function primeActiveAnchors(atTime: number): void {
  if (props.mode !== 'timeline') {
    return;
  }

  (props.anchors ?? []).forEach(anchor => {
    if (activeInitIds.has(anchor.id) || driver.hasTrack(anchor.id)) {
      return;
    }

    const anchorDescriptor = getEffectTemplate(anchor.template);

    if (!anchorDescriptor) {
      return;
    }

    const span = spanOf(anchor, anchorDescriptor);
    const offset = atTime - anchor.time;

    if (!(span > 0) || offset < 0 || offset >= span) {
      return;
    }

    activeInitIds.add(anchor.id);
    driver.play(anchor, { startAt: offset });
  });
}

/**
 * 锚点时间被拖动后，旧的「补播」标记立刻作废
 * @desc 否则作者把一条正在补播的特效拖到未来，调度器到点时会被误判成
 *   「这一秒已经播过」而跳过
 */
watch(
  () => (props.anchors ?? []).map(anchor => `${anchor.id}:${anchor.time}`).join('|'),
  () => {
    activeInitIds.clear();
  },
);

/**
 * 拖动进度条 / 点轨道 seek
 * @desc 先清空旧轨道再补播；否则上一次位置的特效会一直留在画布上。
 *   补播放到下一帧，`driver.reset()` 之后尺寸不会变，不存在丢轨问题
 */
function onTimelineSeek(currentTime: number): void {
  clearTimelinePrompts();

  if (props.mode !== 'timeline') {
    return;
  }

  driver.reset();
  activeInitIds.clear();
  activeInitPending = true;
  activeInitTime = currentTime;
  requestDraw();
}

function onTimelineApproach(anchor: BarrageAnchor): void {
  const leadSec = collectLeadSecOf(anchor, getEffectTemplate(anchor.template));

  if (!(leadSec > 0) || timelinePromptQueue.value.some(item => item.anchor.id === anchor.id)) {
    return;
  }

  timelinePromptQueue.value = [
    ...timelinePromptQueue.value,
    { anchor, leadSec, remaining: leadSec },
  ].sort((a, b) => a.anchor.time - b.anchor.time);
}

/** 用生产层同一套「锚点时间 - 当前进度」刷新倒计时 */
function onTimelineProgress(currentTime: number): void {
  if (timelinePromptQueue.value.length === 0) {
    return;
  }

  const next: TimelinePromptEntry[] = [];

  timelinePromptQueue.value.forEach(entry => {
    const remaining = entry.anchor.time - currentTime;

    if (remaining > 0) {
      next.push(remaining === entry.remaining ? entry : { ...entry, remaining });
    }
  });

  timelinePromptQueue.value = next;
}

/**
 * 锚点被删掉后，它的答题卡不能还挂在屏幕上
 * @desc 队列里的条目是「已经进入预滚」的快照。删锚点只改 `props.anchors`，
 *   调度器不会替我们回收已经排队的条目 —— 不清理的话，作者删掉 02:30 的题，
 *   答题卡还会自顾自倒数到 02:30 才消失
 */
watch(
  () => props.anchors?.map(anchor => anchor.id).join('|') ?? '',
  () => {
    if (timelinePromptQueue.value.length === 0) {
      return;
    }

    const aliveIds = new Set(props.anchors?.map(anchor => anchor.id));
    timelinePromptQueue.value = timelinePromptQueue.value.filter(item =>
      aliveIds.has(item.anchor.id),
    );
  },
);

/**
 * 时间轴预览的调度器
 * @desc 与生产层 `pc-barrage-effect.vue` 用的是**同一个**调度器：同一套跨越判定、
 *   同一套提前收集、同一套 seek 重新武装。差别只有宿主 —— 这里画在舞台画布上。
 *
 *   单个特效模式下 `shouldSuppress` 为真，调度器只推进 lastTime 不触发；
 *   切回时间轴时 `reset()` 重新武装，避免把这段时间错过的锚点一次性补放
 */
const scheduler = useAnchorScheduler({
  getAnchors: () => props.anchors ?? [],
  onHit: anchor => {
    // 到点答题卡立刻消失，再开演
    timelinePromptQueue.value = timelinePromptQueue.value.filter(
      item => item.anchor.id !== anchor.id,
    );

    // seek 补播可能已经为这一秒建了轨，别叠第二份
    if (activeInitIds.delete(anchor.id)) {
      return;
    }

    driver.play(anchor);
    // 与生产层同一个触发点：工作台里按时间轴播放时也能听到音效
    playEffectSound(anchor.template);
  },
  getApproachLeadSec: anchor => collectLeadSecOf(anchor, getEffectTemplate(anchor.template)),
  onApproach: onTimelineApproach,
  onProgress: onTimelineProgress,
  onSeek: onTimelineSeek,
  shouldSuppress: () => props.mode !== 'timeline',
});

/** 尺寸还没量出来时先记着，量到了在下一帧补播 */
let pendingPlay = true;

const debug = ref<DriverDebugState>();

const isInteractive = computed(() => (descriptor.value?.feedModes.length ?? 1) > 1);

/**
 * 模拟弹幕点下去**真的**会有反应吗
 *
 * @desc ★ 判定必须和驱动器同源。`createTrack` 也是拿 `resolveFeedMode` 决定要不要
 *   建收集窗的（`interactive-driver.ts`），而 `applyReading` 在 `!track.feed` 时
 *   直接 return —— 驱动方式是静态时，信号确实发出去了，但那条轨道压根没订阅它。
 *
 *   上面那个 `isInteractive` 问的是「模板**支不支持**互动」，这里问的是
 *   「这个锚点**现在是不是**在按互动跑」。两者不同：`feedModes[0]` 恒为 `static`，
 *   所以刚拖进来的锚点默认就是静态 —— 条子照样显示、按钮照样能点，点了却必然
 *   毫无反应。作者只会得出「这几个按钮坏了」的结论
 */
const mockFeedActive = computed(
  () =>
    !!descriptor.value &&
    resolveFeedMode(currentAnchor(descriptor.value.name), descriptor.value) !== 'static',
);

const seamPercent = computed(() => Math.round(((debug.value?.bias ?? 0) + 1) * 50));

/**
 * 造一个舞台预览用的锚点
 * @param template 必填：调用方先确认有模板。直播下「没选中模板」时舞台只镜像画面，
 *   不会走到任何播放路径
 */
function currentAnchor(template: EffectTemplateName): BarrageAnchor {
  return {
    id: props.anchorKey ?? 'stage-preview',
    time: 0,
    template,
    params: props.params,
    feed: props.feed,
    spanSec: props.span,
  };
}

let previewTimer: ReturnType<typeof setInterval> | undefined;

function stopPreviewPrompt(): void {
  if (previewTimer !== undefined) {
    clearInterval(previewTimer);
    previewTimer = undefined;
  }

  previewPrompt.value = undefined;
}

/**
 * 开演
 * @desc 生产层只播一次；舞台要一直循环 —— 1.5 秒的动画在你碰滑块之前就结束了。
 *   没选中模板时只清轨道：直播下取消预览后舞台应该回到干净的播放器画面
 */
function playPreview(): void {
  driver.reset();

  if (!descriptor.value) {
    return;
  }

  driver.play(currentAnchor(descriptor.value.name), { loop: true });
}

/** 当前锚点该不该先弹答题卡，以及文案是什么 */
function collectPreviewPrompt(): StagePrompt | undefined {
  if (!descriptor.value) {
    return undefined;
  }

  const anchor = currentAnchor(descriptor.value.name);

  if (!props.feed?.collect || resolveFeedMode(anchor, descriptor.value) === 'static') {
    return undefined;
  }

  const prompt = resolveCollectPrompt(anchor, descriptor.value);

  if (!prompt) {
    return undefined;
  }

  return {
    key: 'source-preview',
    question: prompt.question,
    hintA: prompt.hintA,
    hintB: prompt.hintB,
    remaining: PREVIEW_LEAD_SEC,
    total: PREVIEW_LEAD_SEC,
    accent: descriptor.value?.accent,
  };
}

/** 第一帧 / 重播：有答题卡就先走 3 秒预览，没有就立即开演 */
function startPreview(): void {
  // 时间轴模式由调度器按播放进度开演，不要在这里循环单个特效
  if (props.mode === 'timeline') {
    return;
  }

  stopPreviewPrompt();
  // 答题卡期间不能留着上一轮特效在底下继续跑
  driver.reset();

  const prompt = collectPreviewPrompt();

  if (!prompt) {
    playPreview();
    return;
  }

  const startedAt = performance.now();
  previewPrompt.value = prompt;

  previewTimer = setInterval(() => {
    const remaining = PREVIEW_LEAD_SEC - (performance.now() - startedAt) / 1000;

    if (remaining <= 0) {
      stopPreviewPrompt();
      playPreview();
      return;
    }

    if (previewPrompt.value) {
      previewPrompt.value = { ...previewPrompt.value, remaining };
    }
  }, 100);
}

/** 舞台里手动跳过答题卡 */
function skipPreview(): void {
  stopPreviewPrompt();
  playPreview();
}

function renderFrame({ ctx, size, delta }: EffectFrame): void {
  hasVideo.value = drawVideoLayer(ctx, size);

  // 真实弹幕只出现在观众选的区域里，镜像也得照做 —— 否则作者会以为
  // 弹幕铺满全屏，而线上观众看到的只有顶上一块
  const barrageArea = barrageAreaOf(
    size,
    playerStore.barrageLocationSetting[playerStore.currentBarrageLocationIndex],
  );

  // 第一帧才知道画布多大，所以补播放在这里而不是 setup 里
  if (pendingPlay) {
    pendingPlay = false;
    startPreview();
  }

  // 进入时间轴 / seek 之后，补播播放头上已经开场的特效
  if (activeInitPending) {
    activeInitPending = false;
    primeActiveAnchors(activeInitTime);
  }

  driver.tick(ctx, delta);

  // 弹幕画在特效**之上**：生产层里弹幕层也是压在特效层前面的
  // （`pc-watch-layout.vue` 里 `pc-barrage` 挂在 `pc-barrage-effect` 之前）
  stageBarrage.draw(ctx, size, delta, barrageArea);
}

/** 重来一遍：换模板、换锚点、手动重播都走它 */
function restart(): void {
  // 时间轴模式换选中的锚点只影响参数面板，不该把正在跑的时间轴预览清空
  if (props.mode === 'timeline') {
    return;
  }

  stopPreviewPrompt();
  pendingPlay = true;
  requestDraw();
}

/**
 * 切换预览模式
 * @desc 时间轴 → 单个：重新武装调度器并立刻开演选中项；
 *   单个 → 时间轴：清掉循环预览，让调度器从当前进度开始接管
 */
watch(
  () => props.mode,
  mode => {
    stopPreviewPrompt();
    clearTimelinePrompts();
    scheduler.reset();
    driver.reset();

    if (mode === 'source') {
      activeInitPending = false;
      pendingPlay = true;
      requestDraw();
      return;
    }

    // 单个特效 → 时间轴：从当前播放头接管，补播已经开场的锚点
    activeInitIds.clear();
    activeInitPending = true;
    activeInitTime = props.currentTime ?? 0;
    requestDraw();
  },
);

watch(
  () =>
    [
      props.template,
      props.anchorKey,
      props.feed?.mode,
      props.feed?.windowSec,
      // 开关答题卡要重走预览；文案与提前秒数不进 key —— 每敲一个字都打断 3 秒预滚就没法调了
      props.feed?.collect ? 'collect' : '',
      props.span,
    ].join('|'),
  restart,
);

/**
 * 密度触发预览
 * @desc 与生产层是**同一个 `driver.play(anchor)`**，差别只有画布。
 *   舞台的时钟一直在跑（`autoStart`），所以不像生产层那样需要额外 `start()`
 */
watch(
  () => props.triggerAnchor,
  anchor => {
    if (!anchor) {
      return;
    }

    driver.play(anchor);
    playEffectSound(anchor.template);
    requestDraw();
  },
);

watch(
  () => props.params,
  value => {
    // 走热更新而不是重建：工厂构造时会给每个粒子取随机数，
    // 每拖一下滑块重建一次就是每秒重新随机 60 次，预览会疯狂闪烁
    if (props.mode === 'timeline') {
      // 时间轴上可能同时跑着多条轨道，只改当前选中的那一条
      if (props.selectedAnchorId) {
        driver.updateParams(value, props.selectedAnchorId);
      }

      return;
    }

    driver.updateParams(value);
  },
  { deep: true },
);

let debugTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  debugTimer = setInterval(() => {
    debug.value = driver.getDebugState();
  }, DEBUG_INTERVAL);
});

onBeforeUnmount(() => {
  if (debugTimer !== undefined) {
    clearInterval(debugTimer);
  }

  stopPreviewPrompt();
  clearTimelinePrompts();
  driver.reset();
});
</script>

<style lang="scss">
.c-effect-stage {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.c-effect-stage__head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  align-items: center;
}

.c-effect-stage__title {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
}

.c-effect-stage__modes {
  display: flex;
  padding: 2px;
  background: #1b202a;
  border: 1px solid #2c3341;
  border-radius: 6px;
}

.c-effect-stage__mode {
  padding: 3px 8px;
  font-size: 11px;
  color: #8b93a7;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;

  &.is-active {
    color: #f2f5fb;
    background: #343d50;
  }

  &:disabled {
    color: #545b6d;
    cursor: not-allowed;
  }
}

.c-effect-stage__playhint {
  margin-left: auto;
  font-size: 11px;
  color: #7c8398;
}

.c-effect-stage__status {
  font-size: 11px;
  color: #6d7488;

  &.is-live {
    color: #2ee6a8;
  }
}

/* 区域提示：说明「这个模板为什么只画在这一块」。
   用胶囊而不是普通文字 —— 它是一则说明，不该和状态、读数混成一行灰字 */
.c-effect-stage__area {
  padding: 1px 8px;
  font-size: 10px;
  color: #9aa1b4;
  background: #232936;
  border: 1px solid #343a49;
  border-radius: 9px;
}

.c-effect-stage__debug {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #9aa1b4;
}

.c-effect-stage__replay,
.c-effect-stage__cancel {
  padding: 4px 12px;
  font-size: 12px;
  color: #d5dae8;
  cursor: pointer;
  background: #232936;
  border: 1px solid #3d4658;
  border-radius: 4px;
  transition: border-color 0.15s;

  &:hover {
    border-color: #4f7cff;
  }
}

.c-effect-stage__replay {
  margin-left: auto;
}

.c-effect-stage__canvas-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #101319;
  border: 1px solid #262c37;
  border-radius: 8px;
}

.c-effect-stage__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
