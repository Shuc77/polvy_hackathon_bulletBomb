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
          class="c-pc-aside-tab-header__item pws-main-tab-header-item"
          :class="{
            'is-active': paneData.name === currentTabName,
            'c-pc-aside-tab-header__item--reminder pws-main-tab-header-item-reminder':
              paneData.showReminder && !paneData.showNewMessage,
          }"
          @click="onClickHeaderItem(paneData)"
        >
          <span
            v-if="paneData.showNewMessage"
            :class="{ 'c-pc-aside-tab-header__item--news': paneData.showReminder }"
          >
            {{ paneData.label }}
            <span v-if="paneData.showReminder">
              {{ $lang('ask.news') }}
            </span>
          </span>
          <span v-else>{{ paneData.label }}</span>
          <span v-if="paneData.subLabel">{{ paneData.subLabel }}</span>
        </div>

        <div
          v-if="tabPaneData.length > 1"
          ref="currentLineRef"
          class="c-pc-aside-tab-header__current-line pws-main-tab-header-active-line"
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
.c-pc-aside-tab-header__item--reminder::after {
  width: 8px;
  height: 8px;
  margin-left: 3px;
  content: '';
  border-radius: 50%;
}

.c-pc-aside-tab-header__item--news {
  position: relative;

  > span {
    position: absolute;
    bottom: 100%;
    left: 100%;
    padding: 0 6px;
    margin: 0 0 -7px -17px;
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
  width: 36px;
  height: 3px;
  border-radius: 4px;
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
