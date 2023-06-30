<!-- @file 移动端聊天室 -->
<template>
  <div
    class="c-mobile-chat-room"
    :style="{
      backgroundImage: mobileChatRoomBgUrl ? `url(${mobileChatRoomBgUrl})` : '',
    }"
  >
    <!-- 聊天室顶部固定区域 -->
    <div class="c-mobile-chat-room__topic">
      <!-- 置顶公告 -->
      <mobile-announcement-top
        v-if="announcementFunctionVisible"
        class="c-mobile-chat-room__topic__announcement"
      />

      <!-- 欢迎语 -->
      <mobile-chat-welcome-tips v-if="chatSetting.welcomeEnabled" />

      <!-- 聊天消息重放提示 -->
      <mobile-chat-msg-replay-tips
        v-if="chatReplayEnabled"
        class="c-mobile-chat-room__topic__replay"
      />
    </div>

    <!-- 聊天消息列表区域 -->
    <div class="c-mobile-chat-room__msg-list">
      <!-- 消息列表 -->
      <mobile-chat-msg-list />

      <!-- 右下角挂件 -->
      <mobile-chat-room-pendant />

      <!-- 打赏 svga 特效 -->
      <mobile-donate-svga-animation />

      <!-- 打赏动画 -->
      <mobile-donate-animation class="c-mobile-chat-room__donate-animation" />
    </div>

    <!-- 互动二次入口 -->
    <mobile-interactive-entrance />

    <!-- 底部输入框 -->
    <mobile-chat-input-controller v-if="!isPlaybackWatchUrl" />

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
import MobileChatMsgList from '../chat-msg-list/mobile-chat-msg-list.vue';
import MobileChatMsgReplayTips from '../chat-msg-replay-tips/mobile-chat-msg-replay-tips.vue';
import MobileChatRoomPendant from '../chat-room-pendant/mobile-chat-room-pendant.vue';
import MobileChatWelcomeTips from '../chat-welcome/chat-welcome-tips.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { usePlaybackStore } from '@/store/use-playback-store';

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const { chatReplayEnabled } = storeDefinitionToRefs(usePlaybackStore);

const { announcementFunctionVisible } = storeDefinitionToRefs(useInteractReceiveStore);

const { mobileChatRoomBgUrl } = storeDefinitionToRefs(useThemeStore);
</script>

<style lang="scss">
.c-mobile-chat-room {
  position: relative;
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
}

.c-mobile-chat-room__topic__replay {
  margin: 16px 8px 0;
}

.c-mobile-chat-room__topic__announcement {
  margin-bottom: 8px;
}

.c-mobile-chat-room__msg-list {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.c-mobile-chat-room__donate-animation {
  position: absolute;
  top: 45px;
  left: 0;
}
</style>
