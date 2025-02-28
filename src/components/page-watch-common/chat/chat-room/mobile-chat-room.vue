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
        v-if="announcementFunctionVisible && iarSdkLoaded"
        class="c-mobile-chat-room__topic__announcement"
      />

      <!-- 发起转播频道被踢出提示 -->
      <mobile-chat-error-tips
        v-if="chatExited"
        class="c-mobile-chat-room__topic__error"
        :content="$lang('chat.transformTip')"
      />

      <!-- 聊天消息重放提示 -->
      <mobile-chat-msg-replay-tips
        v-if="chatMsgReplayEnabled"
        class="c-mobile-chat-room__topic__replay"
      />

      <!-- 跑道消息 -->
      <mobile-runway-effect />

      <!-- 打赏动画 -->
      <mobile-donate-animation
        v-if="donateAnimationVisible"
        class="c-mobile-chat-room__donate-animation"
      />
    </div>

    <!-- 聊天消息列表区域 -->
    <div class="c-mobile-chat-room__msg-list">
      <!-- 消息列表 -->
      <mobile-chat-msg-list
        :class="{
          'c-mobile-chat-room__msg-list__bubble-visible': productBubbleVisible,
        }"
      />

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
import MobileChatErrorTips from '../chat-error-tips/mobile-chat-error-tips.vue';
import MobileChatMsgList from '../chat-msg-list/mobile-chat-msg-list.vue';
import MobileChatMsgReplayTips from '../chat-msg-replay-tips/mobile-chat-msg-replay-tips.vue';
import MobileChatRoomPendant from '../chat-room-pendant/mobile-chat-room-pendant.vue';
import MobileRunwayEffect from '@/components/page-watch-common/message-effect/runway-effect.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChatStore } from '@/store/use-chat-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useThemeStore } from '@/store/use-theme-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useDonateStore } from '@/store/use-donate-store';

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { chatExited, chatInputControllerEnable } = storeDefinitionToRefs(useChatStore);

const { chatMsgReplayEnabled } = storeDefinitionToRefs(usePlaybackStore);

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { iarSdkLoaded, announcementFunctionVisible, productBubbleVisible } =
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
  pointer-events: none;

  .c-mobile-chat-room__topic__replay {
    margin: 16px 8px 0;
    pointer-events: initial;
  }

  .c-mobile-chat-room__topic__announcement {
    margin-bottom: 8px;
    pointer-events: initial;
  }

  .c-mobile-chat-room__topic__error {
    margin: 16px 8px 0;
    pointer-events: initial;
  }

  .c-mobile-chat-room__donate-animation {
    position: relative;
    left: 0;
  }
}

.c-mobile-chat-room__msg-list {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.c-mobile-chat-room__msg-list__bubble-visible {
  .c-mobile-chat-msg-list__container {
    padding-right: 70px;
  }
}
</style>
