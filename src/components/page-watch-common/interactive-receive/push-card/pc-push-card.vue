<!-- @file 移动卡片推送 -->
<template>
  <iar-push-card
    class="c-pc-push-card"
    internal
    :push-card-sdk="pushCardSdk"
    :get-link-params="getLinkParams"
    @entry-visible-changed="onEntryVisibleChanged"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { usePushCard, usePushCardLinkParams } from './hooks/use-push-card';

const IarPushCard = getIarComponent('PushCard');

const { pushCardSdk, onEntryVisibleChanged } = usePushCard();

const { getLinkParams } = usePushCardLinkParams();
</script>
