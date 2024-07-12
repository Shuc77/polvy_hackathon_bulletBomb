<template>
  <div
    class="c-player-tips"
    :class="{
      'c-player-tips--mobile-web-page-fullscreen': isMobileWebPageFullscreen,
      'c-player-tips--mobile': isMobile,
    }"
    v-if="!mobileDocIsPageFullscreen"
  >
    <div
      class="c-player-tips__item c-player-tips__quality-switch-tips"
      v-if="switchQualityTipStatus !== SwitchTipsStatus.Hide"
    >
      <span v-if="switchQualityTipStatus === SwitchTipsStatus.Switching">
        {{ $lang('player.tips.switching')
        }}<span class="c-player-tips__switch-btn">"{{ switchLevelText }}"</span>，{{
          $lang('player.tips.switching2')
        }}
      </span>

      <span v-if="switchQualityTipStatus === SwitchTipsStatus.Finish">
        {{ $lang('player.tips.switchTo')
        }}<span class="c-player-tips__switch-btn">"{{ switchLevelText }}"</span
        >{{ $lang('player.quality') }}
      </span>
    </div>

    <div
      class="c-player-tips__item c-player-tips__weak-network-switch"
      v-if="showWeakNetworkTip"
    >
      <weak-network-switch-tips></weak-network-switch-tips>
    </div>

    <div
      class="c-player-tips__item c-player-tips__quality-switch-tips"
      v-if="switchLineTipStatus !== SwitchTipsStatus.Hide && !isMobile"
    >
      <span v-if="switchLineTipStatus === SwitchTipsStatus.Switching">
        {{ $lang('player.tips.switching')
        }}<span class="c-player-tips__switch-btn">"{{ switchLineText }}"</span>，{{
          $lang('player.tips.switching2')
        }}
      </span>

      <span v-if="switchLineTipStatus === SwitchTipsStatus.Finish">
        {{ $lang('player.tips.switchTo')
        }}<span class="c-player-tips__switch-btn">"{{ switchLineText }}"</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerStore, SwitchTipsStatus } from '@/store/use-player-store';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { useNetworkStatus } from '@/components/page-watch-common/player/hooks/use-network-status';
import { useWeakNetworkSwitch } from '@/components/page-watch-common/player/player-control/weak-network-switch-tips/use-weak-network-switch';
import WeakNetworkSwitchTips from '../weak-network-switch-tips/weak-network-switch-tips.vue';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { getWatchCore } from '@/core/watch-sdk';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { isMobile } from '@/assets/utils/browser';
import { useWebPageFullscreen } from '@/components/page-watch-common/player/hooks/use-web-page-fullscreen';
import { useLayoutStore } from '@/store/use-layout-store';

const props = defineProps({
  isNormalMobileLayout: PropUtils.bool.def(false),
});

const {
  switchQualityTipStatus,
  switchQualityLevel,
  showControl,
  playerInited,
  switchLineLevel,
  switchLineTipStatus,
} = storeDefinitionToRefs(usePlayerStore);

const { mobileDocIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const { qualitySettingList, lineSettingList } = usePlayerControl();
const { isMobileWebPageFullscreen } = useWebPageFullscreen();

const switchLevelText = computed(() => {
  const getLevelText = (level?: number) => {
    if (level === undefined) return;
    return qualitySettingList.value.find(item => {
      return item.value === level;
    })?.text;
  };

  return getLevelText(switchQualityLevel.value);
});

const switchLineText = computed(() => {
  const getLineTex = (line?: number) => {
    if (line === undefined) return;
    return lineSettingList.value.find(item => {
      return item.value === line;
    })?.text;
  };

  return getLineTex(switchLineLevel.value);
});

const { isWeakNetwork } = useNetworkStatus();
const { updateWeakNetworkTips, showWeakNetworkTip, showWeakNetworkOnce } = useWeakNetworkSwitch();

let finishTimer: ReturnType<typeof setTimeout>;

const handleQualityLevelChange = () => {
  clearTimeout(finishTimer);
  // 移动端播放器延迟出现提示，可能效果好点？移动端播放器只要切换清晰度，视频未加载完就触发事件
  setTimeout(() => {
    switchQualityTipStatus.value = SwitchTipsStatus.Finish;
    switchQualityLevel.value = getWatchCore().player.getCurrentQualityLevel();
  }, 600);

  finishTimer = setTimeout(() => {
    switchQualityTipStatus.value = SwitchTipsStatus.Hide;
  }, 3000);
};

onMounted(() => {
  if (props.isNormalMobileLayout) {
    getWatchCore().player.eventEmitter.on(
      PlayerEvents.QualityLevelChange,
      handleQualityLevelChange,
    );
  }
});

onUnmounted(() => {
  if (props.isNormalMobileLayout) {
    getWatchCore().player.eventEmitter.off(
      PlayerEvents.QualityLevelChange,
      handleQualityLevelChange,
    );
  }
});

watch(isWeakNetwork, newVal => {
  if (newVal && playerInited.value && !mobileDocIsPageFullscreen.value) {
    updateWeakNetworkTips();
    showWeakNetworkOnce();
  }
});

watch(showWeakNetworkTip, val => {
  if (val) {
    showControl.value = true;
  }
});
</script>

<style lang="scss" scoped>
.c-player-tips {
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: initial;
  pointer-events: none;
}

.c-player-tips--mobile {
  align-items: center;

  .c-player-tips__item {
    max-width: 70%;
    overflow: hidden;
  }
}

.c-player-tips__item {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: max-content;
  padding: 10px 16px;
  margin: 5px 0;
  font-size: 14px;
  color: #fff;
  pointer-events: initial;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 20px;
}

.c-player-tips__close {
  display: flex;
  margin-left: 8px;
  font-size: 16px !important;
  font-weight: bold;
  color: #a8a8a8;
  cursor: pointer;
}

.c-player-tips__switch-btn {
  padding: 0 3px;
  color: #85a6f7;
}

.c-player-tips--mobile-web-page-fullscreen {
  position: fixed;
  top: calc((var(--plv-fullscreen-vh, 100vh) - 100vw) / 2);
  left: calc((100vw - var(--plv-fullscreen-vh, 100vh)) / 2) !important;
  z-index: 2024;
  align-items: center;
  width: 100vh;
  height: 100vw;
  overflow: inherit !important;
  transform: rotate(90deg) translateY(30px);
}
</style>
