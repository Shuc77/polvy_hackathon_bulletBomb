<!-- @file 竖屏端回放列表 -->
<template>
  <div
    class="c-portrait-playback-list"
    @scroll="debounceHandlePlaybackListScroll"
  >
    <div class="c-portrait-playback-list__main">
      <div
        v-for="(item, index) in playbackList"
        :key="index"
        class="c-portrait-playback-list__item"
        :class="{
          'c-portrait-playback-list__item--current':
            item.playbackId === currentPlaybackTarget?.playbackId,
        }"
        @click="clickItem(item)"
      >
        <div class="c-portrait-playback-list__item__cover-wrap">
          <div
            class="c-portrait-playback-list__item__cover g-img-cover"
            :style="{
              backgroundImage: `url(${item.firstImage})`,
            }"
          ></div>

          <div
            v-if="item.playbackId === currentPlaybackTarget?.playbackId"
            class="c-portrait-playback-list__item__playing"
          >
            <mobile-icon-media class="c-portrait-playback-list__item__playing__icon" />
            <span>{{ $lang('playback.playing') }}</span>
          </div>

          <div class="c-portrait-playback-list__item__bottom">
            <span class="c-portrait-playback-list__item__bottom__duration">
              {{ formatDuration(item.duration) }}
            </span>
          </div>
        </div>

        <p class="c-portrait-playback-list__item__title g-multiline">{{ item.title }}</p>
      </div>
      <div
        v-if="isLoading"
        class="c-portrait-playback-list__tips"
      >
        <list-loading />
      </div>
      <div
        v-if="isNoMore"
        class="c-portrait-playback-list__tips"
      >
        {{ $lang('playback.no.more') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash-es/debounce';

import { MobileIconMedia } from '@/components/component-icons/mobile/map';
import ListLoading from '@/components/common-base/list-loading/list-loading.vue';

import { appEvents, eventBus } from '@/app/app-events';
import { usePlaybackStore } from '@/store/use-playback-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { formatDuration } from '@/assets/utils/date-time';

import { usePlaybackList } from '../use-playback-list';
import { PlaybackTarget } from '@polyv/live-watch-sdk';

const playbackStore = usePlaybackStore();
const {
  playbackList,
  currentPlaybackTarget,

  isLoading,
  isNoMore,
} = storeDefinitionToRefs(usePlaybackStore);

const { onClickPlaybackItem } = usePlaybackList();

function clickItem(target: PlaybackTarget) {
  onClickPlaybackItem(target);
  eventBus.$emit(appEvents.portrait.OpenPlaybackChapter, false);
}

function handlePlaybackListScroll(e: UIEvent) {
  const target = e.target as HTMLElement;
  const scrollHeight = Math.floor(target.scrollHeight);
  const scrollTop = Math.floor(target.scrollTop);
  const clientHeight = Math.floor(target.clientHeight);
  if (scrollTop >= scrollHeight - clientHeight - 100) {
    playbackStore.loadNextPlaybackList();
  }
}

const debounceHandlePlaybackListScroll = debounce(handlePlaybackListScroll, 300);
</script>

<style lang="scss">
.c-portrait-playback-list {
  height: 100%;
  overflow-y: auto;
}

.c-portrait-playback-list__main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 16px 34px;
}

.c-portrait-playback-list__item {
  flex: 0 0 calc(50% - 8px);
  margin-top: 16px;
}

.c-portrait-playback-list__item__cover-wrap {
  position: relative;
  width: 100%;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 10px;

  &::before {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
    content: '';
  }
}

.c-portrait-playback-list__item__cover {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transition: 0.3s;
  transform: translate(-50%, -50%);
}

.c-portrait-playback-list__item__playing {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 12;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 32px;
  font-size: 14px;
  line-height: 32px;
  color: $--color-white;
  text-align: center;
  background: $--color-primary-portrait;
  border-radius: 20px;
  opacity: 0.9;
  transform: translate(-50%, -50%);
}
.c-portrait-playback-list__item__playing__icon {
  display: flex;
  margin-right: 6px;
  font-size: 14px !important;
}

.c-portrait-playback-list__item__bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 30px;
  color: $--color-white;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
}
.c-portrait-playback-list__item__bottom__duration {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 12px;
  line-height: 1;
  color: #e4e4e4;
}

.c-portrait-playback-list__item__title {
  height: 40px;
  font-size: 14px;
  line-height: 20px;
  color: #adadc0;
}

.c-portrait-playback-list__item--current {
  .c-portrait-playback-list__item__title {
    color: $--color-primary-portrait;
  }
}

.c-portrait-playback-list__tips {
  width: 100%;
  margin-top: 40px;
  font-size: 12px;
  color: #adadc0;
  text-align: center;
}
</style>
