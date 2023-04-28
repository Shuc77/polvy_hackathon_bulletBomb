<!-- @file 移动端聊天室红包消息 -->
<template>
  <mobile-msg-container
    class="c-mobile-redpaper-msg"
    :bubble-model="false"
  >
    <iar-redpaper-entrance
      ref="entranceRef"
      :red-envelope-data="chatMsg"
      :red-envelope-sdk="redpackSdk"
      :lang="currentLang"
      @open="openRedpackDialog"
    />
  </mobile-msg-container>
</template>

<script setup lang="ts">
import MobileMsgContainer from '../_msg-container/mobile-msg-container.vue';
import { useRedpaperMsg } from './use-redpaper-msg';
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarRedpaperEntrance = getIarComponent('RedEnvelopeEntrance');

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { chatMsg, redpackSdk, entranceRef, openRedpackDialog } = useRedpaperMsg();
</script>
