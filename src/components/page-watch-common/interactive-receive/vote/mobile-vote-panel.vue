<!-- @file 移动端投票面板 -->
<template>
  <iar-mobile-vote
    class="c-mobile-vote-panel pws-iar-vote"
    :vote-sdk="voteSdk"
    :lang="currentLang"
  />
</template>

<script setup lang="ts">
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useGlobalInject } from '@/app/use-global-inject';

const IarMobileVote = getIarComponent('MobileVote');

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();
/** 投票 SDK 实例 */
const voteSdk = watchCore.interactReceive.getVote();

const { currentLang } = storeDefinitionToRefs(useLangStore);
</script>
