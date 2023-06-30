<!-- @file PC 端连麦用户节点 -->
<template>
  <div class="c-pc-connect-mic-user-item">
    <div
      ref="wrapRef"
      class="c-pc-connect-mic-user-item__wrap"
    ></div>

    <!-- 占位图 -->
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
      v-if="micInfoVisible && isLocal"
      class="c-pc-connect-mic-user-item__network"
      :network-status="networkInfo.uplinkNetworkStatus"
    />

    <!-- 底部信息 -->
    <connect-mic-info
      v-if="micInfoVisible"
      :nickname="micNickname"
      :is-audio-muted="isAudioMuted"
      :current-volume="currentVolume"
    />

    <!-- 连麦控制 -->
    <connect-mic-user-item-control
      v-if="micInfoVisible && isLocal"
      :connect-mic-type="currentConnectMicType"
      :is-audio-muted="isAudioMuted"
      :is-video-muted="isVideoMuted"
      @enabled-video="enabledVideo"
      @disabled-video="disabledVideo"
      @enabled-audio="enabledAudio"
      @disabled-audio="disabledAudio"
    />

    <!-- 当前正在屏幕共享时的遮罩层 -->
    <screen-share-mask
      v-if="
        isLocal &&
        isMaster &&
        screenShareInfo.isScreenSharing &&
        mainScreen === MainScreenContent.Player
      "
    />
  </div>
</template>

<script setup lang="ts">
import ConnectMicInfo from '../common/connect-mic-info.vue';
import ConnectMicNetwork from '../common/connect-mic-network.vue';
import PlayerVideoPlaceholder from '@/components/common-business/player/player-video-placeholder.vue';
import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';
import ConnectMicUserItemControl from './pc-connect-mic-user-item-control.vue';
import ScreenShareMask from './pc-connect-mic-user-item-screenshare-mask.vue';
import { MainScreenContent } from '@polyv/live-watch-sdk';

import { useConnectMicControl } from '../hooks/use-connect-mic';
import { connectMicItemProps, useConnectMicItem } from '../hooks/use-connect-mic-item';

import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useLayoutStore } from '@/store/use-layout-store';

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
  currentConnectMicType,
} = useConnectMicItem({
  props,
});

const { enabledVideo, disabledVideo, enabledAudio, disabledAudio } = useConnectMicControl();

const { screenShareInfo, networkInfo } = storeDefinitionToRefs(useConnectMicStore);

const { mainScreen } = storeDefinitionToRefs(useLayoutStore);

const { isCustomLiveAudioMode } = storeDefinitionToRefs(useChannelStore);
</script>

<style lang="scss">
.c-pc-connect-mic-user-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-pc-connect-mic-user-item__network {
  position: absolute;
  top: 0;
  right: 0;
}

.c-pc-connect-mic-user-item__wrap {
  width: 100%;
  height: 100%;

  video {
    transform: none !important;
  }
}
</style>
