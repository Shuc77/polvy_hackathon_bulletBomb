<!-- @file 移动端-邀请有礼活动中奖领取弹窗 -->

<template>
  <mobile-popup
    v-if="invitePrizeWinnerInfo"
    class="c-mobile-invite-prize-receive-popup"
    :title="receivePopupTitle"
    :visible.sync="popupVisible"
    fill-body-section
    :content-height="popupContentHeight"
    append-to-body
  >
    <mobile-invite-prize-receive-form
      v-if="invitePrizeWinnerInfo.receiveType === InvitePrizeReceiveType.Form"
    />
    <mobile-invite-prize-receive-qrcode
      class="c-mobile-invite-prize-receive__qrCode"
      v-else-if="invitePrizeWinnerInfo.receiveType === InvitePrizeReceiveType.QrCode"
    />
    <div v-else></div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { InvitePrizeReceiveType, InvitePrizeWinnerInfo } from '@polyv/live-watch-sdk';

import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileInvitePrizeReceiveForm from './mobile-invite-prize-receive-form.vue';
import MobileInvitePrizeReceiveQrcode from './mobile-invite-prize-receive-qrcode.vue';

import { useInvitePrizeReceive } from '../_hooks/use-invite-prize-receive';
import { usePageStore } from '@/store/use-page-store';

const pageStore = usePageStore();

const { invitePrizeWinnerInfo, receivePopupTitle } =
  useInvitePrizeReceive<InvitePrizeWinnerInfo | null>();

const popupVisible = ref(false);
useEventBusListener(appEvents.invite.OpenInvitePrizeReceivePopup, () => {
  popupVisible.value = true;
});

const popupContentHeight = computed(() => {
  if (invitePrizeWinnerInfo.value?.receiveType === InvitePrizeReceiveType.QrCode) {
    return Math.max(pageStore.pageClientHeight * 0.4, 306);
  }
  return undefined;
});
</script>

<style lang="scss">
.c-mobile-invite-prize-receive__qrCode {
  padding: 40px 40px 40px 33px;
  @include iphone-x-pb(24px, false);
}
</style>
