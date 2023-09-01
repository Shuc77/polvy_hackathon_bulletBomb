<!-- @file 移动端打赏弹层 -->
<template>
  <mobile-popup
    class="c-mobile-donate-popup"
    :visible.sync="visible"
    :show-header="false"
    content-background="none"
  >
    <mobile-donate-panel @donate-finish="closeDonate" />
  </mobile-popup>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { useViewerStore } from '@/store/use-viewer-store';
import MobileDonatePanel from './mobile-donate-panel.vue';

const { visible, setVisible, close: closeDonate } = useSimpleVisible(false);

useEventBusListener(appEvents.donate.OpenDonatePopup, (_visible = true) => {
  if (_visible) {
    const viewerStore = useViewerStore();
    const checkRealName = viewerStore.checkNeedRealNameAuth();
    if (checkRealName) {
      return;
    }
  }

  setVisible(_visible);
});
</script>
