<template>
  <redpaper-msg
    v-if="iarSdkLoaded"
    :chat-msg="chatMsg"
  />
</template>

<script setup lang="ts">
import RedpaperMsg from './redpaper-msg.vue';
import { redpapperMsgProps } from './use-redpaper-msg';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

defineProps(redpapperMsgProps());

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
