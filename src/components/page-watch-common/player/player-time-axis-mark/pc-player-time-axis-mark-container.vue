<!-- @file 播放器时间轴标记-精彩看点业务组件 -->

<template>
  <div class="c-pc-player-time-axis-mark-container">
    <!-- 按钮 -->
    <normal-button
      ref="timeAxisMarkPopperTriggerRef"
      class="c-pc-player-time-axis-mark-container__button"
      :type="ButtonType.Custom"
      :size="ButtonSize.XMini"
      :text="$lang('player.timeAxisMark.base.text')"
      :icon="PcIconHighlight"
      icon-class="c-pc-player-time-axis-mark-container__button__icon"
    />
    <!-- 悬浮面板 -->
    <transition name="fade">
      <div
        ref="timeAxisMarkPopperRef"
        v-show="timeAxisMarkPopperVisible"
        class="c-pc-player-time-axis-mark-container__panel"
      >
        <div
          v-for="markPoint in timeAxisMarkList"
          :key="markPoint.id"
          class="c-pc-player-time-axis-mark-container__panel-item"
          @click="toSeekByTimeAxisMark(markPoint)"
        >
          <img
            class="c-pc-player-time-axis-mark-container__panel-item__img"
            :src="markPoint.markMessage.previewUrl"
          />
          <div class="c-pc-player-time-axis-mark-container__panel-item__desc">
            <div
              class="c-pc-player-time-axis-mark-container__panel-item__desc__title g-singleline"
              :title="markPoint.markMessage.title"
            >
              {{ markPoint.markMessage.title }}
            </div>
            <span class="c-pc-player-time-axis-mark-container__panel-item__desc__time">{{
              formatSeconds(markPoint.markTime, { segments: 3 })
            }}</span>
          </div>
        </div>
        <p
          v-if="timeAxisMarkList.length === 0"
          class="c-pc-player-time-axis-mark-container__panel-empty"
        >
          {{ $lang('player.timeAxisMark.empty.text') }}
        </p>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { PC_PLAYER_FULL_SCREEN_SELECTOR } from '@/assets/constants/selector';
import { usePopper } from '@/hooks/components/use-popper';
import { formatSeconds } from '@utils-ts/date';

import NormalButton, { ButtonSize, ButtonType } from '@/components/common-base/normal-button';
import { PcIconHighlight } from '@/components/component-icons/pc/map';

import { useTimeAxisMarkHook } from './use-time-axis-mark';

const { timeAxisMarkList, toSeekByTimeAxisMark } = useTimeAxisMarkHook();

const {
  referenceRef: timeAxisMarkPopperTriggerRef,
  popperRef: timeAxisMarkPopperRef,
  popperVisible: timeAxisMarkPopperVisible,
} = usePopper({
  trigger: 'hover',
  placement: 'top-start',
  popperOffset: [0, 10],
  appendToBody: false,
  mountEl: PC_PLAYER_FULL_SCREEN_SELECTOR,
});
</script>

<style lang="scss">
.c-pc-player-time-axis-mark-container {
  display: inline-flex;
  align-items: center;
}

.c-pc-player-time-axis-mark-container__button {
  padding: 0 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.c-pc-player-time-axis-mark-container__button__icon {
  margin-top: -2px;
  font-size: 14px;
}

.c-pc-player-time-axis-mark-container__panel {
  width: 280px;
  max-height: 336px;
  padding: 16px;
  overflow: auto;
  pointer-events: all;
  cursor: pointer;
  user-select: none;
  background-color: rgba(0, 0, 0, 0.85);
  @include scrollbar(rgba(170, 173, 199, 0.2));
}

.c-pc-player-time-axis-mark-container__panel-item {
  display: flex;
  margin-bottom: 18px;
  color: #fff;
  &:last-child {
    margin-bottom: 0;
  }
}

.c-pc-player-time-axis-mark-container__panel-item__img {
  width: 84px;
  height: 48px;
  margin-right: 8px;
  background: #000;
  border-radius: 2px;
}

.c-pc-player-time-axis-mark-container__panel-item__desc {
  overflow: hidden;
}
.c-pc-player-time-axis-mark-container__panel-item__desc__title {
  margin-bottom: 2px;
  font-size: 12px;
  font-weight: bold;
  line-height: 22px;
}

.c-pc-player-time-axis-mark-container__panel-item__desc__time {
  font-size: 12px;
  line-height: 1;
  opacity: 0.6;
}

.c-pc-player-time-axis-mark-container__panel-empty {
  color: #fff;
}
</style>
