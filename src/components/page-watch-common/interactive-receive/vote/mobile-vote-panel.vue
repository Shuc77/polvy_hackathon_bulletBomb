<!-- @file 移动端投票面板 -->
<template>
  <iar-mobile-vote
    class="c-mobile-vote-panel"
    :vote-sdk="voteSdk"
    :voted-list="votedList"
    :lang="currentLang"
  />
</template>

<script setup lang="ts">
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useVote } from './hooks/use-vote';

const IarMobileVote = getIarComponent('MobileVote');

const { voteSdk, votedList } = useVote();

const { currentLang } = storeDefinitionToRefs(useLangStore);
</script>
