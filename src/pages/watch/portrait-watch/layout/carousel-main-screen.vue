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
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
            @touchmove="handleTouchMove"
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
              v-if="!isPlaybackWatchUrl && iarSdkLoaded"
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

        <!-- 文档开关 -->
        <portrait-doc-switch
          v-if="canRenderDoc"
          class="c-portrait-carousel-main-screen__top-right__item"
        />
      </div>
    </boundary-wrap>

    <!-- 右部绝对定位的内容 -->
    <boundary-wrap seat="right">
      <!-- 全屏按钮 -->
      <portrait-player-fullscreen-button v-if="portraitPlayerFullscreenBtnVisible" />
    </boundary-wrap>

    <!-- 底部内容 -->
    <div class="c-portrait-carousel-main-screen__bottom">
      <!-- 打赏动画 -->
      <div
        v-show="!portraitPlayerIsPageFullscreen && donateAnimationVisible"
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--pointer-event"
      >
        <portrait-donate-animation />
      </div>

      <!-- 跑道消息 -->
      <div
        v-show="!portraitPlayerIsPageFullscreen"
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--pointer-event"
      >
        <portrait-runway-effect :left="16" />
      </div>

      <!-- 消息区 -->
      <div
        v-show="!portraitPlayerIsPageFullscreen"
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--padding c-portrait-carousel-main-screen__bottom__item--pointer-event"
        @click="onClickPlayerRegion"
      >
        <portrait-ask-tips v-if="portraitMessageTabCurrentName === PortraitChatTabName.Ask" />

        <div
          class="c-portrait-carousel-main-screen__carousel__wrap"
          :class="{
            'c-portrait-carousel-main-screen__carousel__wrap__bubble': productBubbleVisible,
          }"
        >
          <plv-carousel
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
            <plv-carousel-item>
              <portrait-chat-msg-list v-if="chatRoomVisible" />
            </plv-carousel-item>

            <!-- 提问消息区 -->
            <plv-carousel-item v-if="askMenuData.visible && watchPageChatConnected">
              <portrait-ask />
            </plv-carousel-item>
          </plv-carousel>

          <!-- 轮播屏指示器 -->
          <div
            v-if="askMenuData.visible"
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

      <!-- 右侧挂件 -->
      <div class="c-portrait-carousel-main-screen__bottom__pendant">
        <portrait-chat-room-pendant
          v-if="!isPlaybackWatchUrl"
          v-show="!portraitPlayerIsPageFullscreen"
        />
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
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--padding"
        :class="{
          'c-portrait-carousel-main-screen__bottom__item--hide-opacity':
            portraitMessageInputVisible,
        }"
      >
        <div class="c-portrait-carousel-main-screen__input-wrap">
          <!-- 聊天室输入框占位 -->
          <portrait-chat-input-placeholder
            v-if="portraitChatInputVisible"
            class="c-portrait-carousel-main-screen__input-wrap-item"
          />
          <!-- 聊天室关闭提示 -->
          <portrait-chat-close-tips
            v-if="portraitChatCloseTipsVisible"
            class="c-portrait-carousel-main-screen__input-wrap-item"
          />
          <!-- 发起转播频道被踢出提示 -->
          <portrait-chat-error-tips
            v-if="chatExited"
            class="c-portrait-carousel-main-screen__input-wrap-item"
            :content="$lang('chat.transformTip')"
          />

          <!-- 回放+章节入口 -->
          <div
            v-if="playbackListVisible || chapterVisible"
            class="c-portrait-carousel-main-screen__input-wrap-item c-portrait-carousel-main-screen__playback-entrance g-img-cover"
            @click="onClickPlaybackEntrance(true)"
          ></div>
        </div>

        <!-- 底部控制栏右侧内容 -->
        <div class="c-portrait-carousel-main-screen__bottom__right-auto">
          <!-- 商品库入口 -->
          <portrait-product-list-entrance
            v-if="!isPlaybackWatchUrl && iarSdkLoaded"
            class="c-portrait-carousel-main-screen__bottom__button"
          />

          <!-- 打赏入口 -->
          <div
            v-if="showDonateFunction"
            class="c-portrait-carousel-main-screen__bottom__button c-portrait-carousel-main-screen__bottom__button--donate"
            @click="onClickDonateEntrance(true)"
          ></div>

          <!-- 菜单入口 -->
          <portrait-menu-entrance class="c-portrait-carousel-main-screen__bottom__button" />
          <!-- 点赞 -->
          <portrait-chat-like
            v-if="likeFeatureEnabled && !isPlaybacking"
            class="c-portrait-carousel-main-screen__bottom__button"
          />
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

    <!-- 打赏 svga 特效 -->
    <div
      v-show="!portraitPlayerIsPageFullscreen && donateAnimationVisible"
      class="c-portrait-carousel-main-screen__svga-donate"
    >
      <portrait-donate-svga-animation />
    </div>

    <!-- 课堂激励点赞特效 -->
    <div
      v-show="!portraitPlayerIsPageFullscreen && donateAnimationVisible"
      class="c-portrait-carousel-main-screen__motivation-like-animation"
    >
      <motivation-like-animation />
    </div>

    <!-- 报名观看（参与互动时机） -->
    <div
      v-if="needEnrollByChat"
      class="c-portrait-carousel-main-screen__enroll-wrap"
    >
      <portrait-enroll />
    </div>

    <!-- 评论上墙 -->
    <speak-top-business
      class="c-portrait-carousel-main-screen__speak-top"
      layout="portrait"
    ></speak-top-business>

    <!-- 其他直播预约 -->
    <common-other-live-booking class="c-portrait-carousel-main-screen__other-live-booking" />
  </div>
</template>

<script setup lang="ts">
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { computed, defineAsyncComponent } from 'vue';

import MobileFeedLayoutBackBtn from '@/components/page-feed-common/feed-layout-back-btn/mobile-feed-layout-back-btn.vue';
import PortraitStatusTag from '@/components/common-business/status-tag/portrait-status-tag.vue';
import PortraitEnroll from '@/components/common-business/enroll/mobile-enroll.vue';
import MobilePageFooter from '@/components/common-business/page-footer/mobile-page-footer.vue';
import PortraitAskTips from '@/components/page-watch-common/ask/portrait-ask/portrait-ask-tips.vue';
import PortraitChatCloseTips from '@/components/page-watch-common/chat/chat-close-tips/portrait-chat-close-tips.vue';
import PortraitChatErrorTips from '@/components/page-watch-common/chat/chat-error-tips/portrait-chat-error-tips.vue';
import PortraitChatMsgList from '@/components/page-watch-common/chat/chat-msg-list/portrait-chat-msg-list.vue';
import PortraitChatRoomPendant from '@/components/page-watch-common/chat/chat-room-pendant/portrait-chat-room-pendant.vue';
import PortraitCountDownLayer from '@/components/page-watch-common/count-down-layer/portrait-count-down-layer.vue';
import PortraitDocSwitch from '@/components/page-watch-common/doc/doc-switch/portrait-doc-switch.vue';
import PortraitDonateAnimation from '@/components/page-watch-common/donate/donate-animation/donate-animation.vue';
import PortraitDonateSvgaAnimation from '@/components/page-watch-common/donate/donate-svga-animation/donate-svga-animation.vue';
import PortraitAnnouncementEntrance from '@/components/page-watch-common/interactive-receive/announcement/portrait-announcement-entrance.vue';
import PortraitInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/portrait-interactive-entrance.vue';
import PortraitProductListEntrance from '@/components/page-watch-common/interactive-receive/product/portrait-product-list-entrance.vue';
import PortraitInviteRankEntrance from '@/components/page-watch-common/invite/portrait-invite-rank/portrait-invite-rank-entrance.vue';
import PortraitPlayerProgress from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-progress.vue';
import PortraitPlayerFullscreenButton from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-fullscreen-button.vue';
import PortraitChatLike from '@/components/page-watch-common/chat/chat-like/portrait-chat-like.vue';
import PortraitChannelInfoCapsule from '@/pages/watch/portrait-watch/components/channel-info/portrait-channel-info-capsule.vue';
import PortraitChatInputPlaceholder from '@/pages/watch/portrait-watch/components/chat/chat-input-placeholder/portrait-chat-input-placeholder.vue';
import PortraitMenuEntrance from '@/pages/watch/portrait-watch/components/menu/portrait-menu-entrance.vue';
import MotivationLikeAnimation from '@/components/page-watch-common/motivation/motivation-like-animation/motivation-like-animation.vue';
import SpeakTopBusiness from '@/components/page-watch-common/chat/chat-speak-top/speak-top-business.vue';
import PortraitOnlineUserCapsule from '@/pages/watch/portrait-watch/components/channel-info/portrait-online-user-capsule.vue';
import CommonOtherLiveBooking from '@/components/common-business/live-booking/common-other-live-booking/common-other-live-booking.vue';
import PortraitRunwayEffect from '@/components/page-watch-common/message-effect/runway-effect.vue';
import PortraitMultiMeetingEntrance from '@/components/page-watch-common/multi-meeting/portrait-multi-meeting/portrait-multi-meeting-entrance.vue';

import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/mobile-import';
import BoundaryWrap from './boundary-wrap.vue';

import { appEvents, useEventBusEmitter } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChatStore } from '@/store/use-chat-store';
import { useDocStore } from '@/store/use-doc-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';

import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useMessageCarousel } from './hooks/use-message-carousel';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';

const PortraitAsk = defineAsyncComponent(() => {
  return import(
    /* webpackChunkName: "portrait-ask" */ '@/components/page-watch-common/ask/portrait-ask/portrait-ask.vue'
  );
});

const { isPlaybackWatchUrl, watchPageChatConnected } = storeDefinitionToRefs(useWatchAppStore);

const { inviteRankEnabled } = storeDefinitionToRefs(useInviteStore);

const { askMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { announcementFunctionVisible, hasBulletin, productBubbleVisible } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { showDonateFunction, donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);

const {
  chatInputControllerEnable,
  chatRoomVisible,
  chatExited,
  likeFeatureEnabled,
  chatOnlineNumberEnable,
} = storeDefinitionToRefs(useChatStore);

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
} = storeDefinitionToRefs(usePortraitLayoutStore);

/**
 * 竖屏聊天输入框是否可见
 */
const portraitChatInputVisible = computed(() => {
  if (
    askMenuData.value.visible &&
    portraitMessageTabCurrentName.value === PortraitChatTabName.Ask
  ) {
    return true;
  }

  if (chatMsgReplayEnabled.value) return false;
  if (!chatInputControllerEnable.value) return false;

  return chatRoomVisible.value;
});

const portraitChatCloseTipsVisible = computed(() => {
  if (
    askMenuData.value.visible &&
    portraitMessageTabCurrentName.value === PortraitChatTabName.Ask
  ) {
    return false;
  }

  return !chatRoomVisible.value && !chatExited.value;
});

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { emitEvent: onClickDonateEntrance } = useEventBusEmitter(appEvents.donate.OpenDonatePopup);

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

const handleTouchStart = (event: TouchEvent) => {
  event.stopPropagation();
};

const handleTouchMove = (event: TouchEvent) => {
  event.stopPropagation();
};

const handleTouchEnd = (event: TouchEvent) => {
  event.stopPropagation();
};
</script>

<style lang="scss">
$--portrait-carousel-main-screen__bottom-marginTop: 12px !default;

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
}

.c-portrait-carousel-main-screen__bottom__item {
  position: relative;
  display: flex;
  margin-top: $--portrait-carousel-main-screen__bottom-marginTop;
  pointer-events: initial;
}
.c-portrait-carousel-main-screen__bottom__item--padding {
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
  pointer-events: initial;
}

.c-portrait-carousel-main-screen__bottom__right-auto {
  display: flex;
  align-items: center;
}

.c-portrait-carousel-main-screen__input-wrap {
  display: flex;
  flex: 1;
  align-items: center;
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

// prettier-ignore
.c-portrait-carousel-main-screen__input-wrap-item + .c-portrait-carousel-main-screen__input-wrap-item {
  margin-left: 16px;
}

.c-portrait-carousel-main-screen__playback-entrance {
  width: 32px;
  height: 32px;
  background-image: url(./images/icon-playback.png);
}

.c-portrait-carousel-main-screen__bottom__button {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  margin-left: 16px;
  background-size: 100% 100%;
}

.c-portrait-carousel-main-screen__bottom__button--donate {
  background-image: url(./images/icon-donate.png);
}
.c-portrait-carousel-main-screen__svga-donate {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
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
    padding-right: 118px;
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

.c-portrait-carousel-main-screen__speak-top {
  z-index: 2300;
}

.c-portrait-carousel-main-screen__other-live-booking {
  position: absolute;
  top: 105px;
  left: 20px;
  z-index: 2200;
}
</style>
