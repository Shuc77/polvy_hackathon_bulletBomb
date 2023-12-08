<!-- @file PC 端聊天室 -->
<template>
  <div class="c-pc-chat-room">
    <!-- 聊天室顶部固定区域 -->
    <div class="c-pc-chat-room__topic">
      <!-- 置顶公告 -->
      <pc-announcement-top
        v-if="announcementFunctionVisible && iarSdkLoaded"
        class="c-pc-chat-room__topic__announcement"
      />

      <!-- 欢迎语 -->
      <pc-chat-welcome-tips />

      <!-- 发起转播频道被踢出提示 -->
      <pc-chat-error-tips
        v-if="chatExited"
        class="c-pc-chat-room__topic__error"
        :content="$lang('chat.transformTip')"
      />

      <!-- 聊天重放消息提示 -->
      <pc-chat-msg-replay-tips
        v-if="chatReplayEnabled"
        class="c-pc-chat-room__topic__replay"
      />
    </div>

    <!-- 聊天消息列表区域 -->
    <div class="c-pc-chat-room__msg-list">
      <!-- 消息列表 -->
      <pc-chat-msg-list />

      <!-- 右下角挂件 -->
      <pc-chat-room-pendant v-if="!isPlaybackWatchUrl && iarSdkLoaded" />

      <!-- 打赏 svga 特效 -->
      <pc-donate-svga-animation v-if="donateAnimationVisible" />

      <!-- 打赏动画 -->
      <pc-donate-animation
        v-if="donateAnimationVisible"
        class="c-pc-chat-room__donate-animation"
      />
    </div>

    <!-- 互动二次入口 -->
    <pc-interactive-entrance v-if="!isPlaybackWatchUrl && iarSdkLoaded" />

    <!-- 消息引用 -->
    <pc-chat-msg-quote />

    <!-- 底部输入框 -->
    <pc-chat-input-controller v-if="chatInputControllerEnable" />

    <!-- 报名观看（参与互动时机） -->
    <pc-enroll v-if="needEnrollByChat" />
  </div>
</template>

<script setup lang="ts">
import PcEnroll from '@/components/common-business/enroll/pc-enroll.vue';
import PcDonateAnimation from '@/components/page-watch-common/donate/donate-animation/donate-animation.vue';
import PcDonateSvgaAnimation from '@/components/page-watch-common/donate/donate-svga-animation/donate-svga-animation.vue';

import PcAnnouncementTop from '@/components/page-watch-common/interactive-receive/announcement/announcement-top.vue';
import PcInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/pc-interactive-entrance.vue';
import PcChatErrorTips from '../chat-error-tips/pc-chat-error-tips.vue';
import PcChatInputController from '../chat-input-controller/pc-chat-input-controller/pc-chat-input-controller.vue';
import PcChatMsgList from '../chat-msg-list/pc-chat-msg-list.vue';
import PcChatRoomPendant from '../chat-room-pendant/pc-chat-room-pendant.vue';
import PcChatWelcomeTips from '../chat-welcome/chat-welcome-tips.vue';
import PcChatMsgQuote from '../chat-msg-quote/pc-chat-msg-quote.vue';
import PcChatMsgReplayTips from '../chat-msg-replay-tips/pc-chat-msg-replay-tips.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChatStore } from '@/store/use-chat-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useDonateStore } from '@/store/use-donate-store';

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { chatExited, chatInputControllerEnable } = storeDefinitionToRefs(useChatStore);

const { chatReplayEnabled } = storeDefinitionToRefs(usePlaybackStore);

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { announcementFunctionVisible, iarSdkLoaded } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);
</script>

<style lang="scss">
.c-pc-chat-room {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-pc-chat-room__topic {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
}

.c-pc-chat-room__topic__announcement {
  margin-bottom: 8px;
}

.c-pc-chat-room__topic__error,
.c-pc-chat-room__topic__replay {
  margin: 8px 8px 0;
}

.c-pc-chat-room__msg-list {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.c-pc-chat-room__donate-animation {
  position: absolute;
  top: 45px;
  left: 0;
}
</style>
