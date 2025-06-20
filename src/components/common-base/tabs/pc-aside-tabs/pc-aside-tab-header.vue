<!-- @file PC 端侧边 Tabs 标签头部 -->
<template>
  <div class="c-pc-aside-tab-header pws-main-tab-header">
    <div
      ref="scrollRef"
      class="c-pc-aside-tab-header__content"
    >
      <div class="c-pc-aside-tab-header__list">
        <div
          v-for="(paneData, index) in tabPaneData"
          :key="index"
          ref="itemRef"
          class="c-pc-aside-tab-header__item"
          :class="{
            'pws-secondary-text-color': paneData.name !== currentTabName,
            'pws-primary-text-color is-active': paneData.name === currentTabName,
            'c-pc-aside-tab-header__item--reminder': paneData.showReminder,
            'c-pc-aside-tab-header__item--news': paneData.showNewMessage,
          }"
          @click="onClickHeaderItem(paneData)"
        >
          <span class="c-pc-aside-tab-header__item__label">
            {{ paneData.label }}

            <span
              v-if="paneData.showNewMessage"
              class="c-pc-aside-tab-header__item__news"
            >
              {{ $lang('ask.news') }}
            </span>

            <span
              v-if="paneData.subLabel"
              class="c-pc-aside-tab-header__item__sub-label pws-secondary-text-color"
              >{{ paneData.subLabel }}</span
            >
          </span>
        </div>

        <div
          v-if="tabPaneData.length > 1"
          ref="currentLineRef"
          class="c-pc-aside-tab-header__current-line pws-special-bg-color"
          :style="{
            left: `${currentLineLeft}px`,
          }"
        ></div>
      </div>
    </div>

    <!-- 左侧箭头 -->
    <div
      v-show="leftArrowVisible"
      class="c-pc-aside-tab-header__arrow--left pws-main-tab-header-arrow-left"
      @click="onClickPrev"
    >
      <pc-icon-arrow-left />
    </div>
    <!-- 右侧箭头 -->
    <div
      v-show="rightArrowVisible"
      class="c-pc-aside-tab-header__arrow--right pws-main-tab-header-arrow-right"
      @click="onClickNext"
    >
      <pc-icon-arrow-right />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTabHeader, useTabHeaderArrow } from '../hooks/use-tab-header';
import { PcIconArrowLeft, PcIconArrowRight } from '@/components/component-icons/pc/map';

const {
  tabPaneData,
  currentTabName,
  currentLineRef,
  onClickHeaderItem,
  onClickNext,
  onClickPrev,
  scrollRef,
  itemRef,
  currentLineLeft,
} = useTabHeader({
  scrollCurrent: true,
});

const { leftArrowVisible, rightArrowVisible } = useTabHeaderArrow({
  scrollRef,
  tabPaneData,
});
</script>

<style lang="scss">
.c-pc-aside-tab-header {
  position: relative;
  width: 100%;
  height: 40px;
  overflow: hidden;
  font-size: 14px;
}

.c-pc-aside-tab-header__content {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
}

.c-pc-aside-tab-header__list {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  white-space: nowrap;
}

.c-pc-aside-tab-header__item {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 8px;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  transition-duration: 0.3s;
  transition-property: color;
}
.c-pc-aside-tab-header__item__label {
  position: relative;
  display: flex;
  align-items: flex-end;
}

.c-pc-aside-tab-header__item__sub-label {
  margin-left: 4px;
  font-family: DINPro-Medium;
  font-size: 12px;
  zoom: 0.83;
}

.c-pc-aside-tab-header__item--reminder::after {
  width: 8px;
  height: 8px;
  margin-left: 3px;
  content: '';
  background-color: #f24453;
  border-radius: 50%;
}

.c-pc-aside-tab-header__item--news {
  .c-pc-aside-tab-header__item__news {
    position: absolute;
    bottom: 100%;
    left: 100%;
    padding: 0 6px;
    margin: 0 0 -7px -14px;
    font-size: 12px;
    line-height: 18px;
    color: #fff;
    white-space: nowrap;
    background: #ff5252;
    border-radius: 8px 8px 8px 0;
    transform: scale(0.78);
  }
}

.c-pc-aside-tab-header__current-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 16px;
  height: 2px;
  border-radius: 1px;
  transition-duration: 0.3s;
  transition-property: left;
}

.c-pc-aside-tab-header__arrow--left,
.c-pc-aside-tab-header__arrow--right {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 100%;
  font-size: 16px;
  cursor: pointer;
}
.c-pc-aside-tab-header__arrow--left {
  left: 0;
}
.c-pc-aside-tab-header__arrow--right {
  right: 0;
}

@media (max-width: 1920px) {
  .c-pc-aside-tab-header {
    height: 36px;
  }
}

@media (max-width: 1680px) {
  .c-pc-aside-tab-header {
    height: 32px;
    font-size: 12px;
  }
}
</style>
