<!-- @file 移动端消息用户信息 -->
<template>
  <div
    class="c-mobile-msg-user-info"
    :class="{
      'c-mobile-msg-user-info--self': isSelfMsg,
      'c-mobile-msg-user-info--special pws-msg-user-info-special': isSpecialUser,
    }"
  >
    <!-- 头像 -->
    <div
      class="c-mobile-msg-user-info__avatar g-img-cover"
      :style="{
        backgroundImage: `url(${msgUserAvatar})`,
      }"
    ></div>

    <div class="c-mobile-msg-user-info__nick-wrap">
      <!-- 头衔 -->
      <span
        v-if="!hideUserActor"
        class="c-mobile-msg-user-info__actor g-singleline pws-chat-msg-user-actor"
      >
        {{ msgUserActor }}
      </span>
      <!-- 昵称 -->
      <span class="c-mobile-msg-user-info__nick g-singleline pws-chat-msg-user-nickname">
        {{ msgUserNick }}{{ isSelfMsg ? `(${$lang('base.me')})` : '' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMsgUserInfo } from './use-msg-user-info';

const {
  msgUserNick,
  msgUserAvatar,
  msgUserActor,

  isSelfMsg,
  isSpecialUser,
  hideUserActor,
} = useMsgUserInfo();
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-mobile-msg-user-info {
  position: relative;
  box-sizing: border-box;
  padding-right: $--msg-container-padding-size;
  padding-left: $--msg-user-avatar-padding-mobile;
  margin: 0 $--margin-horizontal-margin;
}

.c-mobile-msg-user-info__avatar {
  position: absolute;
  top: 0;
  left: 0;
  width: $--msg-user-avatar-size-mobile;
  height: $--msg-user-avatar-size-mobile;
  overflow: hidden;
  border-radius: 50%;
  @include minor-border;
}

.c-mobile-msg-user-info__nick-wrap {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  max-width: 100%;
  font-size: 12px;
  line-height: 1.4;
}

.c-mobile-msg-user-info__nick {
  color: #adadc0;
}

.c-mobile-msg-user-info__actor {
  flex-shrink: 0;
  max-width: 48px;
  height: 18px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
  white-space: nowrap;
  vertical-align: middle;
  background: #5394f6;
  border-radius: 9px;
  transform: scale(0.833);
}

.c-mobile-msg-user-info--special {
  .c-mobile-msg-user-info__nick {
    color: #5394f6;
  }
}
</style>
