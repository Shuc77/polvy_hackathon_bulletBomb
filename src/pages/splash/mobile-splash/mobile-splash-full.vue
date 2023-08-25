<!-- @file 移动端大图布局的引导页 -->
<template>
  <div
    class="c-mobile-splash-full"
    :style="{
      backgroundImage: `url(${mobileSplashLargeImg})`,
    }"
  >
    <header
      v-if="trialEnabled"
      class="c-mobile-splash-full__header"
    >
      <div class="c-mobile-splash-full__header__content">
        <mobile-player-trial
          v-if="trialPlayerVisible"
          :trial-info="trialInfo"
        />
        <div
          v-else
          class="c-mobile-splash-full__header__content__cover"
        >
          <div
            v-if="trialPlayFinishTipVisible"
            class="c-mobile-splash-full__header__content__trial-play-finish-tip"
          >
            <p>{{ $lang('trial.play.finish.tip') }}</p>
          </div>
        </div>
      </div>
    </header>

    <mobile-splash-btn class="c-mobile-splash-full__bottom-btn" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import { usePlayerTrialHook } from '@/components/page-splash-common/player-trial/use-player-trial';
import MobileSplashBtn from './components/mobile-splash-btn.vue';

import { usePvTrack } from '@/hooks/business/use-pv-track';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useThemeStore } from '@/store/use-theme-store';

const MobilePlayerTrial = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "mobile-player-trial" */
      '@/components/page-splash-common/player-trial/mobile-player-trial/mobile-player-trial.vue'
    ),
);

const { mobileSplashLargeImg } = storeDefinitionToRefs(useThemeStore);

const { trialEnabled, trialPlayerVisible, trialPlayFinishTipVisible, trialInfo } =
  usePlayerTrialHook();

usePvTrack('saas-web-splash-mobile');
</script>

<style lang="scss">
.c-mobile-splash-full {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.c-mobile-splash-full__bottom-btn {
  position: absolute;
  bottom: 23px;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  padding: 0 44px;

  .c-mobile-auth__button-list {
    flex-direction: column;
    padding: 0;
  }
  .c-mobile-auth__button-item {
    margin-top: 15px;
    margin-left: 0;
  }
}

.c-mobile-splash-full__header {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
}
.c-mobile-splash-full__header__content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.c-mobile-splash-full__header__content__cover {
  width: 100%;
  height: 100%;
}

.c-mobile-splash-full__header__content__trial-play-finish-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
  color: $--color-white;
  background: rgba(0, 0, 0, 0.8);
}
</style>
