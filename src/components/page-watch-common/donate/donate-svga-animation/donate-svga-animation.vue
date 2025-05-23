<!-- @file PC 端、移动端打赏特效 -->
<template>
  <div class="c-donate-svga-animation">
    <div
      ref="donateRef"
      class="c-donate-animation__content"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useDonateSvgaAnimation } from './use-donate-svga-animation';

const { donateRef } = useDonateSvgaAnimation();
</script>

<style lang="scss">
.c-donate-svga-animation {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 0;
  padding-bottom: 76.5%;
  pointer-events: none;
}

.c-donate-animation__content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}
</style>
