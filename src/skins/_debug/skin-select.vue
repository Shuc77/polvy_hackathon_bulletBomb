<!-- @file 多皮肤切换 -->
<template>
  <div class="c-skin-select">
    <div
      v-for="skin in selectList"
      :key="skin"
      class="c-skin-select__item"
      :class="{
        'is-active': pageSkin === skin,
      }"
      @click="onClickItem(skin)"
    >
      {{ skin }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/store/use-theme-store';
import { ChannelWatchPageSkin, ChannelWatchThemeStyleType } from '@polyv/live-watch-sdk';
import { usePageSkinImport } from '../use-page-skin';
import { storeToRefs } from 'pinia';

const themeStore = useThemeStore();
const { pageSkin } = storeToRefs(themeStore);
const { importPageSkin } = usePageSkinImport();

const selectList = [
  ChannelWatchPageSkin.Black,
  ChannelWatchPageSkin.Blue,
  ChannelWatchPageSkin.Freshblue,
  ChannelWatchPageSkin.Green,
  ChannelWatchPageSkin.Golden,
  ChannelWatchPageSkin.Red,
  ChannelWatchPageSkin.White,
];

function onClickItem(skin: ChannelWatchPageSkin) {
  if (pageSkin.value === skin) {
    return;
  }

  themeStore.$patch({
    pageSkin: skin,
    styleType: ChannelWatchThemeStyleType.Skin,
  });

  importPageSkin();
}
</script>

<style lang="scss">
.c-skin-select {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
}
.c-skin-select__item {
  height: 20px;
  padding: 0 8px;
  line-height: 20px;
  cursor: pointer;

  &:hover,
  &.is-active {
    background: rgba($--color-white, 0.6);
  }
}
</style>
