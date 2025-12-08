<!-- @file 轮播屏：主屏 -->
<template>
  <div class="c-portrait-carousel-main-screen">
    <!-- 左上角定位内容 -->
    <boundary-wrap>
      <div class="c-portrait-carousel-main-screen__top-left">
        <div
          v-if="channelInfoSeat === 1"
          class="c-portrait-carousel-main-screen__top-left__item"
        >
          <mobile-feed-layout-back-btn
            v-if="isBuildForFeedMainMode()"
            class="c-portrait-carousel-main-screen__top-left__item__children"
          />
          <!-- 频道信息 -->
          <portrait-channel-info-capsule />
        </div>

        <div
          class="c-portrait-carousel-main-screen__top-left__item c-portrait-carousel-main-screen__top-left__item--scroll"
          v-show="!portraitPlayerIsPageFullscreen"
        >
          <div
            class="c-portrait-carousel-main-screen__top-left__item__container"
            @touchstart.stop
            @touchend.stop
            @touchmove.stop
          >
            <!-- 直播状态标签 -->
            <portrait-status-tag
              class="c-portrait-carousel-main-screen__top-left__item__children"
            />

            <!-- 竖屏分会场 -->
            <portrait-multi-meeting-entrance
              v-if="multiMeetingEnabled"
              class="c-portrait-carousel-main-screen__top-left__item__children"
            />

            <!-- 邀请榜入口 -->
            <portrait-invite-rank-entrance
              v-if="inviteRankEnabled"
              class="c-portrait-carousel-main-screen__top-left__item__children"
            />
            <!-- 互动二次入口 -->
            <portrait-interactive-entrance
              v-if="iarSdkLoaded"
              class="c-portrait-carousel-main-screen__top-left__item__children"
            />
          </div>
        </div>

        <div class="c-portrait-carousel-main-screen__top-left__item">
          <!-- 倒计时 + 预约 -->
          <portrait-count-down-layer />
        </div>
      </div>
    </boundary-wrap>

    <boundary-wrap v-if="isChatUIV2">
      <chat-loader-helper>
        <div
          class="c-portrait-carousel-main-screen__toping-msg"
          @touchstart.stop
        >
          <toping-msg class="c-portrait-carousel-main-screen__toping-msg__content" />
        </div>
      </chat-loader-helper>
    </boundary-wrap>

    <!-- 右上角定位的内容 -->
    <boundary-wrap seat="right">
      <div class="c-portrait-carousel-main-screen__top-right">
        <!-- 在线列表入口 -->
        <portrait-online-user-capsule
          v-if="portraitOnlineListEntranceVisible || chatOnlineNumberEnable"
          class="c-portrait-carousel-main-screen__top-right__item"
        />
        <!-- 置顶公告 -->
        <portrait-announcement-entrance
          v-if="announcementFunctionVisible && iarSdkLoaded"
          v-show="!portraitPlayerIsPageFullscreen && hasBulletin"
          class="c-portrait-carousel-main-screen__top-right__item"
        />

        <!-- 文档位置切换 -->
        <portrait-doc-side-switch
          v-if="portraitDocSideSwitchVisible && !isBuildForFeedMainMode()"
          class="c-portrait-carousel-main-screen__top-right__item"
        />

        <!-- 文档开关 -->
        <portrait-doc-switch
          v-if="canRenderDoc"
          class="c-portrait-carousel-main-screen__top-right__item"
        />

        <!-- 直播广场 -->
        <live-square class="c-portrait-carousel-main-screen__top-right__item" />
      </div>
    </boundary-wrap>

    <!-- 右部绝对定位的内容 -->
    <boundary-wrap seat="right">
      <!-- 全屏按钮 -->
      <portrait-player-fullscreen-button v-if="portraitPlayerFullscreenBtnVisible" />
    </boundary-wrap>

    <!-- 顶部绝对定位的内容 -->
    <boundary-wrap seat="top">
      <div class="c-portrait-carousel-main-screen__top-center">
        <!-- 聊天室连接异常提示 -->
        <mobile-chat-connect-error-tips />
        <!-- 播放监测提示，切换最优线路或清晰度 -->
        <portrait-player-loading-detection />
      </div>
    </boundary-wrap>

    <!-- 底部内容 -->
    <div class="c-portrait-carousel-main-screen__bottom">
      <!-- 打赏动画 -->
      <div
        v-show="!portraitPlayerIsPageFullscreen"
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--pointer-event"
      >
        <chat-loader-helper>
          <portrait-donate-animation />
        </chat-loader-helper>
      </div>

      <!-- 跑道消息 -->
      <div
        v-show="!portraitPlayerIsPageFullscreen"
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--pointer-event"
      >
        <chat-loader-helper>
          <portrait-runway-effect :left="16" />
        </chat-loader-helper>
      </div>

      <!-- 消息区（V1） -->
      <div
        v-if="!isChatUIV2"
        v-show="!portraitPlayerIsPageFullscreen"
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--padding c-portrait-carousel-main-screen__bottom__item--pointer-event"
        @click="onClickPlayerRegion"
      >
        <portrait-ask-tips
          v-if="portraitMessageTabCurrentName === PortraitChatTabName.Ask && watchPageChatConnected"
        />

        <div
          class="c-portrait-carousel-main-screen__carousel__wrap"
          :class="{
            'c-portrait-carousel-main-screen__carousel__wrap__bubble': productBubbleVisible,
          }"
        >
          <plv-carousel
            v-if="chatMenuData.visible || (askMenuData.visible && watchPageChatConnected)"
            ref="carouselRef"
            class="c-portrait-carousel-main-screen__carousel"
            :style="{
              height: `${carouselHeight}px`,
            }"
            :slide-index.sync="messageCarouselActiveIndex"
            @slide-prev-end="onMessageCarouselSlidePrevEnd"
            @slide-next-end="onMessageCarouselSlideNextEnd"
          >
            <!-- 聊天消息区 -->
            <plv-carousel-item v-if="chatMenuData.visible">
              <portrait-chat-msg-list />
            </plv-carousel-item>

            <!-- 提问消息区 -->
            <plv-carousel-item v-if="askMenuData.visible && watchPageChatConnected">
              <portrait-ask />
            </plv-carousel-item>
          </plv-carousel>

          <!-- 轮播屏指示器 -->
          <div
            v-if="askMenuData.visible && chatMenuData.visible"
            class="c-portrait-carousel-main-screen__indicator"
          >
            <div
              v-for="index in 2"
              :key="index"
              class="c-portrait-carousel-main-screen__indicator__item"
              :class="{
                'c-portrait-carousel-main-screen__indicator__item--active':
                  index - 1 === messageCarouselActiveIndex,
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 消息区（V2） -->
      <chat-loader-helper v-else-if="isChatUIV2">
        <portrait-swiper-message />
      </chat-loader-helper>

      <!-- 右侧挂件 -->
      <div class="c-portrait-carousel-main-screen__bottom__pendant">
        <portrait-chat-room-pendant v-show="!portraitPlayerIsPageFullscreen" />
      </div>

      <!-- 回放控制栏 -->
      <div
        v-if="isPlaybacking"
        class="c-portrait-carousel-main-screen__bottom__progress c-portrait-carousel-main-screen__bottom__item--padding"
      >
        <portrait-player-progress />
      </div>

      <!-- 底部控制栏 -->
      <div
        v-show="!portraitPlayerIsPageFullscreen"
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--padding c-portrait-carousel-main-screen__bottom__item--message-area"
        :class="{
          'c-portrait-carousel-main-screen__bottom__item--hide-opacity':
            portraitMessageInputVisible,
        }"
      >
        <div class="c-portrait-carousel-main-screen__input-wrap">
          <!-- 聊天室输入框占位 -->
          <template v-if="portraitChatInputVisible">
            <portrait-chat-input-placeholder v-if="!isChatUIV2" />
            <chat-loader-helper v-else>
              <portrait-swiper-message-control />
            </chat-loader-helper>
          </template>

          <!-- 回放+章节入口 -->
          <div
            v-if="playbackListVisible || chapterVisible"
            class="c-portrait-carousel-main-screen__playback-entrance g-img-cover"
            @click="onClickPlaybackEntrance(true)"
          ></div>
        </div>

        <!-- 底部控制栏右侧内容 -->
        <div class="c-portrait-carousel-main-screen__bottom__right-auto">
          <!-- 商品库入口 -->
          <mobile-product-pendant
            v-if="!isPlaybackWatchUrl && iarSdkLoaded && interactSetting.productEnabled"
            class="c-portrait-carousel-main-screen__bottom__button"
          />

          <!-- 打赏入口 -->
          <mobile-donate-entrance />

          <!-- 菜单入口 -->
          <mobile-more-entrance v-if="!isPlaybackWatchUrl" />

          <!-- 点赞 -->
          <chat-loader-helper v-if="!isPlaybackWatchUrl && likeFeatureEnabled && !isPlaybacking">
            <portrait-chat-like class="c-portrait-carousel-main-screen__bottom__button" />
          </chat-loader-helper>
        </div>
      </div>

      <!-- 底部页脚 -->
      <div
        v-show="!portraitPlayerIsPageFullscreen && !portraitMessageInputVisible"
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--padding c-portrait-carousel-main-screen__bottom__page-footer-wrap"
      >
        <mobile-page-footer
          class="c-portrait-carousel-main-screen__bottom__page-footer g-singleline"
        />
      </div>
    </div>

    <!-- 特效动画 -->
    <div
      v-show="!portraitPlayerIsPageFullscreen"
      class="c-portrait-carousel-main-screen__special-effect"
    >
      <chat-loader-helper>
        <portrait-special-effect-animation />
      </chat-loader-helper>
    </div>

    <!-- 课堂激励点赞特效 -->
    <div
      v-show="!portraitPlayerIsPageFullscreen && donateAnimationVisible"
      class="c-portrait-carousel-main-screen__motivation-like-animation"
    >
      <motivation-like-animation />
    </div>

    <!-- 报名观看以及游客登录（参与互动时机） -->
    <div
      v-if="needEnrollByChat"
      class="c-portrait-carousel-main-screen__enroll-wrap"
    >
      <portrait-enroll />
    </div>

    <!-- 其他直播预约 -->
    <common-other-live-booking class="c-portrait-carousel-main-screen__other-live-booking" />
  </div>
</template>

<script setup lang="ts">
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { computed } from 'vue';

import PortraitEnroll from '@/components/common-business/enroll/mobile-enroll.vue';
import CommonOtherLiveBooking from '@/components/common-business/live-booking/common-other-live-booking/common-other-live-booking.vue';
import MobilePageFooter from '@/components/common-business/page-footer/mobile-page-footer.vue';
import PortraitStatusTag from '@/components/common-business/status-tag/portrait-status-tag.vue';
import MobileFeedLayoutBackBtn from '@/components/page-feed-common/feed-layout-back-btn/mobile-feed-layout-back-btn.vue';
import PortraitAskTips from '@/components/page-watch-common/ask/portrait-ask/portrait-ask-tips.vue';
import PortraitAsk from '@/components/page-watch-common/ask/portrait-ask/portrait-ask.vue';
import MobileChatConnectErrorTips from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-tips/mobile-chat-connect-error-tips.vue';
import PortraitChatMsgList from '@/components/page-watch-common/chat/chat-msg-list/portrait-chat-msg-list.vue';
import PortraitChatRoomPendant from '@/components/page-watch-common/chat/chat-room-pendant/portrait-chat-room-pendant.vue';
import PortraitCountDownLayer from '@/components/page-watch-common/count-down-layer/portrait-count-down-layer.vue';
import PortraitDocSideSwitch from '@/components/page-watch-common/doc/doc-side-switch/portrait-doc-side-switch.vue';
import PortraitDocSwitch from '@/components/page-watch-common/doc/doc-switch/portrait-doc-switch.vue';
import PortraitDonateAnimation from '@/components/page-watch-common/donate/donate-animation/index.vue';
import MobileDonateEntrance from '@/components/page-watch-common/donate/donate-entrance/mobile-donate-entrance.vue';
import PortraitAnnouncementEntrance from '@/components/page-watch-common/interactive-receive/announcement/portrait-announcement-entrance.vue';
import PortraitInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/portrait-interactive-entrance.vue';
import PortraitInviteRankEntrance from '@/components/page-watch-common/invite/portrait-invite-rank/portrait-invite-rank-entrance.vue';
import LiveSquare from '@/components/page-watch-common/live-square/live-square.vue';
import MobileMoreEntrance from '@/components/page-watch-common/more-popup/mobile-more-entrance/mobile-more-entrance.vue';
import MotivationLikeAnimation from '@/components/page-watch-common/motivation/motivation-like-animation/motivation-like-animation.vue';
import PortraitMultiMeetingEntrance from '@/components/page-watch-common/multi-meeting/portrait-multi-meeting/portrait-multi-meeting-entrance.vue';
import PortraitPlayerFullscreenButton from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-fullscreen-button.vue';
import PortraitPlayerProgress from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-progress.vue';
import PortraitPlayerLoadingDetection from '@/components/page-watch-common/player/player-loading-detection/portrait-player-detection.vue';
import MobileProductPendant from '@/components/page-watch-common/product/product-pendant/mobile-product-pendant.vue';
import PortraitChannelInfoCapsule from '@/pages/watch/portrait-watch/components/channel-info/portrait-channel-info-capsule.vue';
import PortraitOnlineUserCapsule from '@/pages/watch/portrait-watch/components/channel-info/portrait-online-user-capsule.vue';
import PortraitChatInputPlaceholder from '@/pages/watch/portrait-watch/components/chat/chat-input-placeholder/portrait-chat-input-placeholder.vue';

import PortraitChatLike from '@/components/page-watch-common/chat-v2/chat-like/index.vue';
import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import PortraitRunwayEffect from '@/components/page-watch-common/chat-v2/chat-runway-effect/index.vue';
import PortraitSpecialEffectAnimation from '@/components/page-watch-common/chat-v2/special-effect-animation/index.vue';
import TopingMsg from '@/components/page-watch-common/chat-v2/toping-msg/index.vue';
import PortraitSwiperMessage from '../components/swiper-message/swiper-message.vue';
import PortraitSwiperMessageControl from '../components/swiper-message/swiper-message-control.vue';

import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/mobile-import';
import BoundaryWrap from './boundary-wrap.vue';

import { appEvents, useEventBusEmitter } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useDocStore } from '@/store/use-doc-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { useMessageCarousel } from './hooks/use-message-carousel';

const { isPlaybackWatchUrl, watchPageChatConnected } = storeDefinitionToRefs(useWatchAppStore);

const { inviteRankEnabled } = storeDefinitionToRefs(useInviteStore);

const { askMenuData, chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { announcementFunctionVisible, hasBulletin, productBubbleVisible, interactSetting } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);

const { chatInputControllerEnable, likeFeatureEnabled, chatOnlineNumberEnable, isChatUIV2 } =
  storeDefinitionToRefs(useChatStore);

const { isPlaybacking, playbackListVisible, chapterVisible, chatMsgReplayEnabled } =
  storeDefinitionToRefs(usePlaybackStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const {
  channelInfoSeat,
  portraitMessageTabCurrentName,
  portraitPlayerFullscreenBtnVisible,
  portraitPlayerIsPageFullscreen,
  portraitMessageInputVisible,
  portraitOnlineListEntranceVisible,
  portraitDocSideSwitchVisible,
} = storeDefinitionToRefs(usePortraitLayoutStore);

/**
 * 竖屏聊天输入框是否可见
 */
const portraitChatInputVisible = computed(() => {
  if (chatMsgReplayEnabled.value) return false;
  if (!chatInputControllerEnable.value) return false;

  return true;
});

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { emitEvent: onClickPlaybackEntrance } = useEventBusEmitter(
  appEvents.portrait.OpenPlaybackChapter,
);

const {
  carouselRef,
  carouselHeight,
  messageCarouselActiveIndex,

  onMessageCarouselSlidePrevEnd,
  onMessageCarouselSlideNextEnd,
} = useMessageCarousel();

const { emitEvent: onClickPlayerRegion } = useEventBusEmitter(appEvents.portrait.ClickPlayerRegion);

const { multiMeetingEnabled } = storeDefinitionToRefs(useMultiMeetingStore);
</script>

<style lang="scss">
$--portrait-carousel-main-screen__bottom-marginTop: 12px !default;

.c-portrait-carousel-main-screen__top-center {
  position: absolute;
  top: 88px;
  left: 50%;
  z-index: $--zIndex-dialog-base;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: calc(var(--plv-watch-full-screen-vw) - 32px);
  transform: translateX(-50%);
}

.c-portrait-carousel-main-screen__top-left__item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px;

  &:empty {
    display: none;
  }
}
.c-portrait-carousel-main-screen__top-left__item--scroll {
  width: calc(var(--plv-watch-full-screen-vw) - 16px);
}
.c-portrait-carousel-main-screen__top-left__item__container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: calc(var(--plv-watch-full-screen-vw) - 36px);
  margin-right: 10px;
  overflow-x: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
}
.c-portrait-carousel-main-screen__top-left__item__children {
  margin-right: 10px;
}

.c-portrait-carousel-main-screen__top-right {
  display: flex;
  align-items: center;
}
.c-portrait-carousel-main-screen__top-right__item {
  & + & {
    margin-left: 12px;
  }
}

.c-portrait-carousel-main-screen__bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  padding-bottom: 16px;
  pointer-events: none;
  @include iphone-x-pb(16px);

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
  }
}

.c-portrait-carousel-main-screen__bottom__item {
  position: relative;
  display: flex;
  max-width: 100%;
  margin-top: $--portrait-carousel-main-screen__bottom-marginTop;
  pointer-events: initial;
  &:empty {
    display: none;
  }
}
.c-portrait-carousel-main-screen__bottom__item--padding {
  box-sizing: border-box;
  padding: 0 16px;
}
.c-portrait-carousel-main-screen__bottom__item--pointer-event {
  pointer-events: none;
}
.c-portrait-carousel-main-screen__bottom__item--hide-opacity {
  opacity: 0;
}

.c-portrait-carousel-main-screen__bottom__progress {
  margin-top: $--portrait-carousel-main-screen__bottom-marginTop;
  pointer-events: initial;
}

.c-portrait-carousel-main-screen__bottom__pendant {
  position: relative;
  z-index: 10;
  pointer-events: initial;
}

.c-portrait-carousel-main-screen__bottom__right-auto {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.c-portrait-carousel-main-screen__input-wrap {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  overflow-x: hidden;
}
.c-portrait-carousel-main-screen__bottom__item--message-area {
  gap: 12px;
}

.c-portrait-carousel-main-screen__bottom__page-footer-wrap {
  display: flex;
  justify-content: center;
  margin-top: 0;
}

.c-portrait-carousel-main-screen__bottom__page-footer {
  padding-bottom: 0;
  margin-top: $--portrait-carousel-main-screen__bottom-marginTop;
}

.c-portrait-carousel-main-screen__playback-entrance {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background-image: url(./images/icon-playback.png);
}

.c-portrait-carousel-main-screen__bottom__button {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  // margin-left: 12px;
  background-size: 100% 100%;
}

.c-portrait-carousel-main-screen__bottom__button--donate {
  background-image: url(./images/icon-donate.png);
}
.c-portrait-carousel-main-screen__special-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  pointer-events: none;
}

.c-portrait-carousel-main-screen__motivation-like-animation {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.c-portrait-carousel-main-screen__enroll-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 300px;
}

.c-portrait-carousel-main-screen__carousel__wrap {
  box-sizing: border-box;
  width: 100%;
  padding-right: 54px;

  &.c-portrait-carousel-main-screen__carousel__wrap__bubble {
    padding-right: 120px;
  }
}

.c-portrait-carousel-main-screen__carousel {
  width: 100%;
  height: 208px;
  pointer-events: initial;
}

.c-portrait-carousel-main-screen__indicator {
  display: flex;
  margin-top: 8px;
}
.c-portrait-carousel-main-screen__indicator__item {
  width: 38px;
  height: 3px;
  overflow: hidden;
  background-color: rgba(#ffffff, 0.5);
  border-radius: 10px;
  &:last-child {
    margin-left: 4px;
  }

  &.c-portrait-carousel-main-screen__indicator__item--active {
    background-color: #fff;
  }
}

.c-portrait-carousel-main-screen__other-live-booking {
  position: absolute;
  top: 105px;
  left: 20px;
  z-index: 2200;
}

.c-portrait-carousel-main-screen__top-left__item__right {
  margin-left: auto;
}

.c-portrait-carousel-main-screen__toping-msg {
  position: absolute;
  top: 75px;
  left: 0;
  width: 100vw;
}
.c-portrait-carousel-main-screen__toping-msg__content {
  position: absolute;
  left: 50%;
  width: 335px;
  transform: translateX(-50%);
}
</style>
