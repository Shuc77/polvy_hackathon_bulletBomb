<!-- @file PC 端文档组件 -->
<template>
  <div class="c-pc-doc">
    <div
      ref="wrapRef"
      class="c-pc-doc__wrap"
    ></div>

    <pc-doc-empty-placeholder v-if="emptyPlaceholderVisible" />
  </div>
</template>

<script setup lang="ts">
import PcDocEmptyPlaceholder from './pc-doc-empty-placeholder.vue';
import { useDoc } from './use-doc';
import { useDocKeydownControl } from './_hooks/use-keydown-control';
import { collectPlayerKeyboardEffectElements } from '@/components/page-watch-common/player/hooks/use-player-keyboard';

const { wrapRef, emptyPlaceholderVisible } = useDoc();

collectPlayerKeyboardEffectElements(wrapRef);
useDocKeydownControl();
</script>

<style lang="scss">
.c-pc-doc {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.c-pc-doc__wrap {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
}
</style>
