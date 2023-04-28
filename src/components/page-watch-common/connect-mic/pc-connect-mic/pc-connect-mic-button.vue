<!-- @file PC 端连麦按钮 -->
<template>
  <div class="c-pc-connect-mic-button">
    <!-- 取消申请 -->
    <normal-button
      v-if="connectMicStatus === ConnectMicStatus.Applying"
      block
      :type="ButtonType.AsideMenu"
      :size="ButtonSize.Small"
      :text="$lang('connectMic.cancelApply')"
      :icon="PcIconHangUp"
      icon-class="c-pc-connect-mic-button__hang-up-icon"
      @click="onClickCancelApplyConnectMic"
    />

    <!-- 结束连麦 -->
    <normal-button
      v-else-if="
        connectMicStatus === ConnectMicStatus.Publishing ||
        connectMicStatus === ConnectMicStatus.Connected
      "
      block
      :type="ButtonType.AsideMenu"
      :size="ButtonSize.Small"
      :text="$lang('connectMic.endConnect')"
      :icon="PcIconHangUp"
      icon-class="c-pc-connect-mic-button__hang-up-icon"
      @click="onClickEndConnectMic"
    />

    <!-- 申请连麦 -->
    <normal-button
      v-else
      block
      :type="ButtonType.AsideMenu"
      :size="ButtonSize.Small"
      :text="
        connectMicType === ConnectMicType.Video
          ? $lang('connectMic.applyConnect.video')
          : $lang('connectMic.applyConnect.audio')
      "
      :icon="PcIconApplyVideoCall"
      icon-class="c-pc-connect-mic-button__apply-icon"
      @click="onClickApplyConnectMic"
    />
  </div>
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import { appEvents, eventBus } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { ConnectMicStatus, ConnectMicType } from '@polyv/live-watch-sdk';
import { PcIconApplyVideoCall, PcIconHangUp } from '@/components/component-icons/pc/map';

const { connectMicStatus, connectMicType } = storeDefinitionToRefs(useConnectMicStore);

/** 点击申请连麦 */
function onClickApplyConnectMic() {
  eventBus.$emit(appEvents.connectMic.TriggerApplyConnectMic);
}

/** 点击取消申请连麦 */
function onClickCancelApplyConnectMic() {
  eventBus.$emit(appEvents.connectMic.TriggerCancelApplyConnectMic);
}

/** 点击结束连麦 */
function onClickEndConnectMic() {
  // 唤起二次确认弹层
  eventBus.$emit(appEvents.connectMic.TriggerEndConnectConfirm);
}
</script>

<style lang="scss">
.c-pc-connect-mic-button__hang-up-icon {
  color: #f06e6e;
}
.c-pc-connect-mic-button__apply-icon {
  color: #3ad088;
}
</style>
