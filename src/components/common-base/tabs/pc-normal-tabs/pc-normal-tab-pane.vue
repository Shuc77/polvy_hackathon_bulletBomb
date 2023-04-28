<!-- @file PC 端常规 Tabs 标签页面板 -->
<template>
  <div
    v-show="paneVisible"
    class="c-pc-normal-tab-pane"
  >
    <template v-if="renderSlot">
      <div class="c-pc-normal-tab-pane__content">
        <slot></slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { tabPaneProps, useTabPane } from '../hooks/use-tab-pane';

const props = defineProps(tabPaneProps());

const { paneVisible, renderSlot, tabPaneInstance } = useTabPane({ props });

defineExpose(tabPaneInstance);
</script>

<style lang="scss">
.c-pc-normal-tab-pane__content {
  position: relative;
  z-index: 10;
  box-sizing: border-box;
  min-height: 200px;
  padding: 40px 0;
}
</style>
