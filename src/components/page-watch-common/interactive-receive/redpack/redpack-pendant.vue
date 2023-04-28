<!-- @file PC、移动、竖屏红包挂件 -->
<template>
  <iar-red-envelop-pendant
    class="c-redpack-pendant"
    auto-toggle
    :red-envelope-sdk="redpackSdk"
    :auto-fetch-detail="autoFetchDetail"
    @visible-changed="onEntryVisibleChanged"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useRedpackPendant } from './hooks/use-redpack-pendant';

const IarRedEnvelopPendant = getIarComponent('RedEnvelopePendant');

const { redpackSdk, autoFetchDetail, onEntryVisibleChanged } = useRedpackPendant();
</script>
