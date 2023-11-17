<!-- @file PC 端消息用户信息 -->
<template>
  <div
    class="c-pc-msg-user-info"
    :class="{
      'c-pc-msg-user-info--self': isSelfMsg,
      'c-pc-msg-user-info--special pws-msg-user-info-special': isSpecialUser,
    }"
  >
    <!-- 头像 -->
    <div
      class="c-pc-msg-user-info__avatar g-img-cover"
      :style="{
        backgroundImage: `url(${msgUserAvatar})`,
      }"
    ></div>

    <div class="c-pc-msg-user-info__nick-wrap">
      <!-- 头衔 -->
      <span
        v-if="!hideUserActor"
        class="c-pc-msg-user-info__actor g-singleline pws-chat-msg-user-actor"
        :title="msgUserActor"
      >
        {{ msgUserActor }}
      </span>
      <!-- 昵称 -->
      <span
        class="c-pc-msg-user-info__nick g-singleline pws-chat-msg-user-nickname"
        :title="msgUserNick"
      >
        {{ msgUserNick }}{{ isSelfMsg ? `(${$lang('base.me')})` : '' }}
      </span>
      <!-- 设置昵称图标 -->
      <pc-icon-set-nick
        v-if="isSelfMsg && canSetNick"
        class="c-pc-msg-user-info__set-nick pws-chat-msg-user-set-nick-icon"
        @click="onClickSetNick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconSetNick } from '@/components/component-icons/pc/map';
import { useMsgUserInfo } from './use-msg-user-info';

import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { appEvents, eventBus } from '@/app/app-events';

const {
  msgUserNick,
  msgUserAvatar,
  msgUserActor,

  isSelfMsg,
  isSpecialUser,
  hideUserActor,
} = useMsgUserInfo();

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

function onClickSetNick() {
  eventBus.$emit(appEvents.chat.OpenSetNick, true);
}
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-pc-msg-user-info {
  position: relative;
  box-sizing: border-box;
  height: $--msg-user-avatar-size;
  padding-right: $--msg-container-padding-size;
  padding-left: $--msg-user-avatar-padding;
  margin: 0 $--margin-horizontal-margin;
  line-height: $--msg-user-avatar-size;
}

.c-pc-msg-user-info__avatar {
  position: absolute;
  top: 0;
  left: 0;
  width: $--msg-user-avatar-size;
  height: $--msg-user-avatar-size;
  overflow: hidden;
  border-radius: 50%;
  @include minor-border;
}

.c-pc-msg-user-info__nick-wrap {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  max-width: 100%;
  font-size: 14px;
}

.c-pc-msg-user-info__actor {
  flex-shrink: 0;
  max-width: 48px;
  height: 18px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  vertical-align: middle;
  border-radius: 9px;
  transform: scale(0.833);
}

.c-pc-msg-user-info__set-nick {
  display: flex;
  flex-shrink: 0;
  padding: 0 8px;
  font-size: 16px !important;
  vertical-align: middle;
  cursor: pointer;
  opacity: 0;
}
.c-pc-msg-user-info:hover {
  .c-pc-msg-user-info__set-nick {
    opacity: 1;
  }
}
</style>
