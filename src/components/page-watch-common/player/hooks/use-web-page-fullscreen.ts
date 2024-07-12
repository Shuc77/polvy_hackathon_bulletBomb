import { computed, onMounted, ref, watch } from 'vue';
import { isMobile } from '@/assets/utils/browser';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getWatchCore } from '@/core/watch-sdk';
import { PlayerEvents, FullScreenMode } from '@polyv/live-watch-sdk';

export function useWebPageFullscreen() {
  const isWebPageFullscreen = ref(false);
  const isMobileWebPageFullscreen = computed(() => {
    return isMobile && isWebPageFullscreen.value;
  });
  const { portraitPlayerIsPageFullscreen } = storeDefinitionToRefs(usePortraitLayoutStore);

  watch(portraitPlayerIsPageFullscreen, () => {
    isWebPageFullscreen.value = portraitPlayerIsPageFullscreen.value;
  });

  onMounted(() => {
    const playerModule = getWatchCore().player;

    playerModule.eventEmitter.on(
      PlayerEvents.ToggleFullScreen,
      ({ isPlayerFullscreen, fullScreenMode }) => {
        if (fullScreenMode === FullScreenMode.WebHtml) {
          isWebPageFullscreen.value = isPlayerFullscreen;
        }
      },
    );
  });

  return {
    isMobileWebPageFullscreen,
  };
}
