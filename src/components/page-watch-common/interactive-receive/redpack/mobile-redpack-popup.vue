<!-- @file 移动端+竖屏端红包弹层 -->
<template>
  <iar-mobile-red-envelope
    class="c-mobile-redpack-popup"
    :red-envelope-sdk="redpackSdk"
    :red-envelope-data="redpackData"
    :custom-img-config="customImgConfig"
    :open-id="openId"
    :with-draw-enabled="withdrawEnabled"
    :redirect-url="watchUrl"
    :unit="scoreUnit"
    :is-full-screen="isIarFullScreen"
    @copy-success="toastCopySuccess"
    @close="onCloseRedpack"
    @statusChange="onStatusChange"
    @click-withdraw="onClickWithdraw"
    @click-point-record="onClickScoreRecord"
    @received="onPasswordReceived"
  />
</template>

<script setup lang="ts">
import { toastCopySuccess } from '@/assets/utils/copy';
import { useWithdraw } from '@/components/page-watch-common/withdraw/use-withdraw';
import { useRedpack } from './hooks/use-redpack';

import { useChannelStore } from '@/store/use-channel-store';
import { useScoreStore } from '@/store/use-score-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const IarMobileRedEnvelope = getIarComponent('MobileRedEnvelope');

const { watchUrl } = storeDefinitionToRefs(useChannelStore);

const { openId } = storeDefinitionToRefs(useViewerStore);

const { scoreUnit } = storeDefinitionToRefs(useScoreStore);

const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const {
  redpackSdk,
  redpackData,
  customImgConfig,
  onCloseRedpack,
  onStatusChange,
  onClickWithdraw,
  onClickScoreRecord,
  onPasswordReceived,
} = useRedpack();

const { withdrawEnabled } = useWithdraw();
</script>
