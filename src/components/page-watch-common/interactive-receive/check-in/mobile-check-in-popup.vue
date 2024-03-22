<!-- @file 移动端签到弹层 -->
<template>
  <mobile-popup
    class="c-mobile-check-in-popup"
    fill-body-section
    :title="checkInTitle"
    :visible.sync="checkInVisible"
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
  >
    <iar-mobile-check-in
      ref="checkInRef"
      :check-in-sdk="checkInSdk"
      enable-sound-effects
      @show-entrance="showEntrance"
      @to-show="setCheckInVisible(true, false)"
      @to-hide="setCheckInVisible(false)"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useCheckIn } from './hooks/use-check-in';

const IarMobileCheckIn = getIarComponent('MobileCheckIn');

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const { checkInSdk, checkInVisible, checkInTitle, setCheckInVisible, showEntrance, checkInRef } =
  useCheckIn();
</script>
