<template>
  <div
    v-if="showDonateFunction"
    class="c-mobile-donate-entrance"
    :class="{
      'pws-dark-white-bg-10 pws-light-white-bg-90': !isChatUIV2,
      'pws-dark-black-bg-20 pws-light-white-bg-60': isChatUIV2,
    }"
    @click="onClickDonateEnter"
  ></div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useDonateStore } from '@/store/use-donate-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useChatStore } from '@/store/use-chat-store';

const { getEmitter } = useGlobalInject();
const { toInterruptUserClick } = useInterruptUserClick();

const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

function onClickDonateEnter() {
  const result = toInterruptUserClick({
    triggerSource: 'donate',
    ignoreSetNick: true,
  });

  if (result) {
    return;
  }

  getEmitter().emit(appEvents.donate.OpenDonatePopup, true);
}
</script>

<style lang="scss">
.c-mobile-donate-entrance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;

  &::after {
    width: 20px;
    height: 20px;
    content: '';
    background-image: url(./images/icon-gift.png);
    background-size: 100% 100%;
  }
}
</style>
