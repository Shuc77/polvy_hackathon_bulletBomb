<template>
  <div
    class="c-mobile-more-entrance pws-dark-white-color-100 pws-light-black-color-80"
    :class="{
      'pws-dark-white-bg-10 pws-light-white-bg-90': !isChatUIV2,
      'pws-dark-black-bg-20 pws-light-white-bg-60': isChatUIV2,
    }"
    @click="onClickMore"
  >
    <mobile-icon-more-entrance />
  </div>
</template>

<script setup lang="ts">
import { MobileIconMoreEntrance } from '@/components/component-icons/mobile/map';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';

const { getEmitter } = useGlobalInject();

const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);

function onClickMore() {
  getEmitter().emit(appEvents.global.OpenMobileMorePopup, true);
}
</script>

<style lang="scss">
.c-mobile-more-entrance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  min-width: 36px;
  height: 36px;
  border-radius: 50%;

  span {
    display: flex;
    font-size: 36px;
  }
}
</style>
