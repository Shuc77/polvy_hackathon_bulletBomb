<!-- @file PC 端聊天室红包消息 -->
<template>
  <pc-msg-container
    class="c-pc-redpaper-msg"
    :bubble-model="false"
  >
    <iar-redpaper-entrance
      class="c-pc-redpaper-msg__main"
      ref="entranceRef"
      :red-envelope-data="chatMsg"
      :red-envelope-sdk="redpackSdk"
      :lang="currentLang"
      @open="openRedpackDialog"
    />
  </pc-msg-container>
</template>

<script setup lang="ts">
import PcMsgContainer from '../_msg-container/pc-msg-container.vue';
import { useRedpaperMsg } from './use-redpaper-msg';
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarRedpaperEntrance = getIarComponent('RedEnvelopeEntrance');

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { chatMsg, redpackSdk, entranceRef, openRedpackDialog } = useRedpaperMsg();
</script>

<style lang="scss">
@media (max-width: 1580px) {
  .c-pc-redpaper-msg__main {
    zoom: 0.9;
  }
}
@media (max-width: 1480px) {
  .c-pc-redpaper-msg__main {
    zoom: 0.8;
  }
}
@media (max-width: 1380px) {
  .c-pc-redpaper-msg__main {
    zoom: 0.7;
  }
}
@media (max-width: 1280px) {
  .c-pc-redpaper-msg__main {
    zoom: 0.7;
  }
}
</style>
