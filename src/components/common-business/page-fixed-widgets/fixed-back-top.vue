<!-- @file PC 端回到顶部按钮 -->
<template>
  <transition name="fade">
    <div
      v-if="backTopVisible"
      class="c-fixed-widget-button"
      @click="toBackTopPage"
    >
      <pc-icon-arrow-up class="c-fixed-widget-button__icon c-fixed-back-top__icon" />
      <div class="c-fixed-widget-button__title">{{ $lang('base.backTop') }}</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { PcIconArrowUp } from '@/components/component-icons/pc/map';

/** 回到顶部显示状态 */
const backTopVisible = ref(false);

/** 检查回到顶部显示状态 */
function checkBackTop() {
  if (document.documentElement.scrollTop > window.innerHeight) {
    backTopVisible.value = true;
  } else {
    backTopVisible.value = false;
  }
}

/** 将页面置顶 */
function toBackTopPage() {
  if (document.documentElement.scrollIntoView) {
    document.documentElement.scrollIntoView({ behavior: 'smooth' });
  } else {
    document.documentElement.scrollTop = 0;
  }
}

onMounted(() => {
  document.addEventListener('scroll', checkBackTop);
  checkBackTop();
});

onBeforeUnmount(() => {
  document.removeEventListener('scroll', checkBackTop);
});
</script>

<style lang="scss">
.c-fixed-back-top__icon {
  margin-top: -4px;
  margin-bottom: -4px;
  font-size: 36px !important;
}
</style>
