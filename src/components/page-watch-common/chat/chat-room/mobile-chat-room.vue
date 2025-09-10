<!-- @file 移动端聊天室 -->
<template>
  <div class="c-mobile-chat-room">
    <!-- 聊天室顶部固定区域 -->
    <div class="c-mobile-chat-room__topic pws-main-tab-body">
      <div
        class="c-mobile-chat-room__topic__bg"
        :style="{
          height: `${mobileLayoutBottomHeight}px`,
        }"
      >
        <background-section
          :background-type="themeSetting.mobileChatBackgroundType"
          :custom-url="mobileChatRoomBgUrl"
        />
      </div>

      <!-- 置顶公告 -->
      <div
        v-if="announcementFunctionVisible && iarSdkLoaded"
        class="c-mobile-chat-room__topic__item"
      >
        <mobile-announcement-top class="c-mobile-chat-room__topic__announcement" />
      </div>

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
      <mobile-chat-room-pendant />

      <!-- 打赏 svga 特效 -->
      <mobile-donate-svga-animation v-if="donateAnimationVisible" />
    </div>

    <!-- 互动二次入口 -->
    <mobile-interactive-entrance v-if="iarSdkLoaded" />

    <!-- 底部输入框 -->
    <mobile-chat-input-controller v-if="chatInputControllerEnable" />

    <!-- 报名观看以及游客登录（参与互动时机） -->
    <mobile-enroll v-if="isGuest || needEnrollByChat" />
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
import BackgroundSection from '@/components/common-business/background-section/background-section.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useLayoutStore } from '@/store/use-layout-store';

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { chatInputControllerEnable } = storeDefinitionToRefs(useChatStore);

const { iarSdkLoaded, announcementFunctionVisible } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { mobileChatRoomBgUrl, themeSetting } = storeDefinitionToRefs(useThemeStore);

const { donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);

const { isGuest } = storeDefinitionToRefs(useIdentityStore);

const { mobileLayoutBottomHeight } = storeDefinitionToRefs(useLayoutStore);
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
  // padding: 0 0 12px;
  overflow: hidden;
  pointer-events: none;
  background-repeat: no-repeat;
  background-size: 100%;
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 1) 8px);

  .c-mobile-chat-room__topic__bg {
    position: absolute;
    top: -40px;
    left: 0;
    z-index: 10;
    width: 100%;
  }

  .c-mobile-chat-room__topic__item {
    position: relative;
    z-index: 20;
    margin-top: 4px;

    &:empty {
      display: none;
    }

    &:last-of-type {
      padding-bottom: 12px;
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
