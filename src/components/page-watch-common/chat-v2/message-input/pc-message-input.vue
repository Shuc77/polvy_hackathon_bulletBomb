<!-- PC 端聊天室输入框 -->
<template>
  <chat-message-input-section
    class="c-pc-chat-message-input"
    :default-height="134"
  >
    <!-- 图标左侧 -->
    <template #icon-left-suffix>
      <!-- 公告 -->
      <pc-announcement-entrance />
    </template>

    <!-- 图标右侧 -->
    <template #icon-right-suffix>
      <!-- 我的奖励 -->
      <pc-personal-reward-entrance />

      <!-- 打赏 -->
      <pc-donate-entrance />
    </template>

    <!-- 更多面板 -->
    <template #more-panel>
      <!-- 设置昵称 -->
      <div
        v-if="canSetNick"
        class="c-pc-chat-message-input__set-nick"
        @click="onClickSetNick"
      >
        <pc-icon-set-nick />
        {{ $lang('chat.setNick') }}
      </div>

      <!-- 绑定手机号 -->
      <div
        v-if="bindMobileVisible"
        class="c-pc-chat-message-input__bind-mobile"
        @click="onClickBindMobile"
      >
        <pc-icon-bind-mobile />
        {{ $lang('identityInfo.bindMobile') }}
      </div>

      <!-- 文件管理 -->
      <div
        class="c-pc-chat-message-input__file-management"
        @click="onClickFileManagement"
      >
        <pc-icon-more-files />
        <span>{{ $lang('fileManagement.title') }}</span>
      </div>
    </template>
  </chat-message-input-section>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import {
  PcIconBindMobile,
  PcIconMoreFiles,
  PcIconSetNick,
} from '@/components/component-icons/pc/map';
import PcDonateEntrance from '@/components/page-watch-common/donate/donate-entrance/pc-donate-entrance.vue';
import PcAnnouncementEntrance from '@/components/page-watch-common/interactive-receive/announcement/pc-announcement-entrance.vue';
import PcPersonalRewardEntrance from '@/components/page-watch-common/personal-reward/pc-personal-reward-entrance.vue';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useIdentityStore } from '@/store/use-identity-store';
import { useViewerStore } from '@/store/use-viewer-store';

const { getEmitter } = useGlobalInject();
const PolyvChatUI = getChatUIV2Pkg();
const { ChatMessageInputSection } = PolyvChatUI;

// 设置昵称
const { canSetNick } = storeDefinitionToRefs(useViewerStore);
function onClickSetNick() {
  getEmitter().emit(appEvents.chat.OpenSetNick, true);
}

// 绑定手机号
const { bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);
function onClickBindMobile() {
  getEmitter().emit(appEvents.global.OpenBindIdentityInfoDialog);
}

// 文件管理
function onClickFileManagement() {
  getEmitter().emit(appEvents.global.OpenFileManagement, true);
}
</script>

<style lang="scss">
.c-pc-chat-message-input {
  position: relative;
  z-index: 10;
}
.c-pc-chat-message-input__set-nick {
  order: 40;
}

.c-pc-chat-message-input__bind-mobile {
  order: 50;
}

.c-pc-chat-message-input__file-management {
  order: 60;
}
</style>
