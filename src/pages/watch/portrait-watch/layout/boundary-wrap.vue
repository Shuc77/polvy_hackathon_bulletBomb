<template>
  <div
    class="c-portrait-boundary-wrap"
    :class="{
      'c-portrait-boundary-wrap--left': seat === 'left',
      'c-portrait-boundary-wrap--right': seat === 'right',
    }"
  >
    <div class="c-portrait-boundary-wrap__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

defineProps({
  /** 位置，左 or 右 */
  seat: PropUtils.oneOf(['left', 'right'] as const).def('left'),
});
</script>

<style lang="scss">
.c-portrait-boundary-wrap {
  position: absolute;
  bottom: 0;
  width: 0;
  height: 100vh;
}
.c-portrait-boundary-wrap--left {
  left: 0;
  .c-portrait-boundary-wrap__content {
    padding-top: 16px;
    padding-left: 16px;
  }
}
.c-portrait-boundary-wrap--right {
  right: 0;
  .c-portrait-boundary-wrap__content {
    display: inline-flex;
    padding-top: 16px;
    padding-right: 16px;
    transform: translateX(-100%);
  }
}
</style>
