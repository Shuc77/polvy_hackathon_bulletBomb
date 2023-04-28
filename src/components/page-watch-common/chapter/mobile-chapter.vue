<!-- @file 移动端章节 -->
<template>
  <div class="c-mobile-chapter">
    <div
      v-for="(item, index) in chapterList"
      :key="index"
      class="c-mobile-chapter__item pws-chapter-item"
      :class="{
        'is-active': currentIndex === index,
      }"
      @click="onClickChapter(item)"
    >
      <mobile-icon-media
        v-if="currentIndex === index"
        class="c-mobile-chapter__item__icon"
      />
      <mobile-icon-play-round
        v-else
        class="c-mobile-chapter__item__icon"
      />
      <p class="c-mobile-chapter__item__title">{{ item.title }}</p>
      <span class="c-mobile-chapter__item__duration">
        {{ formatSeconds(item.duration, { segments: 2 }) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSeconds } from '@utils-ts/date';
import { MobileIconMedia, MobileIconPlayRound } from '@/components/component-icons/mobile/map';
import { useChapter } from './hooks/use-chapter';

const { chapterList, currentIndex, onClickChapter } = useChapter();
</script>

<style lang="scss">
.c-mobile-chapter {
  height: 100%;
  overflow: auto;
}
.c-mobile-chapter__item {
  position: relative;
  height: 60px;
  padding-right: 88px;
  padding-left: 56px;
  font-size: 14px;
  line-height: 60px;
  color: #adadc0;
  border-bottom: 1px solid #000;
}
.c-mobile-chapter__item__icon {
  position: absolute;
  top: 50%;
  left: 16px;
  display: flex;
  font-size: 24px !important;
  transform: translateY(-50%);
}
.c-mobile-chapter__item__title {
  width: 100%;
}
.c-mobile-chapter__item__duration {
  position: absolute;
  top: 0;
  right: 16px;
  height: 100%;
}

.c-mobile-chapter__item.is-active {
  color: #3082fe;
}
</style>
