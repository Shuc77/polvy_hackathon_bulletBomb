<!-- @file 移动端消息用户信息 -->
<template>
  <div
    class="c-mobile-ai-assistant-msg-user"
    :class="{
      'c-mobile-ai-assistant-msg-user--self': isSelfMsg,
      'c-mobile-ai-assistant-msg-user--special pws-msg-user-info-special': isAIUser,
    }"
  >
    <!-- 头像 -->
    <div
      class="c-mobile-ai-assistant-msg-user__avatar g-img-cover"
      :class="{
        'c-mobile-ai-assistant-msg-user__avatar__left': msgPosition === 'left',
        'c-mobile-ai-assistant-msg-user__avatar__right': msgPosition === 'right',
      }"
      :style="{
        backgroundImage: `url(${msgUserAvatar})`,
      }"
    ></div>

    <div class="c-mobile-ai-assistant-msg-user__nick-wrap">
      <!-- 昵称 -->
      <span class="c-mobile-ai-assistant-msg-user__nick g-singleline pws-chat-msg-user-nickname">
        {{ msgUserNick }}{{ isSelfMsg ? `(${$lang('base.me')})` : '' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAIAssistantMsgInjectInfo } from '../_hooks/use-ai-assistant-msg-inject-info';

const { msgUserNick, msgUserAvatar, isSelfMsg, isAIUser, msgPosition } =
  useAIAssistantMsgInjectInfo();
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-mobile-ai-assistant-msg-user {
  position: relative;
  box-sizing: border-box;
  padding-right: $--msg-container-padding-size;
  padding-left: $--msg-user-avatar-padding-mobile;
  margin: 0 $--margin-horizontal-margin;
}

.c-mobile-ai-assistant-msg-user__avatar {
  position: absolute;
  top: 0;
  width: $--msg-user-avatar-size-mobile;
  height: $--msg-user-avatar-size-mobile;
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

.c-mobile-ai-assistant-msg-user__nick-wrap {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  max-width: 100%;
  font-size: 12px;
  line-height: 1.4;
}

.c-mobile-ai-assistant-msg-user__nick {
  color: #adadc0;
}
</style>
