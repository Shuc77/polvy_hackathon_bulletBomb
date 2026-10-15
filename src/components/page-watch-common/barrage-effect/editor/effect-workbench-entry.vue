<!-- @file 弹幕特效工作台入口（悬浮按钮） -->
<template>
  <!-- Vue 2.7 要求模板单根；按钮与浮层都是 fixed 定位，这层包裹不影响布局 -->
  <div class="c-effect-workbench-entry-wrap">
    <button
      ref="entryRef"
      class="c-effect-workbench-entry"
      :class="{ 'is-active': workbenchVisible }"
      type="button"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }"
      @mousedown="onEntryPress"
      @touchstart="onEntryPress"
      @click="onEntryClick"
    >
      特效工作台
      <span
        v-if="anchorsCount > 0"
        class="c-effect-workbench-entry__badge"
        >{{ anchorsCount }}</span
      >
    </button>

    <effect-workbench v-if="workbenchVisible" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useBarrageEffectStore } from '@/store/use-barrage-effect-store';
import { useDraggable } from '@/themes/debug/composables/use-draggable';

/**
 * 工作台单独切一个 chunk
 * @desc 它连带模板库、舞台、时间轴和整包后台 UI 组件，比入口按钮重一个数量级。
 *   `v-if` 保证不开就不下载
 */
const EffectWorkbench = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "effect-workbench" */ '@/components/page-watch-common/barrage-effect/editor/effect-workbench.vue'
    ),
);

const barrageEffectStore = useBarrageEffectStore();
const { anchorsCount, workbenchVisible } = storeToRefs(barrageEffectStore);

const entryRef = ref<HTMLElement | null>(null);

const { position, onDragStart } = useDraggable(entryRef, {
  /**
   * 停左上角：观看页右下角是聊天输入框、左下角是播放控制条，只有左上角常态下是空的
   * （该位置仅在连麦异常时才有提示条），与主题调试面板的落点也一致
   */
  initialPosition: { top: 12, left: 12 },
  dragHandleSelector: '.c-effect-workbench-entry',
});

/** 按下时按钮所处的位置，用来区分「点击」和「拖动后松手」 */
let pressedAt = { top: 0, left: 0 };

function onEntryPress(event: MouseEvent | TouchEvent): void {
  pressedAt = { ...position.value };
  onDragStart(event);
}

function onEntryClick(): void {
  // 拖动过就是拖拽；此时松手往往仍落在按钮上，会补发一次 click，要挡掉
  if (position.value.top !== pressedAt.top || position.value.left !== pressedAt.left) {
    return;
  }

  barrageEffectStore.toggleWorkbench();
}
</script>

<style lang="scss">
.c-effect-workbench-entry {
  position: fixed;
  z-index: 9998;
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 10px 16px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  transition: background 0.2s;
}

.c-effect-workbench-entry:hover {
  background: rgba(0, 0, 0, 0.9);
}

.c-effect-workbench-entry.is-active {
  color: #212121;
  background: #fff;
}

.c-effect-workbench-entry__badge {
  padding: 0 6px;
  font-size: 11px;
  line-height: 16px;
  background: #ff3553;
  border-radius: 8px;
}
</style>
