<template>
  <div
    v-if="canRenderTopingMsg"
    class="c-toping-msg"
  >
    <toping-msg-list />
  </div>
</template>

<script setup lang="ts">
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { computed } from 'vue';
import { usePlayerSetupPanel } from '../../player/hooks/use-player-setup-panel';

const PolyvChatUI = getChatUIV2Pkg();

const { TopingMsgList } = PolyvChatUI;

const { liveStatus } = storeDefinitionToRefs(useChannelStore);

const { isSetupPanelShow } = usePlayerSetupPanel();

const canRenderTopingMsg = computed(() => {
  return liveStatus.value === LiveStatus.Live && !isSetupPanelShow.value;
});
</script>
