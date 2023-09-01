<!-- @file PC 端音轨流切换 -->
<template>
  <div class="c-pc-player-stream-track">
    <div
      class="c-pc-player-stream-track__item"
      :class="{
        'c-pc-player-stream-track__item--active': currentLang === LangType.Chinese,
      }"
      @click="switchLanguage(LangType.Chinese)"
    >
      <span>中文音轨</span>
    </div>
    <div
      class="c-pc-player-stream-track__item"
      :class="{
        'c-pc-player-stream-track__item--active': currentLang !== LangType.Chinese,
      }"
      @click="switchLanguage(LangType.English)"
    >
      <span>{{ japLangEnabled ? 'Jpn track' : 'Eng track' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LangType } from '@/assets/lang/lang-enum';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { useStreamTrack } from './use-stream-track';

const { currentLang, japLangEnabled } = storeDefinitionToRefs(useLangStore);

const { switchLanguage } = useStreamTrack();
</script>

<style lang="scss">
.c-pc-player-stream-track {
  display: flex;
  align-items: center;
  overflow: hidden;
}
.c-pc-player-stream-track__item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 32px;
  font-size: 14px;
  color: #e4e4e4;
  text-align: center;
  cursor: pointer;
  background: #000;
  border: 1px solid #3e3e4e;

  &:first-of-type {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  &:last-of-type {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
}
.c-pc-player-stream-track__item--active {
  color: #141518;
  background: #ffcc1d;
  border-color: #ffcc1d;
}
</style>
