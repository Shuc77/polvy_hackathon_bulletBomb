<!-- @file 移动端播放器控制栏 -->
<template>
  <div
    class="c-mobile-player-control"
    :class="{
      'c-mobile-player-control--page-fullscreen': mobilePlayerIsPageFullscreen,
    }"
  >
    <div class="c-mobile-player-control__tips-wrap">
      <!-- rtc 暂停播放的提示 -->
      <div
        v-if="playerControlVisible && rtcPlayerPauseTipVisible"
        class="c-mobile-player-control__tips c-mobile-player-control__tips--rtc-paused"
      >
        {{ $lang('player.rtc.paused') }}
      </div>
    </div>

    <!-- 控制栏 -->
    <transition name="slide">
      <div
        v-show="playerControlVisible"
        class="c-mobile-player-control__main"
        @click.stop="startHideTimer"
      >
        <div class="c-mobile-player-control__inner">
          <!-- 左侧按钮 -->
          <div class="c-mobile-player-control__inner__left">
            <!-- 暂停播放按钮 -->
            <div
              v-if="playButtonVisible"
              class="c-mobile-player-control__button"
              :class="{
                'c-mobile-player-control__button--pause': playStatus === PlayStatus.Playing,
                'c-mobile-player-control__button--play': playStatus === PlayStatus.Pause,
              }"
              @click="toTogglePlay"
            ></div>

            <!-- 刷新按钮 -->
            <div
              v-if="refreshButtonVisible"
              class="c-mobile-player-control__button c-mobile-player-control__button--refresh"
              @click="toRefresh"
            ></div>
          </div>

          <!-- 右侧按钮 -->
          <div class="c-mobile-player-control__inner__right">
            <template v-if="barrageSetting.barrageEnabled">
              <!-- 弹幕设置 -->
              <mobile-icon-barrage-setting
                v-if="isHorizontalScreenOrientation || mobilePlayerIsPageFullscreen"
                class="c-mobile-player-control__button"
                color="#fff"
                @click="toToggleBarrageSettingVisible(!barrageSettingVisible)"
              />
              <!-- 弹幕开关 -->
              <mobile-origin-icon-barrage-on
                v-if="barrageShow"
                class="c-mobile-player-control__button"
                @click="toToggleBarrageShow"
              />
              <mobile-origin-icon-barrage-off
                v-else
                class="c-mobile-player-control__button"
                @click="toToggleBarrageShow"
              />
            </template>

            <!-- 全屏按钮 -->
            <div
              class="c-mobile-player-control__button"
              :class="{
                'c-mobile-player-control__button--fullscreen': !mobilePlayerIsPageFullscreen,
                'c-mobile-player-control__button--fullscreen-exit': mobilePlayerIsPageFullscreen,
              }"
              @click="toToggleMobilePageFullscreen"
            ></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { onBeforeUnmount, onMounted } from 'vue';

import {
  MobileOriginIconBarrageOff,
  MobileOriginIconBarrageOn,
} from '@/components/component-icons/mobile-origin/map';
import { MobileIconBarrageSetting } from '@/components/component-icons/mobile/map';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { PlayStatus } from '@polyv/live-watch-sdk';
import { usePlayerAction } from '../../hooks/use-player-action';
import { usePlayerControl } from '../../hooks/use-player-control';

const playerStore = usePlayerStore();
const { playStatus, playerControlVisible, barrageSetting, barrageShow, barrageSettingVisible } =
  storeDefinitionToRefs(usePlayerStore);

const { isHorizontalScreenOrientation, mobilePlayerIsPageFullscreen } =
  storeDefinitionToRefs(useLayoutStore);

const {
  toTogglePlay,
  toRefresh,
  toToggleMobilePageFullscreen,
  toToggleBarrageShow,
  toToggleBarrageSettingVisible,
} = usePlayerAction();

const {
  rtcPlayerPauseTipVisible,

  playButtonVisible,
  refreshButtonVisible,
} = usePlayerControl();

/** 显示控制栏 */
function openControl() {
  playerStore.$patch({
    playerControlVisible: true,
  });
  startHideTimer();
}

/** 隐藏控制栏 */
function closeControl() {
  playerStore.$patch({
    playerControlVisible: false,
  });
}

/** 切换控制栏 */
function toggleControl() {
  if (playerStore.playerControlVisible) {
    closeControl();
  } else {
    openControl();
  }
}

let hideTimer: number | undefined;

/** 启动隐藏定时器 */
function startHideTimer() {
  clearHideTimer();
  hideTimer = window.setTimeout(() => {
    closeControl();
  }, 3 * 1000);
}

/** 清除隐藏定时器 */
function clearHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }
}

useEventBusListener(appEvents.player.ClickMobilePlayerContainer, () => {
  toggleControl();
});

onMounted(() => {
  openControl();
});

onBeforeUnmount(() => {
  clearHideTimer();
});
</script>

<style lang="scss">
.c-mobile-player-control {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 310;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.c-mobile-player-control__tips-wrap {
  position: absolute;
  bottom: 32px;
  left: 8px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;
}

.c-mobile-player-control__tips {
  display: flex;
  align-items: center;
  padding: 7px 12px;
  font-size: 12px;
  font-style: normal;
  color: $--color-white;
  text-align: center;
  white-space: nowrap;
  pointer-events: initial;
  background-color: $--player-control-panel-bg;
  border-radius: 14px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.c-mobile-player-control__main {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 88px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
}
.c-mobile-player-control__inner {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  pointer-events: initial;
}
.c-mobile-player-control__inner__left {
  display: flex;
  align-items: center;
  padding-left: 8px;
}
.c-mobile-player-control__inner__right {
  display: flex;
  align-items: center;
  padding-right: 8px;
  margin-left: auto;

  .polyv-icon {
    display: inline-block;
    height: 32px;
  }
}

.c-mobile-player-control__button {
  display: flex;
  width: 32px;
  height: 32px;
  font-size: 32px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.c-mobile-player-control__button--play {
  background-image: url(./imgs/mobile-player-ui-play.png);
}
.c-mobile-player-control__button--pause {
  background-image: url(./imgs/mobile-player-ui-pause.png);
}
.c-mobile-player-control__button--refresh {
  background-image: url(./imgs/mobile-player-ui-refresh.png);
}
.c-mobile-player-control__button--setting {
  background-image: url(./imgs/mobile-player-ui-setting.png);
}
.c-mobile-player-control__button--fullscreen {
  background-image: url(./imgs/mobile-player-ui-fullscreen.png);
}
.c-mobile-player-control__button--fullscreen-exit {
  background-image: url(./imgs/mobile-player-ui-fullscreen-exit.png);
}

.c-mobile-player-control--page-fullscreen {
  .c-mobile-player-control__inner__left {
    padding-left: 50px;
  }
  .c-mobile-player-control__inner__right {
    padding-right: 50px;
  }
}
</style>
