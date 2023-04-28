<template>
  <div
    class="c-portrait-boundary-wrap"
    :class="{
      'c-portrait-boundary-wrap--right': seat === 'right',
    }"
    :style="style"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { usePageStore } from '@/store/use-page-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { computed } from 'vue';

defineProps({
  /** 位置，左 or 右 */
  seat: PropUtils.oneOf(['left', 'right'] as const).def('left'),
});

const { pageClientHeight } = storeDefinitionToRefs(usePageStore);

const style = computed(() => {
  return {
    height: `${pageClientHeight.value}px`,
  };
});
</script>

<style lang="scss">
.c-portrait-boundary-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
}
.c-portrait-boundary-wrap--right {
  right: 0;
  left: initial;
}
</style>
