<!-- @file 播放器音频直播占位图 -->
<template>
  <div
    ref="wrapRef"
    class="c-player-audio-live-placeholder"
  >
    <div
      v-if="useSplashImg"
      class="c-player-audio-live-placeholder__splash g-img-cover"
      :style="{
        backgroundImage: `url(${channelSplashImg})`,
      }"
    ></div>

    <div
      v-else
      class="c-player-audio-live-placeholder__content"
    >
      <img src="@/assets/images/player/player-audio-mode.png" />
      <span
        :style="{
          fontSize: `${fontSize}px`,
        }"
        >{{ $lang('live.audioLive') }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { useChannelInfoStore } from '@/store/use-channel-info-store';

const props = defineProps({
  /** 是否使用引导页封面图作为占位图 */
  useSplashImg: PropUtils.bool.def(false),
});

const { channelSplashImg } = storeDefinitionToRefs(useChannelInfoStore);

const useSplashImg = computed(() => {
  if (props.useSplashImg && unref(channelSplashImg)) {
    return true;
  }
  return false;
});

const fontSize = ref(22);

const wrapRef = ref<HTMLDivElement>();

async function computeFontSize() {
  await nextTick();

  const wrapELem = unref(wrapRef);
  if (!wrapELem) return;

  if (wrapELem.clientWidth > 300) {
    fontSize.value = 22;
  } else {
    fontSize.value = 14;
  }
}

onMounted(() => {
  computeFontSize();
});

const { mainScreen } = storeDefinitionToRefs(useLayoutStore);
watch(
  () => unref(mainScreen),
  () => {
    computeFontSize();
  },
);
</script>

<style lang="scss">
.c-player-audio-live-placeholder {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.c-player-audio-live-placeholder__splash {
  width: 100%;
  height: 100%;
}

.c-player-audio-live-placeholder__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 22px;
  color: $--color-white;
  background-color: rgb(43, 48, 69);

  img {
    width: 42%;
  }

  span {
    margin-top: -5%;
  }
}
</style>
