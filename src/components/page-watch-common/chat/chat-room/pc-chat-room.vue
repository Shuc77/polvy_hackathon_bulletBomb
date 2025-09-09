<!-- @file PC 端聊天室 -->
<template>
  <div class="c-pc-chat-room">
    <!-- 聊天室顶部固定区域 -->
    <div class="c-pc-chat-room__topic pws-main-tab-body">
      <!-- 置顶公告 -->
      <pc-announcement-top
        v-if="announcementFunctionVisible && iarSdkLoaded"
        class="c-pc-chat-room__topic__item c-pc-chat-room__topic__announcement"
      />

      <!-- 跑道消息 -->
      <pc-runway-effect class="c-pc-chat-room__topic__item" />

      <!-- 打赏动画 -->
      <pc-donate-animation
        v-if="donateAnimationVisible"
        class="c-pc-chat-room__topic__item"
      />
    </div>

    <!-- 聊天消息列表区域 -->
    <div class="c-pc-chat-room__msg-list">
      <!-- 消息列表 -->
      <pc-chat-msg-list />

      <!-- 右下角挂件 -->
      <pc-chat-room-pendant />

      <!-- 打赏 svga 特效 -->
      <pc-donate-svga-animation v-if="donateAnimationVisible" />
    </div>

    <!-- 互动二次入口 -->
    <pc-interactive-entrance v-if="iarSdkLoaded" />

    <!-- 消息引用 -->
    <pc-chat-msg-quote />

    <!-- 底部输入框 -->
    <pc-chat-input-controller v-if="chatInputControllerEnable" />

    <!-- 报名观看以及游客登录（参与互动时机） -->
    <pc-enroll v-if="isGuest || needEnrollByChat" />
  </div>
</template>

<script setup lang="ts">
import PcEnroll from '@/components/common-business/enroll/pc-enroll.vue';
import PcDonateAnimation from '@/components/page-watch-common/donate/donate-animation/donate-animation.vue';
import PcDonateSvgaAnimation from '@/components/page-watch-common/donate/donate-svga-animation/donate-svga-animation.vue';

import PcAnnouncementTop from '@/components/page-watch-common/interactive-receive/announcement/announcement-top.vue';
import PcInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/pc-interactive-entrance.vue';
import PcChatInputController from '../chat-input-controller/pc-chat-input-controller/pc-chat-input-controller.vue';
import PcChatMsgList from '../chat-msg-list/pc-chat-msg-list.vue';
import PcChatRoomPendant from '../chat-room-pendant/pc-chat-room-pendant.vue';
import PcRunwayEffect from '@/components/page-watch-common/message-effect/runway-effect.vue';
import PcChatMsgQuote from '../chat-msg-quote/pc-chat-msg-quote.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useIdentityStore } from '@/store/use-identity-store';

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { isGuest } = storeDefinitionToRefs(useIdentityStore);

const { chatInputControllerEnable } = storeDefinitionToRefs(useChatStore);

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
  padding: 0 0 12px;
  pointer-events: none;
  background-repeat: no-repeat;
  background-size: 100%;
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 1) 8px);

  .c-pc-chat-room__topic__item {
    margin-top: 4px;
    &:empty {
      display: none;
    }
  }

  .c-pc-chat-room__topic__announcement {
    pointer-events: initial;
  }

  &:empty {
    display: none;
  }
}

.c-pc-chat-room__msg-list {
  position: relative;
  flex: 1;
  overflow: hidden;
}
</style>
