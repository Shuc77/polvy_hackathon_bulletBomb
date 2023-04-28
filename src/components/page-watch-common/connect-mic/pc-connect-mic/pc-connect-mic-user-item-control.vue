<!-- @file PC 端连麦控制 -->
<template>
  <div
    class="c-pc-connect-mic-control"
    @mouseenter="showControl"
    @mouseleave="setHideTimer"
  >
    <transition name="fade">
      <div
        v-show="controlVisible"
        class="c-pc-connect-mic-control__content"
      >
        <div
          v-if="connectMicType === ConnectMicType.Video"
          class="c-pc-connect-mic-control__button g-img-cover"
          :class="{
            'c-pc-connect-mic-control__button--video-normal': !isVideoMuted,
            'c-pc-connect-mic-control__button--video-muted': isVideoMuted,
          }"
          @click="onClickVideo"
        ></div>
        <div
          class="c-pc-connect-mic-control__button g-img-cover"
          :class="{
            'c-pc-connect-mic-control__button--audio-normal': !isAudioMuted,
            'c-pc-connect-mic-control__button--audio-muted': isAudioMuted,
          }"
          @click="onClickAudio"
        ></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { ConnectMicType } from '@polyv/live-watch-sdk';
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  /** 连麦方式 */
  connectMicType: PropUtils.enum<ConnectMicType>().def(ConnectMicType.Video),
  /** 是否关闭摄像头 */
  isVideoMuted: PropUtils.bool.def(false),
  /** 是否关闭麦克风 */
  isAudioMuted: PropUtils.bool.def(false),
});

const emit = defineEmits({
  /** 开启摄像头 */
  'enabled-video': emitFunc<void>(),
  /** 关闭摄像头 */
  'disabled-video': emitFunc<void>(),
  /** 开启麦克风 */
  'enabled-audio': emitFunc<void>(),
  // 关闭麦克风
  'disabled-audio': emitFunc<void>(),
});

function onClickVideo() {
  if (props.isVideoMuted) {
    emit('enabled-video');
  } else {
    emit('disabled-video');
  }
}

function onClickAudio() {
  if (props.isAudioMuted) {
    emit('enabled-audio');
  } else {
    emit('disabled-audio');
  }
}

const controlVisible = ref(false);

function showControl() {
  controlVisible.value = true;
  clearHideTimer();
}

function hideControl() {
  controlVisible.value = false;
}

let closeTimer: number | undefined;

function setHideTimer() {
  closeTimer = window.setTimeout(() => {
    hideControl();
  }, 3000);
}

function clearHideTimer() {
  if (closeTimer) {
    clearInterval(closeTimer);
    closeTimer = undefined;
  }
}

onMounted(() => {
  showControl();
  setHideTimer();
});

onUnmounted(() => {
  clearHideTimer();
});
</script>

<style lang="scss">
.c-pc-connect-mic-control {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.c-pc-connect-mic-control__content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.c-pc-connect-mic-control__button {
  width: 40px;
  height: 40px;
  margin: 0 6px;
  cursor: pointer;
}

.c-pc-connect-mic-control__button--video-normal {
  background-image: url(../imgs/item-video-open.png);
  &:hover {
    background-image: url(../imgs/item-video-open-hover.png);
  }
}

.c-pc-connect-mic-control__button--video-muted {
  background-image: url(../imgs/item-video-close.png);
  &:hover {
    background-image: url(../imgs/item-video-close-hover.png);
  }
}

.c-pc-connect-mic-control__button--audio-normal {
  background-image: url(../imgs/item-audio-open.png);
  &:hover {
    background-image: url(../imgs/item-audio-open-hover.png);
  }
}

.c-pc-connect-mic-control__button--audio-muted {
  background-image: url(../imgs/item-audio-close.png);
  &:hover {
    background-image: url(../imgs/item-audio-close-hover.png);
  }
}
</style>
