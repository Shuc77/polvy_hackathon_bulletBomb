<!-- @file 移动端 + 竖屏端抽奖动画 -->
<template>
  <iar-mobile-on-lottery
    ref="lotteryAniRef"
    class="c-mobile-lottery-animation"
    :class="{
      'c-mobile-lottery-animation--page-fullscreen': isIarFullScreen,
    }"
    v-show="lotteryAnimationVisible"
    :lottery-sdk="lotterySdk"
    @lottery-status-changed="onLotteryStatusChange"
    @is-show-changed="onVisibleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useLotteryAnimation } from './hooks/use-lottery-animation';

import { useAppendTo } from '@/hooks/behaviors/use-append-to';

const IarMobileOnLottery = getIarComponent('MobileOnLottery');

const lotteryAniRef = ref();

useAppendTo(lotteryAniRef);

const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const { lotterySdk, lotteryAnimationVisible, onLotteryStatusChange, onVisibleChange } =
  useLotteryAnimation();
</script>

<style lang="scss">
.c-mobile-lottery-animation {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);

  .plv-on-lottery-default--default-pattern {
    position: absolute;
    bottom: 100px;
    left: 50%;
    z-index: 12;
    transform: translateX(-50%);
  }
}

.c-mobile-lottery-animation--page-fullscreen {
  z-index: 2000 !important;

  .plv-on-lottery-default--default-pattern {
    top: 50%;
    bottom: initial;
    transform: rotate(90deg) translate(-50%, 50%);
    transform-origin: center;
  }
}

@media screen and (orientation: landscape) {
  .c-mobile-lottery-animation {
    z-index: 2000 !important;
  }
  .plv-on-lottery-default--default-pattern {
    bottom: 30px !important;
  }
}
</style>
