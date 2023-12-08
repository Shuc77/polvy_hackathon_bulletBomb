<!-- @file 移动端-邀请有礼活动中奖领取二维码 -->

<template>
  <div class="c-mobile-invite-prize-receive-qrcode">
    <div class="c-mobile-invite-prize-receive-qrcode__body">
      <div class="border-corner border-corner_left_top"></div>
      <div class="border-corner border-corner_right_top"></div>
      <div class="border-corner border-corner_left_bottom"></div>
      <div class="border-corner border-corner_right_bottom"></div>
      <div class="c-mobile-invite-prize-receive-qrcode-img-wrapper">
        <img
          class="c-mobile-invite-prize-receive-qrcode-img g-img-cover"
          :src="invitePrizeWinnerInfo.receiveInfo.qrCode"
        />
      </div>
    </div>

    <p class="g-multiline c-mobile-invite-prize-receive-qrcode-tips">
      {{ invitePrizeWinnerInfo.receiveInfo.qrCodeTips }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { InvitePrizeWinnerQrCode } from '@polyv/live-watch-sdk';
import { useInvitePrizeReceive } from '../_hooks/use-invite-prize-receive';

const { invitePrizeWinnerInfo } = useInvitePrizeReceive<InvitePrizeWinnerQrCode>();
</script>

<style lang="scss">
.c-mobile-invite-prize-receive-qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 16px;

  p {
    line-height: 1.2;
    text-align: center;
  }
}

.c-mobile-invite-prize-receive-qrcode__body {
  position: relative;
  padding: 6px;
}

.border-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 1px solid #ff558f;
}
.border-corner_left_top {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  // border-top-left-radius: 4px;
}
.border-corner_right_top {
  top: 0;
  right: 0;
  border-bottom: none;
  border-left: none;
  // border-top-right-radius: 4px;
}
.border-corner_left_bottom {
  bottom: 0;
  left: 0;
  border-top: none;
  border-right: none;
  // border-bottom-left-radius: 4px;
}
.border-corner_right_bottom {
  right: 0;
  bottom: 0;
  border-top: none;
  border-left: none;
  // border-bottom-right-radius: 4px;
}

.c-mobile-invite-prize-receive-qrcode-img-wrapper {
  width: 120px;
  height: 120px;
  border: 1px solid #ff558f;
}

.c-mobile-invite-prize-receive-qrcode-img {
  width: 100%;
  height: 100%;
}

.c-mobile-invite-prize-receive-qrcode-tips {
  margin-top: 14px;
  color: #fe3f52;
}
</style>
