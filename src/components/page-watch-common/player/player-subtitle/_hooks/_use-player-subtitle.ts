import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { computed, ref, watch } from 'vue';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';
import { useVue } from '@/hooks/core/use-vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

export const useSubtitleProps = () => ({
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

export const usePlayerSubtitle = (options: { props: VueProps<typeof useSubtitleProps> }) => {
  const { props } = options;
  const { getCurrentElem } = useVue();

  const { playerInited } = storeDefinitionToRefs(usePlayerStore);
  const { isFullscreen } = storeDefinitionToRefs(useLayoutStore);

  const fontsizeNumber = ref(10);

  const fontsize = computed(() => {
    return `${fontsizeNumber.value}px`;
  });

  const subtitleHeight = computed(() => {
    return Number((fontsizeNumber.value * 3.4).toFixed(2));
  });

  const reCalcFontSize = () => {
    const $currentEl = getCurrentElem();
    if (!$currentEl || !$currentEl.parentElement) return;

    const { width } = $currentEl.parentElement.getBoundingClientRect();
    const tempSize = width / 54 < 12 ? 12 : width / 54;
    fontsizeNumber.value = Number(tempSize.toFixed(2));
  };

  useWindowResizeListener(() => {
    reCalcFontSize();
  }, true);

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
    mountedEl(isFullscreen.value ? props.fullScreenSelector : props.selector);
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

  const listenPlayerInitEvent = () => {
    const watchCore = getWatchCore();

    watchCore.player.eventEmitter.on(PlayerEvents.PlayerInited, initEl);
  };

  function init() {
    if (props.initToPlayer && !playerInited.value) {
      listenPlayerInitEvent();
    } else {
      initEl();
    }
  }

  function destroy() {
    const watchCore = getWatchCore();
    watchCore.player.eventEmitter.off(PlayerEvents.PlayerInited, initEl);

    removeEl();
  }

  return {
    fontsize,
    subtitleHeight,

    init,
    destroy,
  };
};
