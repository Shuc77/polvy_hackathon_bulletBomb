<!-- @file 竖屏端消息用户信息 -->
<template>
  <div
    class="c-portrait-msg-user-info"
    :class="{
      'c-portrait-msg-user-info--actor': !hideUserActor,
      'c-portrait-msg-user-info--special': isSpecialUser,
    }"
  >
    <!-- 头像 -->
    <div
      v-if="msgUserAvatar && !hideUserAvatar"
      class="c-portrait-msg-user-info__avatar"
      :style="{
        backgroundImage: `url(${msgUserAvatar})`,
      }"
    ></div>

    <!-- 头衔 -->
    <portrait-msg-user-actor
      v-if="!hideUserActor"
      :actor="msgUserActor"
      :user-type="msgUserType"
    />

    <!-- 昵称 -->
    <span
      class="c-portrait-msg-user-info__nick pws-secondary-text-color"
      :class="{
        'c-portrait-msg-user-info__nick--special': isSpecialUser,
      }"
      :style="nicknameStyle"
      >{{ msgUserNick }}：</span
    >
  </div>
</template>

<script setup lang="ts">
import PortraitMsgUserActor from '../_msg-user-actor/msg-user-actor.vue';
import { useMsgUserInfo } from './use-msg-user-info';

const {
  msgUserNick,
  msgUserActor,
  msgUserType,
  msgUserAvatar,
  hideUserActor,
  hideUserAvatar,
  isSpecialUser,
  nicknameStyle,
} = useMsgUserInfo();
</script>

<style lang="scss">
.c-portrait-msg-user-info {
  display: inline;
}
.c-portrait-msg-user-info--actor {
  transform: translateY(-1px);
}
.c-portrait-msg-user-info__nick--special {
  -webkit-background-clip: text;
  background-clip: text;
}
.c-portrait-msg-user-info__avatar {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  vertical-align: middle;
  background-size: 100% 100%;
  border-radius: 50%;
  transform: translateY(-2px);
}
</style>
