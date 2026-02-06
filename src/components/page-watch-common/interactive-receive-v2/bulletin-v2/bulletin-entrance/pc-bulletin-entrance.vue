<template>
  <iar-pc-bulletin-entrance
    v-if="targetInited && announcementFunctionVisible"
    :bulletin-target="getIarTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useBulletin } from '../use-bulletin';

const { loadIarUI } = useIarUILoader('iar-bulletin-ui');

const IarPcBulletinEntrance = defineAsyncComponent(() => loadIarUI('pc-bulletin-entrance'));

const { announcementFunctionVisible } = storeDefinitionToRefs(useInteractReceiveStore);

const { targetInited, getIarTarget } = useBulletin();
</script>
