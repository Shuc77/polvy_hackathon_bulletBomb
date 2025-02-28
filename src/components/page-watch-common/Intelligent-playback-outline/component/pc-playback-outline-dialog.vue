<template>
  <pc-dialog
    class="c-pc-playback-outline-dialog"
    :width="740"
    :height="420"
    :visible.sync="visible"
    :closable="false"
  >
    <div class="c-pc-playback-outline-main">
      <pc-icon-close
        class="c-pc-playback-outline-main__close"
        @click="handleCloseDialog(destroyMindMap)"
      />

      <div class="slider-container">
        <div
          class="track"
          ref="trackRef"
          @click="handleScaleChange"
          @mousedown="startDrag"
          @mousemove="handleDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        >
          <div class="track-line"></div>
          <div
            class="slider-thumb"
            :style="thumbPosition"
            :class="{ dragging: isDragging }"
          ></div>
        </div>
        <span
          class="symbol minus"
          @click.stop="decrementScale"
          >−</span
        >
        <span
          class="symbol plus"
          @click.stop="incrementScale"
          >+</span
        >
      </div>

      <div
        id="mindMapContainer"
        ref="mindMapContainerRef"
      ></div>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import { PcIconClose } from '@/components/component-icons/pc/map';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { useOutlineDialog } from '../use-outline-dialog';
import { appEvents, useEventBusListener } from '@/app/app-events';
import MindMap from 'simple-mind-map';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { OutlineNode } from '../type';
import { OutlineContentItem } from '@polyv/live-watch-sdk';

let mindMap: MindMap | null = null;

const mindMapContainerRef = ref();

const summaryList = ref<OutlineContentItem[]>([]);

const mapDomTree = computed<OutlineNode | null>(() => {
  return transformOutline(summaryList.value);
});

function transformOutline(outline: OutlineContentItem[]): OutlineNode | null {
  if (!outline.length) return null;

  const createNode = (item: string[]): OutlineNode[] | [] => {
    if (!outline.length) return [];

    const secondChildrenNode: OutlineNode[] = [];
    for (let i = 0; i < item.length; i++) {
      secondChildrenNode.push({
        data: { text: item[i] },
      });
    }
    return secondChildrenNode;
  };

  return {
    data: {
      text: outline[0].title,
    },
    children: outline.map(item => ({
      data: { text: item.title },
      children: createNode(item.summary),
    })),
  };
}

async function initMindMap() {
  mindMap = new MindMap({
    el: mindMapContainerRef.value,
    data: mapDomTree.value,
    enableFreeDrag: false,
    readonly: true, // 只读
    isLimitMindMapInCanvas: true, // 限制在画布内
    initRootNodePosition: ['center', 'center'],
    layout: 'logicalStructure',
  } as any);
  mindMap.setThemeConfig({
    backgroundColor: '#36373d',
    lineColor: '#EEEEEE',
    lineWidth: 3,
    lineStyle: 'straight',
    lineRadius: 4,
    paddingX: 15,
    paddingY: 10,
    root: {
      shape: 'rectangle',
      fillColor: '#36373d',
      color: '#EEEEEE',
      borderColor: '#EEEEEE',
      borderRadius: 4,
      borderWidth: 2,
      borderDasharray: 'none',
    },
    second: {
      shape: 'rectangle',
      lineColor: 'transparent',
      fillColor: 'transparent',
      color: '#EEEEEE',
      borderColor: '#EEEEEE',
      borderRadius: 5,
      borderWidth: 2,
    },
    node: {
      shape: 'rectangle',
      lineColor: 'transparent',
      fillColor: 'transparent',
      color: '#EEEEEE',
      borderColor: 'transparent',
      borderRadius: 5,
      borderWidth: 0,
    },
  });

  // 监听节点数渲染完毕
  mindMap.on('node_tree_render_end', () => {
    mindMap?.view.fit(
      () => {
        mindMap?.getElRectInfo();
        mindMap?.resize();
        return false;
      },
      false,
      0,
    );
  });
}

function destroyMindMap() {
  if (!mindMap) return;
  mindMap.destroy();
}

const { visible, handleCloseDialog } = useOutlineDialog();

useEventBusListener(appEvents.global.OpenPlaybackOutlineDialog, async data => {
  summaryList.value = data.outlineContent;
  visible.value = true;

  await nextTick();
  initMindMap();
});

const isDragging = ref(false);
const containerWidth = ref(0);
const mindScale = ref(1);
const containerRect = ref<DOMRect>();
const trackRef = ref();

const thumbPosition = computed(() => ({
  left: `${((mindScale.value - 0.1) / 1.9) * 100}%`,
}));

const updateDimensions = () => {
  containerWidth.value = trackRef.value?.offsetWidth;
  containerRect.value = trackRef.value.getBoundingClientRect();
};

// 通用缩放更新方法
const updateScale = (newScale: number) => {
  if (!containerRect.value) return;

  mindScale.value = Number(newScale.toFixed(1));
  mindMap?.view.setScale(mindScale.value, 0, 0);
};

// 处理缩放变化
const updateMindMapScale = (e: MouseEvent) => {
  if (!containerRect.value) return;

  // 计算缩放比例（0.1-2范围）
  const rawScale = (e.clientX - containerRect.value.left) / containerRect.value.width;
  const newScale = Number(Math.min(2, Math.max(0.1, 0.1 + rawScale * 1.9)).toFixed(1));

  if (mindScale.value !== newScale) {
    updateScale(newScale);
  }
};

const decrementScale = () => {
  if (mindScale.value <= 0.1) {
    return;
  }
  const newScale = Math.max(0.1, mindScale.value - 0.1);
  updateScale(newScale);
};

const incrementScale = () => {
  if (mindScale.value >= 2) {
    return;
  }
  const newScale = Math.min(2, mindScale.value + 0.1);
  updateScale(newScale);
};

// 事件处理
const handleScaleChange = (e: MouseEvent) => {
  updateDimensions();
  updateMindMapScale(e);
};

const startDrag = (e: MouseEvent) => {
  isDragging.value = true;
  updateMindMapScale(e);
};

const handleDrag = (e: MouseEvent) => {
  if (isDragging.value) {
    updateMindMapScale(e);
  }
};

const endDrag = () => {
  isDragging.value = false;
};

onMounted(() => {
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDimensions);
});
</script>

<style lang="scss">
@import 'simple-mind-map/dist/simpleMindMap.esm.css';

.c-pc-playback-outline-dialog {
  z-index: $--zIndex-top;

  .c-pc-dialog__header {
    display: none;
  }

  .c-pc-dialog__body {
    overflow: hidden;
  }

  .c-pc-dialog__body {
    cursor: pointer;
  }
}

.c-pc-playback-outline-main {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #36373d;
}

.c-pc-playback-outline-main__close {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 20px !important;
  color: $--font-color-info;
  cursor: pointer;
}

#mindMapContainer {
  width: 740px;
  height: 420px;
  border-radius: 8px;
}

#mindMapContainer * {
  padding: 0;
  margin: 0;
}

.slider-container {
  position: absolute;
  bottom: 10px;
  width: 140px;
  height: 32px;
  padding: 0 20px;
  cursor: pointer;
}

.track {
  position: relative;
  height: 100%;
}

.track-line {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 2px;
  background: #e0e0e0;
  transform: translateY(-50%);
}

.slider-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 1px solid #bdbdbd;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  transform: translate(-50%, -50%);
}

.slider-thumb.dragging {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%) scale(1.2);
}

.symbol {
  position: absolute;
  top: 50%;
  font-size: 20px;
  color: #757575;
  user-select: none;
  transition: color 0.2s ease;
  transform: translateY(-50%);
}

.minus {
  left: 0;
}

.plus {
  right: 0;
}

/* 交互状态 */
.slider-container:hover .track-line {
  background: #bdbdbd;
}

.slider-container:hover .symbol {
  color: #fff;
}

.slider-thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
}
</style>
