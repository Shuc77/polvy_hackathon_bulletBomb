<!-- @file 竖屏端打赏弹窗 -->
<template>
  <mobile-popup
    :title="popupTitle"
    :theme="PopupTheme.Portrait"
    :visible.sync="popupVisible"
    :backable="cashPanelVisible"
    @click-back="cashPanelVisible = false"
  >
    <!-- 道具打赏 -->
    <donate-panel-good
      v-if="!cashPanelVisible"
      @open-cash="cashPanelVisible = true"
      @donate-success="popupVisible = false"
    />
    <!-- 现金打赏 -->
    <donate-panel-cash
      v-if="cashPanelVisible"
      @back="cashPanelVisible = false"
      @donate-success="popupVisible = false"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PopupTheme } from '@/components/common-base/popup/types';
import { useViewerStore } from '@/store/use-viewer-store';
import { computed, ref, unref } from 'vue';
import DonatePanelCash from './portrait-donate-panel-cash.vue';
import DonatePanelGood from './portrait-donate-panel-good.vue';

/** 现金面板是否显示 */
const cashPanelVisible = ref(false);

const popupVisible = ref(false);

const popupTitle = computed(() => {
  let title = translate('donate.title');

  if (unref(cashPanelVisible)) {
    title = translate('donate.cashReward');
  }

  return title;
});

function handleVisible(visible = true) {
  if (visible) {
    const viewerStore = useViewerStore();
    const checkRealName = viewerStore.checkNeedRealNameAuth();
    if (checkRealName) {
      return;
    }

    cashPanelVisible.value = false;
  }
  popupVisible.value = visible;
}

useEventBusListener(appEvents.donate.OpenDonatePopup, handleVisible);
</script>
