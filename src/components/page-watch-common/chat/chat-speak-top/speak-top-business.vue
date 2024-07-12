<template>
  <div
    :class="[
      'c-speak-top-business',
      `c-speak-top-business--${layout}`,
      isMobileWebPageFullscreen && 'c-speak-top-business--mobile-fullscreen',
    ]"
    v-if="speakTopLayerShow"
  >
    <speak-top
      class="c-speak-top-business__comp"
      :content="content"
      :user="user"
      @close="handleClose"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useSpeakTop } from './use-speak-top';
import SpeakTop from './speak-top.vue';
import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useWebPageFullscreen } from '@/components/page-watch-common/player/hooks/use-web-page-fullscreen';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { tupleString } from '@/assets/utils/array';

const playbackStore = usePlaybackStore();

const { liveStatus } = storeDefinitionToRefs(useChannelStore);

defineProps({
  layout: PropUtils.oneOf(tupleString('pc', 'mobile', 'portrait')).isRequired,
});

const { content, user, showSpeakTop } = useSpeakTop();
const { isMobileWebPageFullscreen } = useWebPageFullscreen();

const handleClose = () => {
  showSpeakTop.value = false;
};

const speakTopLayerShow = computed(() => {
  return (
    showSpeakTop.value === true &&
    (liveStatus.value === LiveStatus.Live || playbackStore.chatReplayEnabled)
  );
});
</script>

<style lang="scss" scoped>
.c-speak-top-business {
  pointer-events: initial;
}
.c-speak-top-business--pc {
  position: absolute;
  top: 8%;
  left: 38.1%;
  z-index: 320;
  transform: translateX(-50%);

  .c-speak-top-business__comp {
    width: 450px;
  }
}

.c-pc-watch-layout__main__fullscreen-wrap--fullscreened {
  .c-speak-top-business--pc {
    left: 50%;
  }
}

.c-speak-top-business--mobile {
  position: absolute;
  top: 24px;
  left: 50%;
  width: 311px;
  transform: translateX(-50%);
}

.c-mobile-main .c-speak-top-business--mobile-fullscreen {
  position: fixed;
  top: calc((var(--plv-fullscreen-vh, 100vh) - 100vw) / 2);
  left: 43%;
  z-index: 2024;
  // overflow: inherit !important;
  transform: rotate(90deg) translateX(50%);
}

.c-speak-top-business--portrait {
  position: absolute;
  top: 75px;
  left: 50%;
  width: 311px;
  transform: translateX(-50%);
}
</style>
