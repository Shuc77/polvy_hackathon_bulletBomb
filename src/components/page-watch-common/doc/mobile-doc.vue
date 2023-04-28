<!-- @file 移动端文档组件 -->
<template>
  <div class="c-mobile-doc">
    <div
      ref="wrapRef"
      class="c-mobile-doc__wrap"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useDoc } from './use-doc';

const { wrapRef } = useDoc();
</script>

<style lang="scss">
.c-mobile-doc {
  position: relative;
  z-index: 250;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.c-mobile-doc__wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
