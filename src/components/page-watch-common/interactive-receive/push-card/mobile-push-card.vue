<!-- @file 移动卡片推送 -->
<template>
  <iar-push-card
    v-show="pushCardPendantVisible"
    append-body
    class="c-mobile-push-card"
    internal
    :push-card-sdk="pushCardSdk"
    :is-full-screen="isIarFullScreen"
    @entry-visible-changed="onEntryVisibleChanged"
  />
</template>

<script setup lang="ts">
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { usePushCard } from './hooks/use-push-card';

const IarPushCard = getIarComponent('PushCard');

const { pushCardPendantVisible, isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const { pushCardSdk, onEntryVisibleChanged } = usePushCard();
</script>
