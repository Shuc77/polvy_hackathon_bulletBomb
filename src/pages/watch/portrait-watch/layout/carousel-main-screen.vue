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
          <!-- 频道信息 -->
          <portrait-channel-info-capsule />
        </div>

        <div class="c-portrait-carousel-main-screen__top-left__item">
          <!-- 邀请榜入口 -->
          <portrait-invite-rank-entrance
            v-if="inviteRankEnabled"
            class="c-portrait-carousel-main-screen__top-left__item__children"
          />
          <!-- 互动二次入口 -->
          <portrait-interactive-entrance
            class="c-portrait-carousel-main-screen__top-left__item__children"
          />
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
        <!-- 置顶公告 -->
        <portrait-announcement-entrance
          v-if="announcementFunctionVisible"
          class="c-portrait-carousel-main-screen__top-right__item"
        />

        <!-- 文档开关 -->
        <portrait-doc-switch
          v-if="canRenderDoc"
          class="c-portrait-carousel-main-screen__top-right__item"
        />
      </div>
    </boundary-wrap>

    <!-- 底部内容 -->
    <div class="c-portrait-carousel-main-screen__bottom">
      <!-- 打赏动画 -->
      <div
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--pointer-event"
      >
        <portrait-donate-animation :track-count="2" />
      </div>

      <!-- 欢迎语 -->
      <div
        v-if="welcomeEnabled"
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--pointer-event"
      >
        <portrait-chat-welcome-tips />
      </div>

      <!-- 聊天室消息区 -->
      <div
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--padding c-portrait-carousel-main-screen__bottom__item--pointer-event"
      >
        <portrait-chat-msg-list />
      </div>

      <!-- 右侧挂件 -->
      <div class="c-portrait-carousel-main-screen__bottom__pendant">
        <portrait-chat-room-pendant />
      </div>

      <!-- 回放控制栏 -->
      <div
        v-if="isPlaybacking"
        class="c-portrait-carousel-main-screen__bottom__progress c-portrait-carousel-main-screen__bottom__item--padding"
      >
        <portrait-player-progress />
      </div>

      <!-- 底部栏 -->
      <div
        class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--padding"
      >
        <div class="c-portrait-carousel-main-screen__input-wrap">
          <!-- 聊天室输入框占位 -->
          <portrait-chat-input-placeholder v-if="!isWatchBackUrl" />

          <!-- 回放+章节入口 -->
          <div
            v-if="playbackListVisible || chapterEnabled"
            class="c-portrait-carousel-main-screen__playback-entrance g-img-cover"
            @click="onClickPlaybackEntrance(true)"
          ></div>
        </div>

        <!-- 底部右侧内容 -->
        <div class="c-portrait-carousel-main-screen__bottom__right-auto">
          <!-- 商品库入口 -->
          <portrait-product-list-entrance
            v-if="productEnabled"
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
        </div>
      </div>
    </div>

    <!-- 打赏 svga 特效 -->
    <div class="c-portrait-carousel-main-screen__svga-donate">
      <portrait-donate-svga-animation />
    </div>

    <!-- 报名观看（参与互动时机） -->
    <div
      v-if="needEnrollByChat"
      class="c-portrait-carousel-main-screen__enroll-wrap"
    >
      <portrait-enroll />
    </div>
  </div>
</template>

<script setup lang="ts">
import BoundaryWrap from './boundary-wrap.vue';
import PortraitAnnouncementEntrance from '@/components/page-watch-common/interactive-receive/announcement/portrait-announcement-entrance.vue';
import PortraitChannelInfoCapsule from '@/pages/watch/portrait-watch/components/channel-info/portrait-channel-info-capsule.vue';
import PortraitInviteRankEntrance from '@/components/page-watch-common/invite/portrait-invite-rank/portrait-invite-rank-entrance.vue';
import PortraitInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/portrait-interactive-entrance.vue';
import PortraitCountDownLayer from '@/components/page-watch-common/count-down-layer/portrait-count-down-layer.vue';
import PortraitProductListEntrance from '@/components/page-watch-common/interactive-receive/product/portrait-product-list-entrance.vue';
import PortraitDonateSvgaAnimation from '@/components/page-watch-common/donate/donate-svga-animation/donate-svga-animation.vue';
import PortraitDonateAnimation from '@/components/page-watch-common/donate/donate-animation/donate-animation.vue';
import PortraitMenuEntrance from '@/pages/watch/portrait-watch/components/menu/portrait-menu-entrance.vue';
import PortraitChatRoomPendant from '@/components/page-watch-common/chat/chat-room-pendant/portrait-chat-room-pendant.vue';
import PortraitChatWelcomeTips from '@/components/page-watch-common/chat/chat-welcome/portrait-chat-welcome-tips.vue';
import PortraitChatMsgList from '@/components/page-watch-common/chat/chat-msg-list/portrait-chat-msg-list.vue';
import PortraitChatInputPlaceholder from '@/pages/watch/portrait-watch/components/chat/chat-input-placeholder/portrait-chat-input-placeholder.vue';
import PortraitDocSwitch from '@/components/page-watch-common/doc/doc-switch/portrait-doc-switch.vue';
import PortraitPlayerProgress from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-progress.vue';
import PortraitEnroll from '@/components/common-business/enroll/mobile-enroll.vue';

import { useInviteStore } from '@/store/use-invite-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { appEvents, useEventBusEmitter } from '@/app/app-events';
import { useDonateStore } from '@/store/use-donate-store';
import { useChatStore } from '@/store/use-chat-store';
import { useDocStore } from '@/store/use-doc-store';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { isWatchBackUrl } = storeDefinitionToRefs(useWatchAppStore);

const { inviteRankEnabled } = storeDefinitionToRefs(useInviteStore);

const { announcementFunctionVisible, productEnabled } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { welcomeEnabled } = storeDefinitionToRefs(useChatStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const { channelInfoSeat } = storeDefinitionToRefs(usePortraitLayoutStore);

const { isPlaybacking, playbackListVisible, chapterEnabled } =
  storeDefinitionToRefs(usePlaybackStore);

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { emitEvent: onClickDonateEntrance } = useEventBusEmitter(appEvents.donate.OpenDonatePopup);

const { emitEvent: onClickPlaybackEntrance } = useEventBusEmitter(
  appEvents.portrait.OpenPlaybackChapter,
);
</script>

<style lang="scss">
.c-portrait-carousel-main-screen__top-left {
  position: absolute;
  top: 15px;
  left: 15px;
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
.c-portrait-carousel-main-screen__top-left__item__children {
  margin-right: 10px;
}

.c-portrait-carousel-main-screen__top-right {
  position: absolute;
  top: 16px;
  right: 16px;
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
  margin-top: 12px;
  pointer-events: initial;
}
.c-portrait-carousel-main-screen__bottom__item--padding {
  padding: 0 16px;
}
.c-portrait-carousel-main-screen__bottom__item--pointer-event {
  pointer-events: none;
}

.c-portrait-carousel-main-screen__bottom__progress {
  margin-top: 12px;
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
  overflow: hidden;
}

.c-portrait-carousel-main-screen__playback-entrance {
  width: 32px;
  height: 32px;
  margin-left: 16px;
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

.c-portrait-carousel-main-screen__enroll-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 300px;
}
</style>
