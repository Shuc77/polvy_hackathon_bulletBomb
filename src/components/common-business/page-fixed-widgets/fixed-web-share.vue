<!-- @file PC 端页面固定的分享 -->
<template>
  <div class="c-fixed-web-share">
    <div
      ref="referenceRef"
      class="c-fixed-widget-button"
    >
      <pc-icon-share class="c-fixed-widget-button__icon c-fixed-web-share__icon" />
      <div class="c-fixed-widget-button__title">{{ $lang('share.title') }}</div>
    </div>

    <transition name="fade">
      <web-share-panel
        v-show="popperVisible"
        ref="popperRef"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PcIconShare } from '@/components/component-icons/pc/map';
import WebSharePanel from '@/components/common-business/web-share-panel/web-share-panel.vue';
import { usePopper } from '@/hooks/components/use-popper';

const { referenceRef, popperRef, popperVisible } = usePopper({
  trigger: 'hover',
  arrow: true,
  placement: 'left-end',
  popperOffset: [0, 5],
});
</script>

<style lang="scss">
.c-fixed-web-share__icon {
  margin-bottom: 4px;
  font-size: 22px;
}
</style>
