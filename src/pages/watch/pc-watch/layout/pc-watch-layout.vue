<!-- @file PC 端观看页主体布局 -->
<template>
  <div
    class="c-pc-watch-layout g-outside pws-pc-watch-bg"
    :style="{
      backgroundImage: pcWatchBackgroundImage ? `url(${pcWatchBackgroundImage}) !important` : '',
    }"
  >
    <!-- 上半部分 -->
    <div
      class="c-pc-watch-layout__main-wrap"
      :class="{
        'c-pc-watch-layout__main-wrap--has-doc': canRenderDoc,
      }"
    >
      <div
        class="c-pc-watch-layout__main g-boundary"
        :class="{
          'c-pc-watch-layout__main--sub-pack-up': subScreenPackUp,
        }"
      >
        <!-- 主体布局左侧 -->
        <div class="c-pc-watch-layout__main__left">
          <!-- 基础信息区域 -->
          <div
            v-if="!iframeMode"
            class="c-pc-watch-layout__main__basic-wrap"
          >
            <pc-basic-info />
          </div>
        </div>

        <!-- 主体布局右侧 -->
        <div class="c-pc-watch-layout__main__right">
          <!-- 右侧顶部占位 -->
          <div
            v-if="canRenderDoc"
            class="c-pc-watch-layout__main__right__top"
          ></div>

          <!-- 右侧主体 -->
          <div class="c-pc-watch-layout__main__right__content">
            <!-- 页面广告 -->
            <pc-page-advert v-if="!isWatchBackUrl" />

            <!-- 侧边菜单栏 -->
            <div class="c-pc-watch-layout__main__right__content__inner">
              <pc-watch-aside-menu />
            </div>
          </div>

          <!-- 打赏支付 -->
          <pc-donate-pay-qrcode class="c-pc-watch-layout__main__right__donate-pay" />
        </div>

        <div
          class="c-pc-watch-layout__main__fullscreen-wrap"
          :class="{
            'c-pc-watch-layout__main__fullscreen-wrap--fullscreened': isFullscreen,
          }"
        >
          <div class="c-pc-watch-layout__main__fullscreen-wrap__height"></div>

          <!-- 播放器层 -->
          <div
            :class="{
              'c-pc-watch-layout__main__player-wrap': true,
              'c-pc-watch-layout__main__player-wrap--right':
                mainScreen !== MainScreenContent.Player,
            }"
          >
            <div class="c-pc-watch-layout__main__player-content">
              <div class="c-pc-watch-layout__main__player-inner">
                <pc-connect-mic-user-item
                  v-if="masterMicItem"
                  :key="`master-stream-${masterMicItem.streamId}`"
                  :mic-item="masterMicItem"
                  :mic-info-visible="mainScreen !== MainScreenContent.Player"
                />
                <pc-player-main v-else />
              </div>
            </div>
          </div>

          <!-- 文档层 -->
          <div
            v-if="canRenderDoc"
            :class="{
              'c-pc-watch-layout__main__player-wrap': true,
              'c-pc-watch-layout__main__player-wrap--right': mainScreen !== MainScreenContent.Doc,
            }"
          >
            <div class="c-pc-watch-layout__main__player-content">
              <div class="c-pc-watch-layout__main__player-inner">
                <pc-doc />
              </div>
            </div>
          </div>

          <!-- 副屏收起控件 -->
          <div
            v-show="!isFullscreen"
            class="c-pc-watch-layout__sub-pack-up-wrap"
          >
            <pc-watch-sub-pack-up v-if="canRenderDoc" />
          </div>

          <!-- 播放器弹幕层 -->
          <div class="c-pc-watch-layout__main-layer c-pc-watch-layout__main__player-barrage">
            <pc-barrage />
          </div>

          <!-- 播放器控制栏层 -->
          <div class="c-pc-watch-layout__main-layer c-pc-watch-layout__main__player-control">
            <pc-player-control />
          </div>

          <!-- 直播倒计时 + 直播预约层 -->
          <pc-count-down-layer
            class="c-pc-watch-layout__main-layer c-pc-watch-layout__main__count-down"
          />
        </div>
      </div>
    </div>

    <!-- 下半部分 -->
    <div
      v-if="!isWatchBackUrl && !iframeMode"
      class="c-pc-watch-layout__menu-panel-wrap"
    >
      <div class="c-pc-watch-layout__menu-panel-content g-boundary">
        <!-- 多会场 -->
        <pc-multi-meeting />

        <!-- 底部菜单栏 -->
        <pc-watch-bottom-menu />
      </div>
    </div>

    <!-- 页脚 -->
    <pc-page-footer />
  </div>
</template>

<script setup lang="ts">
import PcBarrage from '@/components/page-watch-common/barrage/pc-barrage.vue';
import PcPlayerControl from '@/components/page-watch-common/player/player-control/pc-player-control/player-control.vue';
import PcBasicInfo from '@/components/common-business/basic-info/pc-basic-info.vue';
import PcMultiMeeting from '@/components/page-watch-common/multi-meeting/pc-multi-meeting.vue';
import PcPageAdvert from '@/components/page-watch-common/page-advert/pc-page-advert.vue';
import PcDoc from '@/components/page-watch-common/doc/pc-doc.vue';
import PcConnectMicUserItem from '@/components/page-watch-common/connect-mic/pc-connect-mic/pc-connect-mic-user-item.vue';
import PcPlayerMain from '@/components/page-watch-common/player/player-main/pc-player-main/pc-player-main.vue';
import PcWatchAsideMenu from './pc-watch-aside-menu.vue';
import PcWatchBottomMenu from './pc-watch-bottom-menu.vue';
import PcWatchSubPackUp from './pc-watch-sub-pack-up.vue';
import PcDonatePayQrcode from '@/components/page-watch-common/donate/donate-panel/pc-donate-panel/pc-donate-pay-qrcode.vue';
import PcPageFooter from '@/components/common-business/page-footer/pc-page-footer.vue';

import PcCountDownLayer from '@/components/page-watch-common/count-down-layer/pc-count-down-layer.vue';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';

import { MainScreenContent } from '@polyv/live-watch-sdk';

const { iframeMode, isWatchBackUrl } = storeDefinitionToRefs(useWatchAppStore);

const { pcWatchBackgroundImage } = storeDefinitionToRefs(useChannelInfoStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const { mainScreen, subScreenPackUp, isFullscreen } = storeDefinitionToRefs(useLayoutStore);

const { masterMicItem } = storeDefinitionToRefs(useConnectMicStore);
</script>

<style lang="scss">
// 弹幕层
$--layer-zIndex-barrage: 290;
// 控制栏层
$--layer-zIndex-player-control: 300;
// 直播倒计时层
$--layer-zIndex-count-down: 310;

// 左侧占比
$--layout-left-width-percent: 76.2% !default;
// 右侧宽度占比
$--layout-right-width-percent: 100% - $--layout-left-width-percent !default;
// 播放器比例
$--layout-player-percent: 56.25% !default;
// 副屏收起时的高度
$--layout-sub-pack-up-height: 40px !default;

.c-pc-watch-layout {
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
}

.c-pc-watch-layout__main-wrap {
  position: relative;
  padding-top: 0.762 * 0.5625 * 0.08rem;
  padding-bottom: 32px;
}

.c-pc-watch-layout__main {
  position: relative;
  // color: #fff;
}

.c-pc-watch-layout__main__fullscreen-wrap {
  position: absolute;
  top: 0;
  left: 0;
  // z-index: 90;
  width: 100%;
  pointer-events: none;
}
.c-pc-watch-layout__main__fullscreen-wrap__height {
  width: $--layout-left-width-percent;
  &::before {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: $--layout-player-percent;
    content: '';
  }
}

.c-pc-watch-layout__main__player-wrap {
  position: absolute;
  top: 0;
  left: 0;
  // z-index: 200;
  width: $--layout-left-width-percent;
  height: 100%;
  pointer-events: initial;
}
.c-pc-watch-layout__main__player-content,
.c-pc-watch-layout__main__player-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.c-pc-watch-layout__main__player-wrap--right {
  right: 0;
  bottom: initial;
  left: initial;
  z-index: 100;
  width: $--layout-right-width-percent;
  height: initial;

  .c-pc-watch-layout__main__player-content {
    position: relative;
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: $--layout-player-percent;
  }
}

.c-pc-watch-layout__main-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: $--layout-left-width-percent;
  height: 100%;
  pointer-events: none;
}

.c-pc-watch-layout__sub-pack-up-wrap {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 110;
  width: $--layout-right-width-percent;
  height: $--layout-sub-pack-up-height;
}

.c-pc-watch-layout__main__player-barrage {
  top: 32px;
  z-index: $--layer-zIndex-barrage;
  height: 30%;
  pointer-events: none;
}

.c-pc-watch-layout__main__player-control {
  bottom: 0;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
}
.c-pc-watch-layout__main__count-down {
  z-index: $--layer-zIndex-count-down;
}

.c-pc-watch-layout__main__fullscreen-wrap--fullscreened {
  .c-pc-watch-layout__main-layer {
    width: 100%;
  }
  .c-pc-watch-layout__main__player-wrap {
    width: 100%;
  }
  .c-pc-watch-layout__main__player-wrap--right {
    display: none;
  }
}

.c-pc-watch-layout__main__left {
  position: relative;
  width: $--layout-left-width-percent;

  &::before {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: $--layout-player-percent;
    content: '';
    background: #212121;
  }
}

.c-pc-watch-layout__main__basic-wrap {
  padding: 22px 20px;
  background-color: rgba(#000000, 0.4);
}

.c-pc-watch-layout__main__right {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: $--layout-right-width-percent;
  height: 100%;
  pointer-events: none;
}
.c-pc-watch-layout__main__right__top {
  width: 100%;
  &::after {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: $--layout-player-percent;
    content: '';
    background: #212121;
  }
}
.c-pc-watch-layout__main__right__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  pointer-events: initial;
}
.c-pc-watch-layout__main__right__content__inner {
  flex: 1;
}
.c-pc-watch-layout__main__right__donate-pay {
  pointer-events: initial;
}

.c-pc-watch-layout__main--sub-pack-up {
  .c-pc-watch-layout__main__player-wrap--right {
    height: $--layout-sub-pack-up-height;
    overflow: hidden;
  }
  .c-pc-watch-layout__main__right__top::after {
    height: $--layout-sub-pack-up-height;
    padding-bottom: initial;
  }
}

.c-pc-watch-layout__menu-panel-content {
  box-sizing: border-box;
  padding: 0 32px;
  background-color: $--color-white;
}
@media (max-width: 1440px) {
  .c-pc-watch-layout__menu-panel-content {
    padding: 0 24px;
  }
}
</style>
