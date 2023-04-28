<!-- @file PC 端侧边 Tabs 标签页 -->
<template>
  <div class="c-pc-aside-tabs">
    <!-- tab 头部 -->
    <pc-aside-tab-header />

    <!-- tab 主体 -->
    <div class="c-pc-aside-tabs__body pws-main-tab-body">
      <!-- 面板插槽 -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import PcAsideTabHeader from './pc-aside-tab-header.vue';
import { appEvents } from '@/app/app-events';
import { tabsProps, tabsEmits, useTabs } from '../hooks/use-tabs';

const props = defineProps(tabsProps());

const emit = defineEmits(tabsEmits());

const { tabsInstance } = useTabs({
  props,
  emit,
  switchEvent: appEvents.global.PcAsideMenuSwitch,
});

defineExpose(tabsInstance);
</script>

<style lang="scss">
.c-pc-aside-tabs {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-pc-aside-tabs__body {
  position: relative;
  flex: 1;
}
</style>
