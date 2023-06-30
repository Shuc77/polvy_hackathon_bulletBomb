<!-- eslint-disable vue/v-on-event-hyphenation -->
<!-- @file PC 端回放列表 -->
<template>
  <div class="c-pc-playback-list">
    <plv-row
      class="c-pc-playback-list__main"
      :gutter="[
        {
          sm: 30,
          md: 30,
          lg: 60,
          xl: 60,
          xxl: 60,
        },
        {
          sm: 30,
          md: 30,
          lg: 40,
          xl: 40,
          xxl: 40,
        },
      ]"
    >
      <plv-col
        v-for="(item, index) in currentPagePlaybackList"
        :key="index"
        :span="8"
        class="c-pc-playback-list__item"
        :class="{
          'c-pc-playback-list__item--current':
            item.playbackId === currentPlaybackTarget?.playbackId,
        }"
        @click.native="onClickPlaybackItem(item)"
      >
        <div class="c-pc-playback-list__item__cover-wrap">
          <div
            class="c-pc-playback-list__item__cover g-img-cover"
            :style="{
              backgroundImage: `url(${item.firstImage})`,
            }"
          ></div>

          <div
            v-if="item.playbackId === currentPlaybackTarget?.playbackId"
            class="c-pc-playback-list__item__playing pws-pc-playback-list-playing"
          >
            <pc-icon-media class="c-pc-playback-list__item__playing__icon" />
            <span>{{ $lang('playback.playing') }}</span>
          </div>

          <div class="c-pc-playback-list__item__bottom">
            <pc-icon-play-round class="c-pc-playback-list__item__bottom__icon" />
            <span class="c-pc-playback-list__item__bottom__duration">
              {{ formatDuration(item.duration) }}
            </span>
          </div>
        </div>

        <p class="c-pc-playback-list__item__title g-singleline">{{ item.title }}</p>
        <p class="c-pc-playback-list__item__start-time">
          {{ $lang('playback.startTime') }}
          <span v-if="item.startTime">{{ formatDate(item.startTime, DATE_FORMAT_COMPLETE) }}</span>
        </p>
      </plv-col>
    </plv-row>
    <plv-pagination
      :hide-on-single="true"
      :total="totalPages"
      :current-page="pageNumber"
      :layout="['prev', 'pager', 'next']"
      @currentChange="playbackStore.onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@utils-ts/date';
import { DATE_FORMAT_COMPLETE } from '@/assets/constants/date-format';
import { PcIconMedia, PcIconPlayRound } from '@/components/component-icons/pc/map';
import { usePlaybackStore } from '@/store/use-playback-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { formatDuration } from '@/assets/utils/date-time';
import { usePlaybackList } from '../use-playback-list';
import { PlvPagination, PlvRow, PlvCol } from '@/plugins/polyv-ui/admin-import';

const playbackStore = usePlaybackStore();

const {
  pageNumber,
  totalPages,

  currentPagePlaybackList,
  currentPlaybackTarget,
} = storeDefinitionToRefs(usePlaybackStore);

const { onClickPlaybackItem } = usePlaybackList();
</script>

<style lang="scss">
.c-pc-playback-list {
  max-width: 1200px;
  margin-top: -20px;
}

.c-pc-playback-list__main {
  display: flex;
  flex-wrap: wrap;
}

.c-pc-playback-list__item {
  box-sizing: border-box;
  flex-shrink: 0;
  cursor: pointer;

  &:nth-child(3n + 3) {
    margin-right: 0;
  }
}

.c-pc-playback-list__item__cover-wrap {
  position: relative;
  width: 100%;
  margin-bottom: 24px;
  overflow: hidden;

  &::before {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
    content: '';
  }
}

.c-pc-playback-list__item__cover {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transition: 0.3s;
  transform: translate(-50%, -50%);
}

.c-pc-playback-list__item:hover {
  .c-pc-playback-list__item__cover {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.c-pc-playback-list__item__playing {
  position: absolute;
  top: 50%;
  left: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112px;
  height: 48px;
  line-height: 48px;
  color: $--color-white;
  text-align: center;
  background-color: $--color-primary;
  border-radius: 28px;
  opacity: 0.9;
  transform: translate(-50%, -50%);
}
.c-pc-playback-list__item__playing__icon {
  display: flex;
  margin-right: 4px;
  font-size: 24px !important;
}

.c-pc-playback-list__item__bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 40px;
  padding: 0 8px 8px;
  line-height: 20px;
  color: $--color-white;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
}
.c-pc-playback-list__item__bottom__icon {
  display: flex;
  height: 20px;
  font-size: 16px !important;
}
.c-pc-playback-list__item__bottom__duration {
  margin-left: 6px;
  font-size: 16px;
}

.c-pc-playback-list__item__title {
  margin-bottom: 8px;
  font-size: 18px;
  color: $--font-color-primary;
}

.c-pc-playback-list__item__start-time {
  width: 100%;
  margin-top: 8px;
  font-size: 14px;
  color: #aaaaaa;
}

// @media only screen and(max-width: 1280px) {
//   .c-pc-playback-list {
//     width: 1180px;
//   }

//   .c-pc-playback-list__item {
//     margin-right: 50px;
//   }
// }
</style>
