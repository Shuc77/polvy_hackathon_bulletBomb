<!-- @file 移动端多会场 -->
<template>
  <div
    v-if="multiMeetingEnabled && multiMeetingList.length"
    class="c-mobile-multi-meeting pws-mobile-multi-meeting"
  >
    <!-- 控制栏 -->
    <div class="c-mobile-multi-meeting__control">
      <span class="c-mobile-multi-meeting__control__title">{{ $lang('multiMeeting.other') }}</span>
      <span class="c-mobile-multi-meeting__control__count pws-mobile-multi-meeting-count">
        {{ currentMultiMeetingSeat }}/{{ multiMeetingTotal }}
      </span>
      <span
        class="c-mobile-multi-meeting__control__pack-up pws-mobile-multi-meeting-pack-up"
        @click="toggleListVisible"
      >
        {{ listVisible ? $lang('base.packUp') : $lang('base.spreadOut') }}
        <mobile-icon-arrow-up
          v-if="listVisible"
          class="c-mobile-multi-meeting__control__pack-up__icon"
        />
        <mobile-icon-arrow-down
          v-else
          class="c-mobile-multi-meeting__control__pack-up__icon"
        />
      </span>
    </div>

    <!-- 列表 -->
    <div
      v-show="listVisible"
      class="c-mobile-multi-meeting__list"
    >
      <div
        v-for="(item, index) in multiMeetingList"
        :key="index"
        class="c-mobile-multi-meeting__item"
        :class="{
          'c-mobile-multi-meeting__item--current': item.isCurrent,
        }"
      >
        <div class="c-mobile-multi-meeting__item__inner">
          <a
            class="c-mobile-multi-meeting__item__content"
            :href="item.watchUrl"
          >
            <img
              v-if="item.splashImg"
              :src="resizeOSSImg(item.splashImg, 240, 136)"
              :alt="item.multiMeetingName"
            />

            <mini-status-tag
              class="c-mobile-multi-meeting__item__status"
              :live-status="item.liveStatus"
            />

            <div
              class="c-mobile-multi-meeting__item__name g-singleline"
              :class="{
                'c-mobile-multi-meeting__item__name--icon': item.showIcon,
              }"
            >
              {{ item.multiMeetingName }}
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents, eventBus } from '@/app/app-events';
import { resizeOSSImg } from '@/assets/utils/image';
import { MobileIconArrowDown, MobileIconArrowUp } from '@/components/component-icons/mobile/map';
import MiniStatusTag from '@/components/common-business/status-tag/mini-status-tag.vue';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { onBeforeUnmount, onMounted } from 'vue';
import { useMultiMeeting } from './use-multi-meeting';

const { multiMeetingEnabled, multiMeetingList, multiMeetingTotal, currentMultiMeetingSeat } =
  useMultiMeeting();

const {
  visible: listVisible,
  toggle: toggleListVisible,
  close: closeList,
} = useSimpleVisible(true);

onMounted(() => {
  eventBus.$on(appEvents.global.MsgInputFocus, closeList);
});

onBeforeUnmount(() => {
  eventBus.$off(appEvents.global.MsgInputFocus, closeList);
});
</script>

<style lang="scss">
.c-mobile-multi-meeting__control {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  line-height: 36px;
}

.c-mobile-multi-meeting__control__count {
  margin-left: 6px;
  font-size: 12px;
}
.c-mobile-multi-meeting__control__pack-up {
  display: flex;
  align-items: center;
  margin-left: auto;
  font-size: 12px;
}
.c-mobile-multi-meeting__control__pack-up__icon {
  display: flex;
  font-size: 16px !important;
}

.c-mobile-multi-meeting__list {
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  padding-bottom: 8px;
  padding-left: 16px;
  overflow-x: auto;
  white-space: nowrap;
}

.c-mobile-multi-meeting__item {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 32%;
  margin-right: 8px;

  &:last-of-type {
    margin-right: 16px;
  }
}
.c-mobile-multi-meeting__item__inner {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
}
.c-mobile-multi-meeting__item__content {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;

  img {
    width: 100%;
    height: 100%;
  }
}
.c-mobile-multi-meeting__item__status {
  position: absolute;
  top: 4px;
  left: 4px;
  transform: scale(0.84);
  transform-origin: top left;
}
.c-mobile-multi-meeting__item--current {
  .c-mobile-multi-meeting__item__content::after {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    border: 1px solid #78a7ed;
    border-radius: 4px;
  }
}

.c-mobile-multi-meeting__item__name {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 26px;
  padding: 0 4px;
  padding-top: 4px;
  font-size: 12px;
  line-height: 26px;
  color: $--color-white;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
  border-radius: 0 0 2px 2px;
}
.c-mobile-multi-meeting__item__name--icon::before {
  display: inline-block;
  width: 18px;
  height: 24px;
  vertical-align: top;
  content: '';
  background: url(./imgs/playing.gif) no-repeat;
  background-position: center;
  background-size: 18px;
}
</style>
