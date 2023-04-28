<!-- @file PC 端多会场 -->
<template>
  <div
    v-if="multiMeetingEnabled && multiMeetingList.length"
    class="c-pc-multi-meeting"
  >
    <div class="c-pc-multi-meeting__control">
      <span class="c-pc-multi-meeting__control__title">{{ $lang('multiMeeting.other') }}</span>
      <span class="c-pc-multi-meeting__control__count">
        {{ currentMultiMeetingSeat }}/{{ multiMeetingTotal }}
      </span>

      <template v-if="pageSize < multiMeetingTotal">
        <span
          class="c-pc-multi-meeting__control__prev"
          :class="{
            'c-pc-multi-meeting__control__prev--disabled': disabledPrev,
          }"
          @click="disabledPrev ? null : handlePageChange(false)"
        >
          <pc-icon-arrow-left class="c-pc-multi-meeting__control__page-icon" />
        </span>
        <span
          class="c-pc-multi-meeting__control__next"
          :class="{
            'c-pc-multi-meeting__control__next--disabled': disabledNext,
          }"
          @click="disabledNext ? null : handlePageChange(true)"
        >
          <pc-icon-arrow-right class="c-pc-multi-meeting__control__page-icon" />
        </span>
      </template>
    </div>

    <div class="c-pc-multi-meeting__list">
      <div class="c-pc-multi-meeting__list__wrap">
        <div
          class="c-pc-multi-meeting__list__inner"
          :style="wrapStyle"
        >
          <div
            v-for="(item, index) in multiMeetingList"
            :key="index"
            class="c-pc-multi-meeting__item"
            :class="{
              'c-pc-multi-meeting__item--current': item.isCurrent,
            }"
            :style="itemStyle"
          >
            <div class="c-pc-multi-meeting__item__inner">
              <a
                class="c-pc-multi-meeting__item__content"
                :href="item.watchUrl"
              >
                <img
                  v-if="item.splashImg"
                  :src="resizeOSSImg(item.splashImg, 240, 136)"
                  :alt="item.multiMeetingName"
                />

                <mini-status-tag
                  class="c-pc-multi-meeting__item__status"
                  :live-status="item.liveStatus"
                />

                <div
                  class="c-pc-multi-meeting__item__name g-singleline"
                  :class="{
                    'c-pc-multi-meeting__item__name--icon': item.showIcon,
                  }"
                >
                  {{ item.multiMeetingName }}
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { resizeOSSImg } from '@/assets/utils/image';
import { PcIconArrowLeft, PcIconArrowRight } from '@/components/component-icons/pc/map';
import MiniStatusTag from '@/components/common-business/status-tag/mini-status-tag.vue';
import { useMultiMeeting, useMultiMeetingPage } from './use-multi-meeting';

const { multiMeetingEnabled, multiMeetingList, multiMeetingTotal, currentMultiMeetingSeat } =
  useMultiMeeting();

const { pageSize, wrapStyle, itemStyle, disabledPrev, disabledNext, handlePageChange } =
  useMultiMeetingPage({
    multiMeetingList,
    currentMultiMeetingSeat,
  });
</script>

<style lang="scss">
.c-pc-multi-meeting {
  padding-bottom: 20px;
  border-bottom: 1px solid #ededef;
}
.c-pc-multi-meeting__control {
  display: flex;
  align-items: center;
  padding-top: 24px;
  margin-bottom: 24px;
  color: $--font-color-primary;
}

.c-pc-multi-meeting__control__title {
  margin-right: 10px;
  font-size: 16px;
}

.c-pc-multi-meeting__control__count {
  font-size: 14px;
}
.c-pc-multi-meeting__control__prev {
  margin-left: auto;
}
.c-pc-multi-meeting__control__next {
  margin-left: 16px;
}
.c-pc-multi-meeting__control__prev,
.c-pc-multi-meeting__control__next {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  line-height: 24px;
  color: $--color-black;
  text-align: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;

  .c-pc-multi-meeting__control__page-icon {
    display: flex;
    font-size: 20px !important;
  }
}

.c-pc-multi-meeting__control__prev--disabled,
.c-pc-multi-meeting__control__next--disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

$--item-gutter: 24px;

.c-pc-multi-meeting__list {
  overflow: hidden;
}
.c-pc-multi-meeting__list__wrap {
  margin-left: -$--item-gutter;
}
.c-pc-multi-meeting__list__inner {
  position: relative;
  display: flex;
  transition: 0.3s;
}
.c-pc-multi-meeting__item {
  box-sizing: border-box;
  padding-left: $--item-gutter;
}
.c-pc-multi-meeting__item__inner {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
}
.c-pc-multi-meeting__item__content {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  border-radius: 2px;

  img {
    width: 100%;
    height: 100%;
  }
}
.c-pc-multi-meeting__item__status {
  position: absolute;
  top: 8px;
  left: 8px;
}
.c-pc-multi-meeting__item--current {
  .c-pc-multi-meeting__item__content::after {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    border: 2px solid #78a7ed;
  }
}

.c-pc-multi-meeting__item__name {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 32px;
  color: $--color-white;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
  border-radius: 0 0 2px 2px;
}
.c-pc-multi-meeting__item__name--icon::before {
  display: inline-block;
  width: 18px;
  height: 32px;
  vertical-align: top;
  content: '';
  background: url(./imgs/playing.gif) no-repeat;
  background-position: center;
  background-size: 18px;
}

@media (max-width: 1280px) {
  $--item-gutter: 10px;

  .c-pc-multi-meeting__list__wrap {
    margin-left: -$--item-gutter;
  }
  .c-pc-multi-meeting__item {
    padding-left: $--item-gutter;
  }
}
</style>
