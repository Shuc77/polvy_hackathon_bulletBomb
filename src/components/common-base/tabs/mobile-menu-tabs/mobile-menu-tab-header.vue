<!-- @file 移动端底部 Tabs 标签头部 -->
<template>
  <div class="c-mobile-menu-tab-header pws-main-tab-header">
    <div class="c-mobile-menu-tab-header__content">
      <div
        ref="scrollRef"
        class="c-mobile-menu-tab-header__content__inner"
      >
        <div class="c-mobile-menu-tab-header__header__list">
          <div
            v-for="(paneData, index) in tabPaneData"
            :key="index"
            ref="itemRef"
            class="c-mobile-menu-tab-header__header__item pws-main-tab-header-item"
            :class="{
              'is-active': paneData.name === currentTabName,
              'c-mobile-menu-tab-header__header__item--reminder': paneData.showReminder,
            }"
            @click="onClickHeaderItem(paneData)"
          >
            <span>{{ paneData.label }}</span>
            <span
              v-if="paneData.subLabel"
              class="c-mobile-menu-tab-header__header__item__sub-label"
              >{{ paneData.subLabel }}</span
            >
          </div>

          <div
            v-if="tabPaneData.length > 1"
            ref="currentLineRef"
            class="c-mobile-menu-tab-header__current-line pws-main-tab-header-active-line"
            :style="{
              left: `${currentLineLeft}px`,
            }"
          ></div>
        </div>
      </div>

      <!-- 左侧阴影 -->
      <div
        v-show="leftShadowVisible"
        class="c-mobile-menu-tab-header__content__shadow--left pws-main-tab-header-shadow-left"
      ></div>
      <!-- 右侧阴影 -->
      <div
        v-show="rightShadowVisible"
        class="c-mobile-menu-tab-header__content__shadow--right pws-main-tab-header-shadow-right"
      ></div>
    </div>
    <slot name="header-suffix"></slot>
  </div>
</template>

<script setup lang="ts">
import { useTabHeader, useTabHeaderArrow } from '../hooks/use-tab-header';

const {
  scrollRef,
  tabPaneData,
  currentTabName,
  currentLineRef,
  onClickHeaderItem,
  itemRef,
  currentLineLeft,
} = useTabHeader({
  scrollCurrent: true,
});

const { leftArrowVisible: leftShadowVisible, rightArrowVisible: rightShadowVisible } =
  useTabHeaderArrow({
    scrollRef,
    tabPaneData,
  });
</script>

<style lang="scss">
.c-mobile-menu-tab-header {
  display: flex;
  flex-shrink: 0;
  width: 100%;
  height: 40px;
  background: #3e3e4e;
}

.c-mobile-menu-tab-header__content {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.c-mobile-menu-tab-header__content__inner {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.c-mobile-menu-tab-header__header__list {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  font-size: 16px;
  white-space: nowrap;
}
.c-mobile-menu-tab-header__header__item {
  box-sizing: border-box;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 16px;
  color: #adadc0;
  text-align: center;

  &.is-active {
    color: $--color-white;
  }

  &.c-mobile-menu-tab-header__header__item--reminder::after {
    width: 8px;
    height: 8px;
    margin-left: 3px;
    content: '';
    background: #f24453;
    border-radius: 50%;
  }

  .c-mobile-menu-tab-header__header__item__sub-label {
    margin-left: 4px;
    font-size: 12px;
  }
}

.c-mobile-menu-tab-header__current-line {
  position: absolute;
  bottom: 0;
  width: 32px;
  height: 2px;
  background: $--color-white;
  transition-duration: 0.3s;
  transition-property: left;
}

.c-mobile-menu-tab-header__content__shadow--left,
.c-mobile-menu-tab-header__content__shadow--right {
  position: absolute;
  top: 0;
  width: 32px;
  height: 100%;
  pointer-events: none;
}
.c-mobile-menu-tab-header__content__shadow--left {
  left: 0;
  background: linear-gradient(90deg, rgba(62, 62, 78, 1) 0, rgba(62, 62, 78, 0) 100%);
}
.c-mobile-menu-tab-header__content__shadow--right {
  right: 0;
  background: linear-gradient(90deg, rgba(62, 62, 78, 0) 0, rgba(62, 62, 78, 1) 100%);
}
</style>
