<template>
  <watch-identify-collect-info-dialog
    v-if="renderEnabled"
    ref="dialogInstance"
    :lang="lang"
    :get-watch-identify-core="getWatchIdentifyCore"
    :auto-open="autoOpen"
  />
</template>

<script lang="ts" setup>
import { useWatchIdentifySDKSceneLoader } from '@/plugins/external-lib-loaders/load-watch-identify-ui-default';
import { defineComponent } from 'vue';
import { useIdentityCollectInfo } from './use-identity-collect-info';

const { getMobilePolyvWatchIdentifySDKSceneComponent } = useWatchIdentifySDKSceneLoader();

const WatchIdentifyCollectInfoDialog = defineComponent(() => {
  return getMobilePolyvWatchIdentifySDKSceneComponent('MobileWatchIdentifyCollectInfoDialog');
});

const { renderEnabled, dialogInstance, lang, getWatchIdentifyCore, autoOpen } =
  useIdentityCollectInfo();
</script>
