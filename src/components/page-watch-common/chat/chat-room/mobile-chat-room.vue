<!-- @file 移动端聊天室 -->
<template>
  <div
    class="c-mobile-chat-room"
    :style="{
      backgroundImage: mobileChatRoomBgUrl ? `url(${mobileChatRoomBgUrl})` : '',
    }"
  >
    <!-- 聊天室顶部固定区域 -->
    <div
      class="c-mobile-chat-room__topic pws-main-tab-body"
      :style="{
        backgroundImage: mobileChatRoomBgUrl ? `url(${mobileChatRoomBgUrl})` : '',
      }"
    >
      <!-- 置顶公告 -->
      <mobile-announcement-top
        v-if="announcementFunctionVisible && iarSdkLoaded"
        class="c-mobile-chat-room__topic__item c-mobile-chat-room__topic__announcement"
      />

      <!-- 跑道消息 -->
      <mobile-runway-effect class="c-mobile-chat-room__topic__item" />

      <!-- 打赏动画 -->
      <mobile-donate-animation
        v-if="donateAnimationVisible"
        class="c-mobile-chat-room__topic__item"
      />
    </div>

    <!-- 聊天消息列表区域 -->
    <div class="c-mobile-chat-room__msg-list">
      <!-- 消息列表 -->
      <mobile-chat-msg-list />

      <!-- 右下角挂件 -->
      <mobile-chat-room-pendant v-if="!isPlaybackWatchUrl" />

      <!-- 打赏 svga 特效 -->
      <mobile-donate-svga-animation v-if="donateAnimationVisible" />
    </div>

    <!-- 互动二次入口 -->
    <mobile-interactive-entrance v-if="!isPlaybackWatchUrl && iarSdkLoaded" />

    <!-- 底部输入框 -->
    <mobile-chat-input-controller v-if="chatInputControllerEnable" />

    <!-- 报名观看（参与互动时机） -->
    <mobile-enroll v-if="needEnrollByChat" />
  </div>
</template>

<script setup lang="ts">
import MobileEnroll from '@/components/common-business/enroll/mobile-enroll.vue';
import MobileChatInputController from '@/components/page-watch-common/chat/chat-input-controller/mobile-chat-input-controller/mobile-chat-input-controller.vue';
import MobileDonateAnimation from '@/components/page-watch-common/donate/donate-animation/donate-animation.vue';
import MobileDonateSvgaAnimation from '@/components/page-watch-common/donate/donate-svga-animation/donate-svga-animation.vue';
import MobileAnnouncementTop from '@/components/page-watch-common/interactive-receive/announcement/announcement-top.vue';
import MobileInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/mobile-interactive-entrance.vue';
import MobileRunwayEffect from '@/components/page-watch-common/message-effect/runway-effect.vue';
import MobileChatMsgList from '../chat-msg-list/mobile-chat-msg-list.vue';
import MobileChatRoomPendant from '../chat-room-pendant/mobile-chat-room-pendant.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { chatInputControllerEnable } = storeDefinitionToRefs(useChatStore);

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { iarSdkLoaded, announcementFunctionVisible } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { mobileChatRoomBgUrl } = storeDefinitionToRefs(useThemeStore);

const { donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);
</script>

<style lang="scss">
.c-mobile-chat-room {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: 100%;
}

.c-mobile-chat-room__topic {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  padding: 0 0 12px;
  pointer-events: none;
  background-repeat: no-repeat;
  background-size: 100%;
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 1) 8px);

  .c-mobile-chat-room__topic__item {
    margin-top: 4px;
    &:empty {
      display: none;
    }
  }

  .c-mobile-chat-room__topic__announcement {
    pointer-events: initial;
  }

  &:empty {
    display: none;
  }
}

.c-mobile-chat-room__msg-list {
  position: relative;
  flex: 1;
  overflow: hidden;
}
</style>
