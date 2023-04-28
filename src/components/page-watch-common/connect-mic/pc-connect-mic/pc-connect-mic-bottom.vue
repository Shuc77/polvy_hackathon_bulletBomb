<!-- @file PC 端连麦底部按钮 -->
<template>
  <div
    v-if="supportConnectMic"
    class="c-pc-connect-mic-bottom"
  >
    <!-- 设备检测按钮 -->
    <div class="c-pc-connect-mic-bottom__item">
      <normal-button
        :type="ButtonType.AsideMenu"
        :size="ButtonSize.Small"
        :text="$lang('connectMic.deviceCheck')"
        block
        :icon="PcIconDeviceSetting"
        @click="onClickDeviceSetting"
      />
    </div>

    <!-- 连麦按钮 -->
    <div class="c-pc-connect-mic-bottom__item">
      <pc-connect-mic-button />
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents, eventBus } from '@/app/app-events';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import PcConnectMicButton from './pc-connect-mic-button.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { PcIconDeviceSetting } from '@/components/component-icons/pc/map';

const { supportConnectMic } = storeDefinitionToRefs(useConnectMicStore);

function onClickDeviceSetting() {
  eventBus.$emit(appEvents.connectMic.TriggerOpenDeviceSetting);
}
</script>

<style lang="scss">
.c-pc-connect-mic-bottom {
  display: flex;
  padding: 0 4px 16px;
}

.c-pc-connect-mic-bottom__item {
  flex: 1;
  margin-right: 4px;
  margin-left: 4px;
}
</style>
