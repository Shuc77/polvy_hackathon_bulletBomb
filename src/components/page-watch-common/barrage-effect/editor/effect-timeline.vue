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
        {{ anchors.length }} 个特效 · 拖动改时间 · 从左侧拖入新增
      </span>
    </div>

    <div
      v-if="!isAvailable"
      class="c-effect-timeline__disabled"
    >
      <span>直播中无时间轴，切到回放地址后可拖拽配置</span>
    </div>

    <div
      v-else
      class="c-effect-timeline__track"
      @mousedown="onTrackPointerDown"
      @touchstart="onTrackPointerDown"
      @mousemove="onTrackPointerMove"
      @mouseleave="onTrackPointerLeave"
    >
      <!-- 所有百分比都相对这条 lane 定位；trackRef 也指向它，
           百分号与 timeAt() 的换算才是同一把尺子 -->
      <div
        ref="trackRef"
        class="c-effect-timeline__lane"
      >
        <div class="c-effect-timeline__rail">
          <span
            v-for="tick in ticks"
            :key="tick.time"
            class="c-effect-timeline__tick"
            :style="{ left: percentOf(tick.time) + '%' }"
          >
            <i class="c-effect-timeline__tick-line" />
            <em class="c-effect-timeline__tick-label">{{ tick.label }}</em>
          </span>
        </div>

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

        <button
          v-for="anchor in anchors"
          :key="anchor.id"
          type="button"
          class="c-effect-timeline__marker"
          :class="{
            'c-effect-timeline__marker--selected': anchor.id === selectedId,
            'c-effect-timeline__marker--halo': anchor.id === selectedId && anchor.id === draggingId,
          }"
          :style="{ left: percentOf(displayTimeOf(anchor)) + '%' }"
          :data-anchor-id="anchor.id"
          :data-anchor-time="anchor.time"
        >
          <em class="c-effect-timeline__marker-label">{{ formatTime(displayTimeOf(anchor)) }}</em>
          <i class="c-effect-timeline__marker-dot" />
        </button>

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
  (e: 'move-anchor', id: string, time: number): void;
  (e: 'create-anchor', time: number, template: EffectTemplateName): void;
}>();

// duration 不在这里取：脚本里一律走 props.duration，模板里用的是 percentOf() 包装
const { currentTime, anchors, selectedId, isAvailable } = toRefs(props);

const {
  trackRef,
  activeId,
  originTime,
  ghostTime,
  hoverTime,
  dropPoint,
  onTrackPointerDown,
  onTrackPointerMove,
  onTrackPointerLeave,
} = useTimelineDrag({
  getDuration: () => props.duration,
  isAvailable: () => props.isAvailable,
  getAnchors: () => props.anchors,
  onSeek: time => emit('seek', time),
  onSelect: id => emit('select-anchor', id),
  onCommitMove: (id, time) => emit('move-anchor', id, time),
  onCreate: (time, template) => emit('create-anchor', time, template),
});

/** 正在被拖动的锚点，以及它此刻的落点 */
const draggingId = computed(() => (ghostTime.value === undefined ? undefined : activeId.value));

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

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;

  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

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
  align-items: center;
  justify-content: center;
  height: $track-height;
  font-size: 12px;
  color: #6d7488;
  border: 1px dashed #343a49;
  border-radius: 6px;
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
  top: 50%;
  right: 0;
  left: 0;
  height: $rail-height;
  background: #262b36;
  border-radius: $rail-height;
  transform: translateY(-50%);
}

.c-effect-timeline__tick {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.c-effect-timeline__tick-line {
  display: block;
  width: 1px;
  height: 12px;
  margin: 0 auto;
  background: #3a4152;
}

.c-effect-timeline__tick-label {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  font-style: normal;
  color: #5d6478;
}

.c-effect-timeline__marker {
  position: absolute;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  cursor: grab;
  background: none;
  border: 0;
  transform: translate(-50%, -50%);
}

.c-effect-timeline__marker-dot {
  width: 14px;
  height: 14px;
  background: #6d7488;
  border: 2px solid #171a21;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #454c5e;
  transition: background 0.15s;
}

.c-effect-timeline__marker-label {
  margin-bottom: 4px;
  font-size: 10px;
  font-style: normal;
  color: #9aa1b4;
  white-space: nowrap;
}

.c-effect-timeline__marker--selected .c-effect-timeline__marker-dot {
  background: $accent;
  box-shadow: 0 0 0 2px rgba($accent, 0.35);
}

.c-effect-timeline__marker--selected .c-effect-timeline__marker-label {
  color: #cdd6f0;
}

.c-effect-timeline__marker--halo .c-effect-timeline__marker-dot {
  box-shadow: 0 0 0 6px rgba($accent, 0.18);
}

.c-effect-timeline__origin {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 22px;
  background: #4a5163;
  transform: translate(-50%, -50%);
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
