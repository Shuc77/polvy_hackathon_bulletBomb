<!-- @file 移动端菜单栏 Tabs 标签页 -->
<template>
  <div class="c-mobile-menu-tabs">
    <mobile-menu-tab-header>
      <template #header-suffix>
        <slot name="header-suffix"></slot>
      </template>
    </mobile-menu-tab-header>

    <div class="c-mobile-menu-tabs__body pws-main-tab-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileMenuTabHeader from './mobile-menu-tab-header.vue';
import { appEvents } from '@/app/app-events';
import { tabsProps, tabsEmits, useTabs } from '../hooks/use-tabs';

const props = defineProps(tabsProps());

const emit = defineEmits(tabsEmits());

const { tabsInstance } = useTabs({
  props,
  emit,
  switchEvent: appEvents.global.MobileBottomMenuSwitch,
});

defineExpose(tabsInstance);
</script>

<style lang="scss">
.c-mobile-menu-tabs {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  color: $--color-white;
  background: #202127;
}

.c-mobile-menu-tabs__body {
  position: relative;
  flex: 1;
}
</style>
