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
      <chat-loader-helper>
        <mobile-runway-effect class="c-mobile-chat-room__topic__item" />
      </chat-loader-helper>

      <!-- 打赏动画 -->
      <chat-loader-helper>
        <mobile-donate-animation class="c-mobile-chat-room__topic__item" />
      </chat-loader-helper>
    </div>

    <!-- 聊天消息列表区域 -->
    <div class="c-mobile-chat-room__msg-list">
      <!-- 消息列表 -->
      <mobile-chat-msg-list v-if="!isChatUIV2" />
      <chat-loader-helper v-else>
        <chat-msg-list-v2 />
      </chat-loader-helper>

      <!-- 右下角挂件 -->
      <mobile-chat-room-pendant />

      <!-- 特效动画 -->
      <chat-loader-helper>
        <mobile-special-effect-animation />
      </chat-loader-helper>
    </div>

    <!-- 互动二次入口 -->
    <mobile-interactive-entrance v-if="iarSdkLoaded" />

    <!-- 底部输入框 -->
    <template v-if="chatInputControllerEnable">
      <mobile-chat-input-controller v-if="!isChatUIV2" />
      <chat-loader-helper v-else>
        <mobile-message-input-v2 />
      </chat-loader-helper>
    </template>

    <!-- 报名观看以及游客登录（参与互动时机） -->
    <mobile-enroll v-if="needEnrollByChat" />
  </div>
</template>

<script setup lang="ts">
import BackgroundSection from '@/components/common-business/background-section/background-section.vue';
import MobileEnroll from '@/components/common-business/enroll/mobile-enroll.vue';
import MobileRunwayEffect from '@/components/page-watch-common/chat-v2/chat-runway-effect/index.vue';
import MobileChatInputController from '@/components/page-watch-common/chat/chat-input-controller/mobile-chat-input-controller/mobile-chat-input-controller.vue';
import MobileDonateAnimation from '@/components/page-watch-common/donate/donate-animation/index.vue';
import MobileSpecialEffectAnimation from '@/components/page-watch-common/chat-v2/special-effect-animation/index.vue';
import MobileAnnouncementTop from '@/components/page-watch-common/interactive-receive/announcement/announcement-top.vue';
import MobileInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/mobile-interactive-entrance.vue';
import { ChatLoaderHelper } from '../../chat-v2/chat-loader-helper';
import ChatMsgListV2 from '../../chat-v2/chat-msg-list/index.vue';
import MobileMessageInputV2 from '../../chat-v2/message-input/mobile-message-input.vue';
import MobileChatMsgList from '../chat-msg-list/mobile-chat-msg-list.vue';
import MobileChatRoomPendant from '../chat-room-pendant/mobile-chat-room-pendant.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useThemeStore } from '@/store/use-theme-store';

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { chatInputControllerEnable, isChatUIV2 } = storeDefinitionToRefs(useChatStore);

const { iarSdkLoaded, announcementFunctionVisible } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { mobileChatRoomBgUrl, themeSetting } = storeDefinitionToRefs(useThemeStore);

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
