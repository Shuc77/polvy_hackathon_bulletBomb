<!-- @file PC 端弹幕设置面板 -->
<template>
  <div class="c-pc-barrage-setting">
    <!-- 按钮 -->
    <pc-icon-barrage-setting
      class="c-pc-player-control__button c-pc-player-control__button--barrage"
      color="#fff"
    />
    <!-- 悬浮面板 -->
    <div class="c-pc-barrage-setting__panel">
      <!-- 顶部说明操作栏 -->
      <div class="c-pc-barrage-setting__panel__top">
        <span class="c-pc-barrage-setting__panel__top__left">{{ $lang('barrage.setting') }}</span>
        <div
          class="c-pc-barrage-setting__panel__top__right"
          @click="resetAllSetting"
        >
          <span>{{ $lang('barrage.setting.recover') }}</span>
          <img
            class="c-pc-barrage-setting__panel__top__right__img"
            src="../../imgs/icon-danmu-reset.png"
          />
        </div>
      </div>
      <!--弹幕字号-->
      <div
        v-if="barrageSizeButtonVisible"
        class="c-pc-barrage-setting__panel__option"
      >
        <div class="c-pc-barrage-setting__label">
          {{ $lang('barrage.size') }}
        </div>
        <div class="c-pc-barrage-setting__item">
          <plv-slider
            show-stops
            :min="1"
            :max="5"
            :step="1"
            :progress-bar-visible="false"
            :hot-area-height="36"
            :value="formattedBarrageSizeToSliderValue"
            @input="handleBarrageSizeChange"
          />
          <span class="c-pc-barrage-setting__desc">{{ formattedBarrageSizeToText }}</span>
        </div>
      </div>
      <!--弹幕速度-->
      <div
        v-if="barrageSpeedButtonVisible"
        class="c-pc-barrage-setting__panel__option"
      >
        <div class="c-pc-barrage-setting__label">
          {{ $lang('barrage.speed') }}
        </div>
        <div class="c-pc-barrage-setting__item">
          <plv-slider
            show-stops
            :min="1"
            :max="5"
            :step="1"
            :progress-bar-visible="false"
            :hot-area-height="36"
            :value="formattedBarrageSpeedToSliderValue"
            @input="handleBarrageSpeedChange"
          />
          <span class="c-pc-barrage-setting__desc">{{ formattedBarrageSpeedToText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconBarrageSetting } from '@/components/component-icons/pc/map';
import { PlvSlider } from '@/plugins/polyv-ui/admin-import';
import { useBarrageSetting } from '../../hooks/use-barrage-setting';
import { usePlayerControl } from '../../hooks/use-player-control';

const { barrageSizeButtonVisible, barrageSpeedButtonVisible } = usePlayerControl();

const {
  formattedBarrageSpeedToSliderValue,
  formattedBarrageSpeedToText,
  handleBarrageSpeedChange,
  formattedBarrageSizeToSliderValue,
  formattedBarrageSizeToText,
  handleBarrageSizeChange,
  resetAllSetting,
} = useBarrageSetting();
</script>

<style lang="scss">
.c-pc-barrage-setting {
  position: relative;
}
.c-pc-barrage-setting:hover {
  color: #3082fe;
  .c-pc-barrage-setting__panel {
    pointer-events: initial;
    opacity: 1;
  }
}
.c-pc-barrage-setting__panel {
  position: absolute;
  bottom: 100%;
  left: 50%;
  box-sizing: border-box;
  width: 360px;
  padding: 24px;
  color: $--color-white;
  pointer-events: none;
  cursor: default;
  background: $--player-control-panel-bg;
  border-radius: 2px;
  opacity: 0;
  transition: 0.3s;
  transform: translateX(-50%);
}
.c-pc-barrage-setting__panel__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 29px;
}
.c-pc-barrage-setting__panel__top__left {
  font-size: 16px;
}
.c-pc-barrage-setting__panel__top__right {
  position: relative;
  cursor: pointer;

  span {
    margin-right: 8px;
  }

  .c-pc-barrage-setting__panel__top__right__img {
    width: 16px;
    height: 16px;
  }
}
.c-pc-barrage-setting__panel__option:not(:last-child) {
  margin-bottom: 20px;
}
.c-pc-barrage-setting__label {
  margin-bottom: 12px;
}
.c-pc-barrage-setting__item {
  display: inline-flex;
  width: 100%;
}
.c-pc-barrage-setting__panel {
  .plv-slider {
    flex-grow: 1;
    padding: 5px 7px;
  }
  .plv-slider__runway {
    background: #666;
  }
  .plv-slider .plv-slider__runway .plv-slider__runway__dot {
    z-index: 10;
    opacity: 0.5;
  }
  .plv-slider__button .plv-slider__button__inner {
    background-color: #2196f3;
    border-color: #2196f3;
  }
  .plv-slider__runway::before,
  .plv-slider__runway::after {
    position: absolute;
    z-index: 1;
    width: 4px;
    height: 4px;
    pointer-events: none;
    content: '';
    background: #fff;
    border-radius: 50%;
    opacity: 0.5;
    -webkit-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    transform: translateX(-50%);
  }
  .plv-slider__runway::before {
    left: 2px;
  }
  .plv-slider__runway::after {
    right: -2px;
  }
}
.c-pc-barrage-setting__desc {
  box-sizing: border-box;
  width: 68px;
  padding-left: 8px;
  text-align: center;
}
</style>
