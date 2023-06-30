<!-- @file 移动端连麦用户节点 -->
<template>
  <div class="c-mobile-connect-mic-user-item">
    <div
      ref="wrapRef"
      class="c-mobile-connect-mic-user-item__wrap"
    ></div>

    <!-- 关闭摄像头 -->
    <player-video-placeholder
      v-if="isVideoMuted"
      :is-sip-user="isSipUser"
    />

    <!-- 音频直播下第一画面位置的占位图 -->
    <player-audio-live-placeholder
      v-if="isMaster && isCustomLiveAudioMode"
      :use-splash-img="isCustomLiveAudioMode"
    />

    <!-- 右上角网络状态 -->
    <connect-mic-network
      v-if="isLocal"
      class="c-mobile-connect-mic-user-item__network"
      :network-status="networkInfo.uplinkNetworkStatus"
    />

    <!-- 底部信息 -->
    <connect-mic-info
      v-if="micInfoVisible"
      :nickname="micNickname"
      :is-audio-muted="isAudioMuted"
      :current-volume="currentVolume"
    />
  </div>
</template>

<script setup lang="ts">
import ConnectMicInfo from '../common/connect-mic-info.vue';
import ConnectMicNetwork from '../common/connect-mic-network.vue';
import PlayerVideoPlaceholder from '@/components/common-business/player/player-video-placeholder.vue';
import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';

import { connectMicItemProps, useConnectMicItem } from '../hooks/use-connect-mic-item';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';

const props = defineProps(connectMicItemProps());

const {
  wrapRef,
  micInfoVisible,
  micNickname,
  isAudioMuted,
  currentVolume,
  isVideoMuted,
  isSipUser,
  isLocal,
  isMaster,
} = useConnectMicItem({
  props,
});

const { networkInfo } = storeDefinitionToRefs(useConnectMicStore);

const { isCustomLiveAudioMode } = storeDefinitionToRefs(useChannelStore);
</script>

<style lang="scss">
.c-mobile-connect-mic-user-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-mobile-connect-mic-user-item__network {
  position: absolute;
  top: 0;
  right: 0;
}

.c-mobile-connect-mic-user-item__wrap {
  width: 100%;
  height: 100%;

  video {
    transform: none !important;
  }
}
</style>
