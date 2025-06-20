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
            class="c-mobile-menu-tab-header__header__item"
            :class="{
              'pws-secondary-text-color': paneData.name !== currentTabName,
              'pws-primary-text-color is-active': paneData.name === currentTabName,
              'c-mobile-menu-tab-header__header__item--reminder': paneData.showReminder,
              'c-mobile-menu-tab-header__header__item--news': paneData.showNewMessage,
            }"
            @click="onClickHeaderItem(paneData)"
          >
            <span class="c-mobile-menu-tab-header__header__item__label">
              {{ paneData.label }}

              <span
                v-if="paneData.showNewMessage"
                class="c-mobile-menu-tab-header__header__item__news"
              >
                {{ $lang('ask.news') }}
              </span>

              <span
                v-if="paneData.subLabel"
                class="c-mobile-menu-tab-header__header__item__sub-label pws-secondary-text-color"
              >
                {{ paneData.subLabel }}
              </span>
            </span>
          </div>
          <div
            v-if="tabPaneData.length > 1"
            ref="currentLineRef"
            class="c-mobile-menu-tab-header__current-line pws-special-bg-color"
            :style="{
              left: `${currentLineLeft}px`,
            }"
          ></div>
        </div>
      </div>
    </div>
    <slot name="header-suffix"></slot>
  </div>
</template>

<script setup lang="ts">
import { useTabHeader } from '../hooks/use-tab-header';

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
</script>

<style lang="scss">
.c-mobile-menu-tab-header {
  position: relative;
  z-index: 11;
  display: flex;
  flex-shrink: 0;
  width: 100%;
  height: 40px;
  cursor: pointer;
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
  font-size: 14px;
  white-space: nowrap;
}
.c-mobile-menu-tab-header__header__item {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 20px;
  text-align: center;
}

.c-mobile-menu-tab-header__header__item__label {
  position: relative;
  display: flex;
  align-items: flex-end;
}

.c-mobile-menu-tab-header__header__item__sub-label {
  margin-left: 4px;
  font-family: DINPro-Medium;
  font-size: 12px;
  zoom: 0.83;
}

.c-mobile-menu-tab-header__header__item--reminder::after {
  width: 8px;
  height: 8px;
  margin-left: 3px;
  content: '';
  background: #f24453;
  border-radius: 50%;
}

.c-mobile-menu-tab-header__header__item--news {
  .c-mobile-menu-tab-header__header__item__news {
    position: absolute;
    bottom: 100%;
    left: 100%;
    padding: 0 6px;
    margin: 0 0 -6px -16px;
    font-size: 12px;
    line-height: 18px;
    color: #fff;
    white-space: nowrap;
    background: #ff5252;
    border-radius: 8px 8px 8px 0;
    transform: scale(0.78);
  }
}

.c-mobile-menu-tab-header__current-line {
  position: absolute;
  bottom: 0;
  width: 16px;
  height: 2px;
  background: $--color-white;
  border-radius: 1px;
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
