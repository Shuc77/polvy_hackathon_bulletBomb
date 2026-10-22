<template>
  <div class="c-effect-timeline">
    <div class="c-effect-timeline__head">
      <button
        type="button"
        class="c-effect-timeline__transport"
        :disabled="!isAvailable"
        :title="isPlaying ? '暂停' : '播放'"
        @click="emit('toggle-play')"
      >
        {{ isPlaying ? '❚❚' : '▶' }}
      </button>

      <span class="c-effect-timeline__clock">{{ formatTime(currentTime) }}</span>
      <span
        v-if="isAvailable"
        class="c-effect-timeline__total"
      >
        / {{ formatTime(duration) }}
      </span>

      <span class="c-effect-timeline__title">时间轴</span>

      <span
        v-if="isAvailable"
        class="c-effect-timeline__hint"
      >
        {{ hint }}
      </span>
    </div>

    <div
      v-if="!isAvailable"
      class="c-effect-timeline__disabled"
    >
      <span>直播中无时间轴，切到回放地址后可拖拽配置</span>
      <!-- ★ 「不行」之外还得说「那现在能做什么」。只说前一半，用户就停在原地了 ——
           直播下照样有能出场的特效，走的是密度触发那条路 -->
      <span class="c-effect-timeline__disabled-sub">
        现在想让特效出场，用右上角「触发设置」里的密度触发
      </span>
    </div>

    <div
      v-else
      class="c-effect-timeline__track"
      :style="{ height: trackHeight + 'px' }"
      @mousedown="onTrackPress"
      @touchstart="onTrackPress"
      @mousemove="onTrackPointerMove"
      @mouseleave="onTrackPointerLeave"
    >
      <!-- 所有百分比都相对这条 lane 定位；trackRef 也指向它，
           百分号与 timeAt() 的换算才是同一把尺子 -->
      <div
        ref="trackRef"
        class="c-effect-timeline__lane"
      >
        <!-- 一条特效一条导轨。重叠时自动分轨，见 laneLayout -->
        <span
          v-for="(lane, index) in laneCount"
          :key="'rail-' + lane"
          class="c-effect-timeline__rail"
          :style="{ top: railTopOf(index) + 'px' }"
        />

        <span
          v-for="tick in ticks"
          :key="tick.time"
          class="c-effect-timeline__tick"
          :style="{ left: percentOf(tick.time) + '%' }"
        >
          <i class="c-effect-timeline__tick-line" />
          <em class="c-effect-timeline__tick-label">{{ tick.label }}</em>
        </span>

        <!-- 悬停幽灵：只在没有手势时出现 -->
        <span
          v-if="hoverTime !== undefined"
          class="c-effect-timeline__hover"
          :style="{ left: percentOf(hoverTime) + '%' }"
        >
          <em class="c-effect-timeline__hover-bubble">{{ formatTime(hoverTime) }}</em>
        </span>

        <!-- 投放幽灵：从模板库拖过来 -->
        <span
          v-if="dropPoint"
          class="c-effect-timeline__drop"
          :class="{ 'c-effect-timeline__drop--invalid': !dropPoint.valid }"
          :style="{ left: percentOf(dropPoint.time) + '%' }"
        >
          <em class="c-effect-timeline__drop-bubble">
            {{ dropPoint.valid ? formatTime(dropPoint.time) : '此处不可放置' }}
          </em>
        </span>

        <!-- 拖动起点刻度：不隐藏原位，才看得出移动了多少 -->
        <span
          v-if="draggingId && ghostTime !== undefined"
          class="c-effect-timeline__origin"
          :style="{ left: percentOf(originTime) + '%' }"
        />

        <!-- 收集段：锚点左侧的虚线带。旧锚点没开答题卡就没有它 -->
        <span
          v-for="band in collectBands"
          :key="'collect-' + band.anchor.id"
          class="c-effect-timeline__collect"
          :style="band.style"
        >
          <em class="c-effect-timeline__collect-label">收集 {{ band.seconds }}s</em>
        </span>

        <!-- 条带：从触发点向右铺开，长度就是这个特效播多久。
             ★ 本体 `pointer-events: none` —— 它只画不接手势。否则一条 300 秒的
             倒计时会挡住半条轨道，那片区域再也搓不了碟；而且重叠时 `closest()`
             只认 DOM 里第一个匹配，被压住的条带会永远选不中。接手势的只有
             圆点（选择/改时间）和把手（改时长） -->
        <button
          v-for="anchor in anchors"
          :key="anchor.id"
          type="button"
          class="c-effect-timeline__marker"
          :class="{
            'c-effect-timeline__marker--selected': anchor.id === selectedId,
            'c-effect-timeline__marker--halo':
              anchor.id === selectedId && anchor.id === activeGestureId,
            'c-effect-timeline__marker--flip': isNearEnd(displayTimeOf(anchor)),
          }"
          :style="bandStyleOf(anchor)"
          :data-anchor-id="anchor.id"
          :data-anchor-time="anchor.time"
        >
          <i class="c-effect-timeline__marker-band" />
          <em class="c-effect-timeline__marker-label">
            {{ formatTime(displayTimeOf(anchor)) }} · {{ formatSpan(displaySpanOf(anchor)) }}
          </em>
          <i class="c-effect-timeline__marker-dot" />
          <!-- 把手只在选中时渲染：短条带上它和圆点会挤在一起，常显的话
               想点圆点改时间会变成改时长。★ 它是 <i> 不是 <button> ——
               button 里套 button 是非法 HTML -->
          <i
            v-if="anchor.id === selectedId"
            class="c-effect-timeline__marker-grip"
            data-anchor-resize
          />
        </button>

        <!-- 自动对齐参考线：拖到另一条特效/收集段/播放头附近时出现 -->
        <span
          v-if="snapTime !== undefined"
          class="c-effect-timeline__snap"
          :style="{ left: percentOf(snapTime) + '%' }"
        >
          <em class="c-effect-timeline__snap-bubble">对齐 {{ snapLabel }}</em>
        </span>

        <span
          class="c-effect-timeline__playhead"
          :style="{ left: percentOf(currentTime) + '%' }"
        >
          <i class="c-effect-timeline__playhead-grip" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { collectLeadSecOf } from '../collect';
import { getEffectTemplate } from '../effects';
import { spanOf } from '../span';
import type { BarrageAnchor, EffectTemplateName } from '../types';
import { useTimelineDrag } from './use-timeline-drag';

const props = defineProps<{
  /** 总时长（秒）；<= 0 表示时间轴不可用 */
  duration: number;
  /** 当前播放位置（秒） */
  currentTime: number;
  anchors: BarrageAnchor[];
  selectedId?: string;
  /** 时间轴是否可用；直播下为 false */
  isAvailable: boolean;
  /** 播放器是否正在播放 */
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-play'): void;
  (e: 'seek', time: number): void;
  (e: 'select-anchor', id: string): void;
  (e: 'move-anchor', id: string, time: number, aligned?: boolean): void;
  (e: 'resize-anchor', id: string, span: number): void;
  (e: 'create-anchor', time: number, template: EffectTemplateName): void;
  /** 开始操作时间轴：父层据此暂停播放，别让播放头在编辑时继续跑 */
  (e: 'pause'): void;
}>();

// duration 不在这里取：脚本里一律走 props.duration，模板里用的是 percentOf() 包装
const { currentTime, anchors, selectedId, isAvailable } = toRefs(props);

/** 单条轨道的显示高度。条带、圆点、标签都按它算纵向位置 */
const LANE_HEIGHT = 48;

/**
 * 最多分几条轨
 * @desc 超过之后不再继续加高：工作台底部是固定结构，轨无限长会把舞台压没。
 *   多出来的并发塞进最早空出的那条，可接受地叠一点
 */
const MAX_LANES = 4;

interface LaneEntry {
  anchor: BarrageAnchor;
  /** 拖动中的实时触发时间 */
  time: number;
  span: number;
  /** 提前收集秒数；0 = 没有收集段 */
  lead: number;
  /** 段左端（含收集期），夹到 0 */
  start: number;
  /** 段右端 */
  end: number;
  lane: number;
}

const {
  trackRef,
  activeId,
  originTime,
  ghostTime,
  ghostSpan,
  snapTime,
  hoverTime,
  dropPoint,
  onTrackPointerDown,
  onTrackPointerMove,
  onTrackPointerLeave,
} = useTimelineDrag({
  getDuration: () => props.duration,
  isAvailable: () => props.isAvailable,
  getAnchors: () => props.anchors,
  getPlayhead: () => currentTime.value,
  onSeek: time => emit('seek', time),
  onSelect: id => emit('select-anchor', id),
  onCommitMove: (id, time, aligned) => emit('move-anchor', id, time, aligned),
  onCommitResize: (id, span) => emit('resize-anchor', id, span),
  onCreate: (time, template) => emit('create-anchor', time, template),
});

/**
 * 时间轴上的按下统一先暂停
 * @desc 拖锚点、拉时长、搓碟都算「开始编辑」。播放头继续跑的话，
 *   手里拖的位置和画面里的进度会一起变，改完还得回头找刚才那一帧
 */
function onTrackPress(event: MouseEvent | TouchEvent): void {
  emit('pause');
  onTrackPointerDown(event);
}

/** 正在被拖动的锚点，以及它此刻的落点 */
const draggingId = computed(() => (ghostTime.value === undefined ? undefined : activeId.value));

/** 正在被拉长/缩短的锚点 */
const resizingId = computed(() => (ghostSpan.value === undefined ? undefined : activeId.value));

/**
 * 正在被手势操作的那个锚点（改时间或改时长）
 * @desc 刻意**不写进模板**：`??` 在 Vue 2.7 的模板编译里没被验证过，
 *   而这个仓库已经因为「模板表达式用了 TS 能过、编译器不认的语法」炸过一次构建。
 *   能挪进脚本的一律挪进脚本
 */
const activeGestureId = computed(() => draggingId.value ?? resizingId.value);

function percentOf(time: number): number {
  if (props.duration <= 0) {
    return 0;
  }

  return Math.min(Math.max(time / props.duration, 0), 1) * 100;
}

/** 拖动中的锚点跟随幽灵位置，其余按真实时间 */
function displayTimeOf(anchor: BarrageAnchor): number {
  return anchor.id === draggingId.value && ghostTime.value !== undefined
    ? ghostTime.value
    : anchor.time;
}

/** 拖动中的条带跟随幽灵时长，其余按真实值 */
function displaySpanOf(anchor: BarrageAnchor): number {
  if (anchor.id === resizingId.value && ghostSpan.value !== undefined) {
    return ghostSpan.value;
  }

  return spanOf(anchor, getEffectTemplate(anchor.template));
}

/**
 * 自动分轨
 *
 * @desc 区间是 `[触发时间 - 提前收集, 触发时间 + 播放时长]`，因为收集段也占着
 *   作者和观众的注意力，两条收集段叠在一起同样看不清。按起点排序后，每条放进
 *   **第一条已经空出来的**轨道；全部在忙才开新轨。超过 `MAX_LANES` 时塞进最早
 *   空出的那条 —— 界面高度有上限，宁可叠一点也不把舞台压没
 *
 *   ★ 不新增任何持久化字段：轨道是**显示层**算出来的，拖动 / 拉长时实时重排。
 *   把 lane 存进锚点会让它在两次打开之间莫名跳位
 */
const laneLayout = computed(() => {
  const sorted = props.anchors
    .map(anchor => {
      const time = displayTimeOf(anchor);
      const span = displaySpanOf(anchor);
      const lead = collectLeadSecOf(anchor, getEffectTemplate(anchor.template));

      /**
       * ★ 轨道分配只看**已经提交**的时间和时长
       * @desc 拖动中按幽灵位置重排的话，两条条带会在指针底下换轨：
       *   作者按住的是 A 的圆点，换轨之后手指下面已经是 B，
       *   看起来就像「滑过去自动操控了下面那个特效」。
       *
       *   位置与长度仍然用幽灵值，所以条带照样跟手；只有「在哪条轨」钉住不动。
       *   松手提交后重排一次，那次是用户预期内的
       */
      const committedSpan = spanOf(anchor, getEffectTemplate(anchor.template));

      return {
        anchor,
        time,
        span,
        lead,
        start: Math.max(0, time - lead),
        end: time + span,
        laneStart: Math.max(0, anchor.time - lead),
        laneEnd: anchor.time + committedSpan,
      };
    })
    .sort((a, b) => a.laneStart - b.laneStart || a.laneEnd - b.laneEnd);

  const laneEnds: number[] = [];
  let overflow = 0;

  const entries: LaneEntry[] = sorted.map(item => {
    let lane = laneEnds.findIndex(end => end <= item.laneStart);

    if (lane === -1) {
      if (laneEnds.length < MAX_LANES) {
        lane = laneEnds.length;
        laneEnds.push(item.laneEnd);
      } else {
        lane = 0;

        for (let index = 1; index < laneEnds.length; index += 1) {
          if (laneEnds[index] < laneEnds[lane]) {
            lane = index;
          }
        }

        laneEnds[lane] = Math.max(laneEnds[lane], item.laneEnd);
        overflow += 1;
      }
    } else {
      laneEnds[lane] = item.laneEnd;
    }

    return {
      anchor: item.anchor,
      time: item.time,
      span: item.span,
      lead: item.lead,
      start: item.start,
      end: item.end,
      lane,
    };
  });

  return { entries, laneCount: Math.max(1, laneEnds.length), overflow };
});

const laneMap = computed(() => {
  const map = new Map<string, LaneEntry>();

  laneLayout.value.entries.forEach(entry => {
    map.set(entry.anchor.id, entry);
  });

  return map;
});

const laneCount = computed(() => laneLayout.value.laneCount);
const trackHeight = computed(() => laneCount.value * LANE_HEIGHT);
const overflowCount = computed(() => laneLayout.value.overflow);

const hint = computed(() => {
  // 空时间轴不需要「1 轨并行」—— 0 个特效却说并行了一条轨，看着像状态坏了
  if (props.anchors.length === 0) {
    return '时间轴还是空的 · 从左侧拖入模板开始';
  }

  const parts = [`${props.anchors.length} 个特效`, `${laneCount.value} 轨并行`];

  if (overflowCount.value > 0) {
    parts.push(`${overflowCount.value} 个并发叠放`);
  }

  parts.push('拖动改时间（靠近自动对齐）', '从左侧拖入新增', '选中后 Delete 删除');

  return parts.join(' · ');
});

/**
 * 第 lane 条导轨（从 0 数）的中心纵坐标
 *
 * @desc ★ lane 必须从 0 数：`laneLayout` 分配的就是 0 基下标，条带的
 *   `bandStyleOf` 也直接往里传。写成 `(lane - 1)` 会让第一条轨道算成 -24px ——
 *   条带整个跑到时间轴上方、压住标题栏，而手势监听挂在下面的轨道上，
 *   于是「看得见、拖不到」，看起来就像时间轴坏了
 */
function railTopOf(lane: number): number {
  return lane * LANE_HEIGHT + LANE_HEIGHT / 2;
}

/**
 * 条带的左端、宽度与所在轨道
 *
 * @desc 宽度要夹到轨道末端：越过后半段会**画到轨道外面**（这条链路上没有任何
 *   `overflow: hidden`），而且把手出界之后就再也抓不到了。
 *   存储值本身不夹 —— 换了视频时长它还得在
 */
function bandStyleOf(anchor: BarrageAnchor): Record<string, string> {
  const entry = laneMap.value.get(anchor.id);
  const time = entry?.time ?? displayTimeOf(anchor);
  const span = entry?.span ?? displaySpanOf(anchor);
  const left = percentOf(time);
  const lane = entry?.lane ?? 0;
  const top = railTopOf(lane);

  if (props.duration <= 0) {
    return { left: `${left}%`, width: '0%', top: `${top}px` };
  }

  const width = Math.min(percentOf(span), Math.max(0, 100 - left));

  return { left: `${left}%`, width: `${width}%`, top: `${top}px` };
}

/** 收集段的位置。旧锚点没有 collect，lead 为 0，不渲染 */
const collectBands = computed(() => {
  const bands: Array<{
    anchor: BarrageAnchor;
    seconds: number;
    style: Record<string, string>;
  }> = [];

  laneLayout.value.entries.forEach(entry => {
    if (!(entry.lead > 0)) {
      return;
    }

    const left = percentOf(entry.start);
    const width = percentOf(entry.time) - left;

    if (width <= 0) {
      return;
    }

    bands.push({
      anchor: entry.anchor,
      seconds: Math.round(entry.lead),
      style: {
        left: `${left}%`,
        width: `${width}%`,
        top: `${entry.lane * LANE_HEIGHT + 5}px`,
        height: `${LANE_HEIGHT - 10}px`,
      },
    });
  });

  return bands;
});

/**
 * 时长读数
 * @desc ★ 这个数字不是装饰。一条 3600 秒的轨道上，2.8 秒的条带只占 0.078%，
 *   不到一个像素 —— CSS 的 `min-width` 把它撑到能摸得着，但撑出来的像素宽度
 *   说的是谎话。**读数是真的，像素只是给眼睛扫的**
 */
function formatSpan(seconds: number): string {
  const rounded = Math.round(seconds * 10) / 10;

  return Number.isInteger(rounded) ? `${rounded}s` : `${rounded.toFixed(1)}s`;
}

/** 靠近轨道末端时标签向左翻，否则会溢出轨道 */
function isNearEnd(time: number): boolean {
  return percentOf(time) > 78;
}

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;

  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

/** 吸附提示：贴到播放头时说「播放头」，其余直接报时间 */
const snapLabel = computed(() => {
  if (snapTime.value === undefined) {
    return '';
  }

  return Math.abs(snapTime.value - Math.round(props.currentTime)) < 0.01
    ? '播放头'
    : formatTime(snapTime.value);
});

/** 五等分刻度，够定位又不至于密到看不清 */
const ticks = computed(() => {
  if (props.duration <= 0) {
    return [];
  }

  return [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    time: props.duration * ratio,
    label: formatTime(props.duration * ratio),
  }));
});
</script>

<style lang="scss">
$track-height: 56px;
$rail-height: 6px;
$accent: #4f7cff;
$danger: #ff6b6b;

.c-effect-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.c-effect-timeline__head {
  display: flex;
  gap: 12px;
  align-items: center;
}

.c-effect-timeline__transport {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 26px;
  padding: 0;
  font-size: 11px;
  line-height: 1;
  color: #d5dae8;
  cursor: pointer;
  background: #232936;
  border: 1px solid #3d4658;
  border-radius: 4px;
  transition: border-color 0.15s;

  &:hover:not(:disabled) {
    border-color: #4f7cff;
  }

  &:disabled {
    color: #5d6478;
    cursor: not-allowed;
  }
}

.c-effect-timeline__clock {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: #e8eaf0;
}

.c-effect-timeline__total {
  margin-left: -6px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: #6d7488;
}

.c-effect-timeline__title {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
}

.c-effect-timeline__hint {
  font-size: 12px;
  color: #7c8398;
}

.c-effect-timeline__disabled {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  justify-content: center;
  height: $track-height;
  font-size: 12px;
  color: #6d7488;
  border: 1px dashed #343a49;
  border-radius: 6px;
}

.c-effect-timeline__disabled-sub {
  font-size: 11px;
  color: #e0a458;
}

.c-effect-timeline__track {
  height: $track-height;
  touch-action: none;
  cursor: pointer;
  user-select: none;
  background: #171a21;
  border-radius: 6px;
}

/* 左右各留出半个标记的宽度，0% 与 100% 的标记才不会被轨道边缘切掉 */
.c-effect-timeline__lane {
  position: relative;
  height: 100%;
  margin: 0 14px;
}

.c-effect-timeline__rail {
  position: absolute;
  right: 0;
  left: 0;
  height: $rail-height;
  background: #262b36;
  border-radius: $rail-height;
  transform: translateY(-50%);
}

/* 刻度线贯穿全部轨道，标签贴在底部 —— 多轨时按「中间」定位会正好压在条带上 */
.c-effect-timeline__tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  pointer-events: none;
  transform: translateX(-50%);
}

.c-effect-timeline__tick-line {
  display: block;
  width: 1px;
  height: 100%;
  margin: 0 auto;
  background: #2c3243;
}

.c-effect-timeline__tick-label {
  position: absolute;
  bottom: 1px;
  left: 50%;
  display: block;
  padding: 0 3px;
  font-size: 10px;
  font-style: normal;
  line-height: 1.4;
  color: #5d6478;
  white-space: nowrap;
  background: #171a21;
  transform: translateX(-50%);
}

.c-effect-timeline__marker {
  position: absolute;
  /* top 由 bandStyleOf 按轨道算出来，不再固定居中 */
  min-width: 18px;
  height: 18px;
  padding: 0;
  /* ★ 本体只画不接手势 —— 见模板里那段注释。接手势的是圆点和把手 */
  pointer-events: none;
  background: none;
  border: 0;
  /* ★ 只保留纵向居中，横向不再居中：条带左端就是触发点。
     圆点与标签各自 translateX(-50%) 对回那个点，
     与播放头、刻度仍然是同一把尺子 */
  transform: translateY(-50%);
}

.c-effect-timeline__marker-band {
  position: absolute;
  top: 4px;
  right: 0;
  bottom: 4px;
  left: 0;
  background: rgba(109, 116, 136, 0.34);
  border: 1px solid #454c5e;
  border-radius: 3px;
  transition: background 0.15s;
}

.c-effect-timeline__marker-dot {
  position: absolute;
  top: 50%;
  left: 0;
  width: 14px;
  height: 14px;
  pointer-events: auto;
  cursor: grab;
  background: #6d7488;
  border: 2px solid #171a21;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #454c5e;
  transition: background 0.15s;
  /* 把圆点**中心**对回触发时间。条带不再横向居中，这一步必须在这里补上，
     否则圆点相对播放头、刻度会整体偏半个圆点 */
  transform: translate(-50%, -50%);
}

.c-effect-timeline__marker-label {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
  font-size: 10px;
  font-style: normal;
  color: #9aa1b4;
  white-space: nowrap;
  transform: translateX(-50%);
}

/* 靠近轨道末端时向左翻，否则标签会溢出轨道 */
.c-effect-timeline__marker--flip .c-effect-timeline__marker-label {
  transform: translateX(-100%);
}

.c-effect-timeline__marker-grip {
  position: absolute;
  top: 50%;
  right: 0;
  width: 10px;
  height: 18px;
  pointer-events: auto;
  cursor: ew-resize;
  background: #8b93a8;
  border-radius: 2px;
  transition: background 0.15s;
  transform: translate(50%, -50%);
}

.c-effect-timeline__marker--selected .c-effect-timeline__marker-band {
  background: rgba($accent, 0.28);
  border-color: rgba($accent, 0.6);
}

.c-effect-timeline__marker--selected .c-effect-timeline__marker-dot {
  background: $accent;
  box-shadow: 0 0 0 2px rgba($accent, 0.35);
}

.c-effect-timeline__marker--selected .c-effect-timeline__marker-grip {
  background: $accent;
}

.c-effect-timeline__marker--selected .c-effect-timeline__marker-label {
  color: #cdd6f0;
}

.c-effect-timeline__marker--halo .c-effect-timeline__marker-dot {
  box-shadow: 0 0 0 6px rgba($accent, 0.18);
}

.c-effect-timeline__origin {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: #4a5163;
  transform: translateX(-50%);
}

/* 收集段：斜纹 + 虚线边框，「这段时间在收集」一眼可见 */
.c-effect-timeline__collect {
  position: absolute;
  overflow: hidden;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    135deg,
    rgba(79, 124, 255, 0.16) 0,
    rgba(79, 124, 255, 0.16) 6px,
    rgba(79, 124, 255, 0.04) 6px,
    rgba(79, 124, 255, 0.04) 12px
  );
  border: 1px dashed rgba(79, 124, 255, 0.62);
  border-radius: 3px;
}

.c-effect-timeline__collect-label {
  position: absolute;
  top: 50%;
  left: 4px;
  font-size: 9px;
  font-style: normal;
  color: #8fa8ff;
  white-space: nowrap;
  transform: translateY(-50%);
}

/* 自动对齐参考线：黄色虚线，和红色播放头、蓝色投放幽灵区分开 */
.c-effect-timeline__snap {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 209, 102, 0.95) 0 4px,
    transparent 4px 8px
  );
  transform: translateX(-50%);
}

.c-effect-timeline__snap-bubble {
  position: absolute;
  top: 2px;
  left: 50%;
  padding: 1px 6px;
  font-size: 10px;
  font-style: normal;
  color: #2a2410;
  white-space: nowrap;
  background: #ffd166;
  border-radius: 3px;
  transform: translateX(-50%);
}

.c-effect-timeline__playhead {
  position: absolute;
  top: 6px;
  bottom: 6px;
  width: 2px;
  pointer-events: none;
  background: #ff5a5a;
  transform: translateX(-50%);
}

.c-effect-timeline__playhead-grip {
  position: absolute;
  top: -2px;
  left: 50%;
  width: 8px;
  height: 8px;
  background: #ff5a5a;
  border-radius: 50%;
  transform: translateX(-50%);
}

.c-effect-timeline__hover,
.c-effect-timeline__drop {
  position: absolute;
  top: 6px;
  bottom: 6px;
  width: 1px;
  pointer-events: none;
  background: #5d6478;
  transform: translateX(-50%);
}

.c-effect-timeline__drop {
  width: 2px;
  background: $accent;
}

.c-effect-timeline__drop--invalid {
  background: $danger;
}

.c-effect-timeline__hover-bubble,
.c-effect-timeline__drop-bubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  padding: 1px 6px;
  font-size: 10px;
  font-style: normal;
  color: #d5dae8;
  white-space: nowrap;
  background: #2c3243;
  border-radius: 3px;
  transform: translateX(-50%);
}

.c-effect-timeline__drop-bubble {
  color: #fff;
  background: rgba($accent, 0.9);
}

.c-effect-timeline__drop--invalid .c-effect-timeline__drop-bubble {
  background: rgba($danger, 0.9);
}
</style>
