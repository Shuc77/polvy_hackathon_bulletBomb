<!-- @file PC 端消息用户信息 -->
<template>
  <div
    class="c-pc-ai-assistant-msg-user"
    :class="{
      'c-pc-ai-assistant-msg-user__align-right': msgPosition === 'right',
      'c-pc-ai-assistant-msg-user--self': isSelfMsg,
      'c-pc-ai-assistant-msg-user--special pws-msg-user-info-special': isAIUser,
    }"
  >
    <!-- 头像 -->
    <div
      class="c-pc-ai-assistant-msg-user__avatar g-img-cover"
      :class="{
        'c-pc-ai-assistant-msg-user__avatar__left': msgPosition === 'left',
        'c-pc-ai-assistant-msg-user__avatar__right': msgPosition === 'right',
      }"
      :style="{
        backgroundImage: `url(${msgUserAvatar})`,
      }"
    ></div>

    <div class="c-pc-ai-assistant-msg-user__nick-wrap">
      <!-- 昵称 -->
      <span
        class="c-pc-ai-assistant-msg-user__nick g-singleline pws-chat-msg-user-nickname"
        :title="msgUserNick"
      >
        {{ msgUserNick }}{{ isSelfMsg ? `(${$lang('base.me')})` : '' }}
      </span>
    </div>
    <!-- 设置昵称图标 -->
    <pc-icon-set-nick
      v-if="isSelfMsg && canSetNick"
      class="c-pc-ai-assistant-msg-user__set-nick pws-chat-msg-user-set-nick-icon"
      @click="onClickSetNick"
    />
  </div>
</template>

<script setup lang="ts">
import { PcIconSetNick } from '@/components/component-icons/pc/map';
import { useAIAssistantMsgInjectInfo } from '../_hooks/use-ai-assistant-msg-inject-info';

import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

const { msgUserNick, msgUserAvatar, isSelfMsg, isAIUser, msgPosition } =
  useAIAssistantMsgInjectInfo();

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { getEmitter } = useGlobalInject();

function onClickSetNick() {
  getEmitter().emit(appEvents.chat.OpenSetNick, true);
}
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-pc-ai-assistant-msg-user {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: $--msg-user-avatar-size;
  padding-right: $--msg-container-padding-size;
  padding-left: $--msg-user-avatar-padding;
  margin: 0 $--margin-horizontal-margin;
  line-height: $--msg-user-avatar-size;

  &__align-right {
    flex-direction: row-reverse;
  }
}

.c-pc-ai-assistant-msg-user__avatar {
  position: absolute;
  top: 0;
  width: $--msg-user-avatar-size;
  height: $--msg-user-avatar-size;
  overflow: hidden;
  border-radius: 50%;
  @include minor-border;
  &__left {
    left: 0;
  }
  &__right {
    right: 0;
  }
}

.c-pc-ai-assistant-msg-user__nick-wrap {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  max-width: 100%;
  font-size: 14px;
}

.c-pc-ai-assistant-msg-user__set-nick {
  display: flex;
  flex-shrink: 0;
  padding: 0 8px;
  font-size: 16px !important;
  vertical-align: middle;
  cursor: pointer;
  opacity: 0;
}
.c-pc-ai-assistant-msg-user:hover {
  .c-pc-ai-assistant-msg-user__set-nick {
    opacity: 1;
  }
}
</style>
