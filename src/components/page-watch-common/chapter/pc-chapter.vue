<!-- @file PC 端章节 -->
<template>
  <div class="c-pc-chapter pws-main-tab-body-scrollbar">
    <div
      v-for="(item, index) in chapterList"
      :key="index"
      class="c-pc-chapter__item pws-chapter-item"
      :class="{
        'is-active': currentIndex === index,
      }"
      @click="onClickChapter(item)"
    >
      <pc-icon-media
        v-if="currentIndex === index"
        class="c-pc-chapter__item__icon"
      />
      <pc-icon-play-round
        v-else
        class="c-pc-chapter__item__icon"
      />
      <p class="c-pc-chapter__item__title">{{ item.title }}</p>
      <span class="c-pc-chapter__item__duration">
        {{ formatSeconds(item.duration, { segments: 2 }) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSeconds } from '@utils-ts/date';
import { PcIconMedia, PcIconPlayRound } from '@/components/component-icons/pc/map';
import { useChapter } from './hooks/use-chapter';

const { chapterList, currentIndex, onClickChapter } = useChapter();
</script>

<style lang="scss">
.c-pc-chapter {
  height: 100%;
  overflow: auto;
  @include scrollbar;
}
.c-pc-chapter__item {
  position: relative;
  height: 60px;
  padding-right: 88px;
  padding-left: 56px;
  font-size: 14px;
  line-height: 60px;
  color: #adadc0;
  cursor: pointer;
  border-bottom: 1px solid #000;
}
.c-pc-chapter__item__icon {
  position: absolute;
  top: 50%;
  left: 16px;
  display: flex;
  width: 24px;
  font-size: 24px !important;
  transform: translateY(-50%);
}
.c-pc-chapter__item__title {
  width: 100%;
}
.c-pc-chapter__item__duration {
  position: absolute;
  top: 0;
  right: 16px;
  height: 100%;
}

.c-pc-chapter__item.is-active {
  color: #3082fe;
}
</style>
