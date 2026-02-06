<!-- PC 端聊天室输入框 -->
<template>
  <chat-message-input-section
    class="c-pc-chat-message-input"
    :default-height="134"
  >
    <!-- 图标左侧 -->
    <template #icon-left-suffix>
      <!-- 公告 -->
      <pc-bulletin-entrance />
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
      <chat-message-input-secion-more-item
        v-if="canSetNick"
        class="c-pc-chat-message-input__set-nick"
        :icon="PwcIconEdit"
        :label="$lang('chat.setNick')"
        show-arrow
        @click="onClickSetNick"
      />

      <!-- 绑定手机号 -->
      <chat-message-input-secion-more-item
        v-if="bindMobileVisible"
        class="c-pc-chat-message-input__bind-mobile"
        :icon="PcIconBindMobile"
        :label="$lang('identityInfo.bindMobile')"
        show-arrow
        @click="onClickBindMobile"
      />

      <!-- 文件管理 -->
      <chat-message-input-secion-more-item
        class="c-pc-chat-message-input__file-management"
        :icon="PcIconMoreFiles"
        :label="$lang('fileManagement.title')"
        show-arrow
        @click="onClickFileManagement"
      />
    </template>
  </chat-message-input-section>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { PcIconBindMobile, PcIconMoreFiles } from '@/components/component-icons/pc/map';
import PcDonateEntrance from '@/components/page-watch-common/donate/donate-entrance/pc-donate-entrance.vue';
import PcBulletinEntrance from '@/components/page-watch-common/interactive-receive-v2/bulletin-v2/bulletin-entrance/pc-bulletin-entrance.vue';
import PcPersonalRewardEntrance from '@/components/page-watch-common/personal-reward/pc-personal-reward-entrance.vue';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useIdentityStore } from '@/store/use-identity-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { PwcIconEdit } from '@polyv/vue-components';

const { getEmitter } = useGlobalInject();
const PolyvChatUI = getChatUIV2Pkg();
const { ChatMessageInputSection, ChatMessageInputSecionMoreItem } = PolyvChatUI;

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
