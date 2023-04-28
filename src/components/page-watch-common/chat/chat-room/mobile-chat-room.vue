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
      <mobile-chat-welcome-tips v-if="welcomeEnabled" />
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
    <mobile-chat-input-controller v-if="!isWatchBackUrl" />

    <!-- 报名观看（参与互动时机） -->
    <mobile-enroll v-if="needEnrollByChat" />
  </div>
</template>

<script setup lang="ts">
import MobileAnnouncementTop from '@/components/page-watch-common/interactive-receive/announcement/announcement-top.vue';
import MobileChatWelcomeTips from '../chat-welcome/chat-welcome-tips.vue';
import MobileChatMsgList from '../chat-msg-list/mobile-chat-msg-list.vue';
import MobileChatRoomPendant from '../chat-room-pendant/mobile-chat-room-pendant.vue';
import MobileDonateAnimation from '@/components/page-watch-common/donate/donate-animation/donate-animation.vue';
import MobileDonateSvgaAnimation from '@/components/page-watch-common/donate/donate-svga-animation/donate-svga-animation.vue';
import MobileInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/mobile-interactive-entrance.vue';
import MobileEnroll from '@/components/common-business/enroll/mobile-enroll.vue';
import MobileChatInputController from '@/components/page-watch-common/chat/chat-input-controller/mobile-chat-input-controller/mobile-chat-input-controller.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';

const { isWatchBackUrl } = storeDefinitionToRefs(useWatchAppStore);

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { welcomeEnabled } = storeDefinitionToRefs(useChatStore);

const { announcementFunctionVisible } = storeDefinitionToRefs(useInteractReceiveStore);

const { mobileChatRoomBgUrl } = storeDefinitionToRefs(useLayoutStore);
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
