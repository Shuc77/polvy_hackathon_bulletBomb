<template>
  <mobile-dialog
    class="c-mobile-playback-outline-dialog"
    :visible.sync="visible"
    :show-header="false"
    :show-footer="false"
    :closable="false"
    @close="handleCloseDialog(destroyMindMap)"
  >
    <div class="c-mobile-playback-outline-main">
      <mobile-icon-close
        class="c-mobile-playback-outline-main__close"
        @click="handleCloseDialog(destroyMindMap)"
      />
      <div
        id="mindMapContainer"
        ref="mindMapContainerRef"
        :style="mindMapStyle"
      ></div>
    </div>
  </mobile-dialog>
</template>

<script setup lang="ts">
import MobileDialog from '@/components/common-base/dialog/mobile-dialog/mobile-dialog.vue';
import { useOutlineDialog } from '../use-outline-dialog';
import { appEvents, useEventBusListener } from '@/app/app-events';
import MindMap from 'simple-mind-map';
import { computed, nextTick, ref } from 'vue';
import { OutlineNode } from '../type';
import { OutlineContentItem } from '@polyv/live-watch-sdk';
import { MobileIconClose } from '@/components/component-icons/mobile/map';

let mindMap: MindMap | null = null;

const mindMapContainerRef = ref();

const summaryList = ref<OutlineContentItem[]>([]);

const mapDomTree = computed<OutlineNode | null>(() => {
  return transformOutline(summaryList.value);
});

const mindMapStyle = computed(() => {
  return {
    with: '350px',
    height: `${document.body.clientHeight * 0.9}px`,
  };
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
  // 监听画布移动
  // mindMap.on('translate', (x: number, y: number) => {
  //   console.info('[ translate ]', x, y);
  //   const result = mindMap?.getSvgData() as SvgData;
  //   console.info('[ getSvgData ]', result);

  //   SvgToPng(result);
  // });
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
</script>

<style lang="scss">
@import 'simple-mind-map/dist/simpleMindMap.esm.css';

.c-mobile-playback-outline-dialog {
  z-index: $--zIndex-top;
}

.c-mobile-dialog__content {
  overflow: hidden !important;
}

.c-mobile-playback-outline-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #36373d;
}

.c-mobile-playback-outline-main__close {
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
  width: 350px;
  height: 220px;
  border-radius: 8px;
}

#mindMapContainer * {
  padding: 0;
  margin: 0;
}
</style>
