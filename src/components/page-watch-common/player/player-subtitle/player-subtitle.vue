<template>
  <div
    v-show="subtitlesEnable && localUerSubtitlesEnable"
    class="c-player-subtitle"
    :style="`bottom: ${bottom}px`"
  >
    {{ subtitleText }}
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch, computed } from 'vue';
import { SubtitleRealTimeCC, PlayerEvents } from '@polyv/live-watch-sdk';

import { getWatchCore } from '@/core/watch-sdk';
import { appEvents, eventBus } from '@/app/app-events';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

import { useVue } from '@/hooks/core/use-vue';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useLayoutStore } from '@/store/use-layout-store';

const { getCurrentElem } = useVue();

const { subtitlesEnable, localUerSubtitlesEnable } = storeDefinitionToRefs(useSubtitleStore);
const { isFullscreen } = storeDefinitionToRefs(useLayoutStore);

const props = defineProps({
  /** 挂载选择器，初始化时会自动挂载到对应的 DOM 节点 */
  selector: PropUtils.string,
  /** 全屏选择器，全屏时会自动挂载到对应的 DOM 节点 */
  fullScreenSelector: PropUtils.string,
  /** 是否等待播放器初始化后再加载，默认 false */
  initToPlayer: PropUtils.bool.def(false),
  /** 字幕展示的最大字符数 */
  maxLen: PropUtils.number.def(130),
  /** 字幕相对底部的距离 */
  bottom: PropUtils.number.def(150),
});

const fontsize = ref('10px');

const reCalcFontSize = () => {
  const $currentEl = getCurrentElem();
  if (!$currentEl || !$currentEl.parentElement) return;

  const { width } = $currentEl.parentElement.getBoundingClientRect();
  const tempSize = width / 54 < 10 ? 10 : width / 54;
  fontsize.value = tempSize.toFixed(2) + 'px';
};

useWindowResizeListener(() => {
  reCalcFontSize();
}, true);

const receivedSubtitleText = ref('');

const subtitleText = computed(() => {
  if (receivedSubtitleText.value.length > props.maxLen) {
    return receivedSubtitleText.value.substring(receivedSubtitleText.value.length - props.maxLen);
  }
  return receivedSubtitleText.value;
});

let debounceTimer: null | number = null;

const onSubtitleRealTimeCC = (data: SubtitleRealTimeCC) => {
  receivedSubtitleText.value = data.text;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(() => {
    receivedSubtitleText.value = '';
  }, 3000);
};

watch(
  () => subtitlesEnable.value,
  val => {
    if (!val) {
      receivedSubtitleText.value = '';
    }
  },
);

const mountedEl = (selector: string) => {
  const $el = document.querySelector(selector);
  if (!$el) return;

  const $currentEl = getCurrentElem();
  if (!$currentEl) return;

  $el.append($currentEl);
  reCalcFontSize();
};

const removeEl = () => {
  const $currentEl = getCurrentElem();

  if (!$currentEl) return;
  $currentEl.remove();
};

const initEl = () => {
  mountedEl(props.selector);
  eventBus.$on(appEvents.player.SubtitleRealTimeCC, onSubtitleRealTimeCC);
};

const listenPlayerEvent = () => {
  const watchCore = getWatchCore();
  watchCore.player.eventEmitter.on(PlayerEvents.PlayerInited, initEl);
};

watch(
  () => isFullscreen.value,
  val => {
    if (val && props.fullScreenSelector) {
      mountedEl(props.fullScreenSelector);
    } else {
      mountedEl(props.selector);
    }
  },
);

onMounted(() => {
  if (props.initToPlayer) {
    listenPlayerEvent();
  } else {
    initEl();
  }
});

const unListenPlayerEvent = () => {
  const watchCore = getWatchCore();
  watchCore.player.eventEmitter.off(PlayerEvents.PlayerInited, initEl);

  eventBus.$off(appEvents.player.SubtitleRealTimeCC, onSubtitleRealTimeCC);
};

onBeforeUnmount(() => {
  unListenPlayerEvent();
  removeEl();
});
</script>

<style scoped lang="scss">
.c-player-subtitle {
  position: absolute;
  bottom: 150px;
  left: 10%;
  z-index: 9;
  width: 80%;
  font-size: v-bind(fontsize);
  line-height: 1.5;
  color: #fff;
  text-align: left;
  // prettier-ignore
  text-shadow: rgb(0, 0, 0) 1px 0 1px,
    rgb(0, 0, 0) 0 1px 1px,
    rgb(0, 0, 0) 0 -1px 1px,
    rgb(0, 0, 0) -1px 0 1px;
}
</style>
