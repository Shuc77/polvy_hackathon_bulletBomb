<!-- @file 移动端引导页 -->
<template>
  <div class="c-mobile-splash pws-mobile-splash-page">
    <header class="c-mobile-splash__header">
      <div class="c-mobile-splash__header__content">
        <mobile-player-trial
          v-if="trialPlayerVisible"
          :trial-info="trialInfo"
        />
        <div
          v-else
          class="c-mobile-splash__header__content__cover g-img-cover"
          :style="{
            backgroundImage: `url(${resizeOSSImg(splashImg, 1280, 720)})`,
          }"
        >
          <div
            v-if="trialPlayFinishTipVisible"
            class="c-mobile-splash__header__content__trial-play-finish-tip"
          >
            <p>{{ $lang('trial.play.finish.tip') }}</p>
          </div>
        </div>
      </div>
    </header>

    <div class="c-mobile-splash__main">
      <!-- 倒计时 + 预约 -->
      <div
        v-if="showLiveCountDown"
        class="c-mobile-splash__main__header pws-mobile-splash-page-live-count-down-wrap"
      >
        <mobile-live-count-down />
        <mobile-live-booking-button
          v-if="showLiveBookingButton"
          class="c-mobile-splash__main__header__booking"
        />
      </div>

      <!-- 基础信息 -->
      <mobile-basic-info />
    </div>

    <!-- 底部按钮 -->
    <mobile-splash-btn class="c-mobile-splash__bottom-btn" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import MobileBasicInfo from '@/components/common-business/basic-info/mobile-basic-info.vue';
import MobileLiveBookingButton from '@/components/common-business/live-booking/mobile-live-booking-button.vue';
import MobileLiveCountDown from '@/components/common-business/live-count-down/mobile-live-count-down.vue';
import MobileSplashBtn from './components/mobile-splash-btn.vue';

import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useLiveBookingStore } from '@/store/use-live-booking-store';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { usePlayerTrialHook } from '@/components/page-splash-common/player-trial/use-player-trial';
import { useThemeStore } from '@/store/use-theme-store';
import { resizeOSSImg } from '@/assets/utils/image';

const MobilePlayerTrial = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "mobile-player-trial" */
      '@/components/page-splash-common/player-trial/mobile-player-trial/mobile-player-trial.vue'
    ),
);

const { splashImg } = storeDefinitionToRefs(useThemeStore);
const { showLiveCountDown } = storeDefinitionToRefs(useChannelInfoStore);
const { showLiveBookingButton } = storeDefinitionToRefs(useLiveBookingStore);

const { trialPlayerVisible, trialPlayFinishTipVisible, trialInfo } = usePlayerTrialHook();
</script>

<style lang="scss">
.c-mobile-splash {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.c-mobile-splash__header {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
}
.c-mobile-splash__header__content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.c-mobile-splash__header__content__cover {
  width: 100%;
  height: 100%;
}

.c-mobile-splash__header__content__trial-play-finish-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
  color: $--color-white;
  background: rgba(0, 0, 0, 0.8);
}

.c-mobile-splash__main {
  padding-bottom: 64px;
}

.c-mobile-splash__main__header {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 56px;
  padding: 8px 16px;
  text-align: center;
}
.c-mobile-splash__main__header__booking {
  margin-left: auto;
}

.c-mobile-splash__bottom-btn {
  position: fixed;
  bottom: 0;
  z-index: 1;
  width: 100%;
  padding: 8px 0;
  background: inherit;
  @include iphone-x-pb(8px);
}
</style>
