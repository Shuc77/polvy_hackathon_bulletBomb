<!-- @file PC 端常规 Tabs 标签头部 -->
<template>
  <div class="c-pc-normal-tab-header g-clearfix">
    <div
      v-for="(paneData, index) in tabPaneData"
      :key="index"
      ref="itemRef"
      class="c-pc-normal-tab-header__header__item"
      :class="{
        'c-pc-normal-tab-header__header__item--current': paneData.name === currentTabName,
      }"
      @click="onClickHeaderItem(paneData)"
    >
      <div
        v-if="isWeixin && paneData.hackWeixinBtn"
        :id="generateHackWeixinBtnId(paneData.name)"
        class="c-pc-normal-tab-header__hack-weixin-btn"
      ></div>
      {{ paneData.label }}
    </div>

    <div
      v-if="tabPaneData.length > 1"
      ref="currentLineRef"
      class="c-pc-normal-tab-header__current-line pws-normal-tab-current-line"
      :style="{
        left: `${currentLineLeft}px`,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { isWeixin } from '@/assets/utils/browser';
import { useTabHeader } from '../hooks/use-tab-header';
import { generateHackWeixinBtnId, tabsHeaderProps } from '../hooks/use-tabs';

const props = defineProps(tabsHeaderProps());

const { tabPaneData, currentTabName, currentLineRef, onClickHeaderItem, itemRef, currentLineLeft } =
  useTabHeader(props);
</script>

<style lang="scss">
.c-pc-normal-tab-header {
  position: sticky;
  top: 0;
  z-index: 20;
  overflow: hidden;
  background: $--color-white;
  border-bottom: 1px solid $--border-color-primary;
}

.c-pc-normal-tab-header__header__item {
  position: relative;
  float: left;
  height: 60px;
  padding: 0 24px;
  font-size: 16px;
  line-height: 60px;
  color: #aaa;
  cursor: pointer;
  transition-duration: 0.3s;
  transition-property: color;

  &:first-of-type {
    margin-left: -24px;
  }
}

.c-pc-normal-tab-header__header__item--current {
  color: $--font-color-primary;
  cursor: default;
}

.c-pc-normal-tab-header__current-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 72px;
  height: 3px;
  background-color: $--color-primary;
  border-radius: 4px;
  transition-duration: 0.3s;
  transition-property: left;
}

.c-pc-normal-tab-header__hack-weixin-btn {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 11;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
