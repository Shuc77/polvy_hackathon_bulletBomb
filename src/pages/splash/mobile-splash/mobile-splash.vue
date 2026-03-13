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
          class="c-mobile-splash__header__content__cover"
        >
          <channel-splash-img />
          <div
            v-if="trialPlayFinishTipVisible"
            class="c-mobile-splash__header__content__trial-play-finish-tip"
          >
            <p>{{ $lang('trial.play.finish.tip') }}</p>
          </div>
        </div>
      </div>
    </header>

    <div
      class="c-mobile-splash__main"
      :class="{
        'c-mobile-splash__main__padding': showLiveCountDown,
      }"
    >
      <!-- 倒计时 + 预约 -->
      <div
        v-if="showLiveCountDown"
        class="c-mobile-splash__main__header pws-dark-white-bg-10 pws-light-white-bg-40"
        :style="liveBookingStyle"
      >
        <mobile-live-count-down
          :show-title="showLiveBookingButton"
          theme="number-square"
          :count-style="countStyle"
        />
        <mobile-live-booking-button
          v-if="showLiveBookingButton"
          class="c-mobile-splash__main__header__booking pws-normal-button-primary--config-wrapper"
        />
      </div>

      <!-- 基础信息 -->
      <mobile-basic-info :show-like-count="likeFeatureEnabled" />
    </div>

    <!-- 底部按钮 -->
    <mobile-splash-btn class="c-mobile-splash__bottom-btn" />
  </div>
</template>

<script setup lang="ts">
import { computed, CSSProperties, defineAsyncComponent } from 'vue';

import { generateBgStyle } from '@/skins/theme-config-helper';

import MobileBasicInfo from '@/components/common-business/basic-info/mobile-basic-info.vue';
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import MobileLiveBookingButton from '@/components/common-business/live-booking/mobile-live-booking-button.vue';
import MobileLiveCountDown from '@/components/common-business/live-count-down/mobile-live-count-down.vue';
import MobileSplashBtn from './components/mobile-splash-btn.vue';

import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { useChatStore } from '@/store/use-chat-store';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { usePlayerTrialHook } from '@/components/page-splash-common/player-trial/use-player-trial';
import { useThemeStore } from '@/store/use-theme-store';

const MobilePlayerTrial = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "mobile-player-trial" */
      '@/components/page-splash-common/player-trial/mobile-player-trial/mobile-player-trial.vue'
    ),
);

const { showLiveCountDown } = storeDefinitionToRefs(useChannelInfoStore);
const { showLiveBookingButton } = storeDefinitionToRefs(useLiveBookingStore);
const { likeFeatureEnabled } = storeDefinitionToRefs(useChatStore);

const { trialPlayerVisible, trialPlayFinishTipVisible, trialInfo } = usePlayerTrialHook();

const themeStore = useThemeStore();

const liveBookingStyle = computed(() => {
  if (!themeStore.watchThemeStyleConfig) return;

  const { bgConfig } = themeStore.watchThemeStyleConfig.mobile.splash.subscribeArea;

  return generateBgStyle(bgConfig);
});

const countStyle = computed(() => {
  if (!themeStore.watchThemeStyleConfig) return;

  const result: CSSProperties = {};
  const { countBg, countColor } = themeStore.watchThemeStyleConfig.mobile.splash.subscribeArea;

  if (countBg) {
    result.background = countBg;
  }
  if (countColor) {
    result.color = countColor;
  }

  return result;
});
</script>

<style lang="scss">
.c-mobile-splash {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
  position: relative;
  width: 100%;
  height: 100%;
}

.c-mobile-splash__header__content__trial-play-finish-tip {
  position: absolute;
  top: 0;
  left: 0;
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
  flex: 1;

  &.c-mobile-splash__main__padding {
    padding-bottom: 80px;
  }
}

.c-mobile-splash__main__header {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  padding: 12px;
  margin: 16px 16px 0;
  text-align: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-radius: 8px;
}
.c-mobile-splash__main__header__booking {
  margin-left: auto;
}

.c-mobile-splash__bottom-btn {
  position: sticky;
  bottom: 0;
  z-index: 1;
  width: 100%;
  padding: 8px 0;
  background: inherit;
  @include iphone-x-pb(8px);
}
</style>
