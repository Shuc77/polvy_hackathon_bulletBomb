<!-- @file 竖屏端消息用户信息 -->
<template>
  <div
    class="c-portrait-msg-user-info"
    :class="{
      'c-portrait-msg-user-info--actor': !hideUserActor,
    }"
  >
    <portrait-msg-user-actor
      v-if="!hideUserActor"
      :actor="msgUserActor"
      :user-type="msgUserType"
    />
    <span class="c-portrait-msg-user-info__nick">{{ msgUserNick }}：</span>
  </div>
</template>

<script setup lang="ts">
import PortraitMsgUserActor from '../_msg-user-actor/msg-user-actor.vue';
import { useMsgUserInfo } from './use-msg-user-info';

const { msgUserNick, msgUserActor, msgUserType, hideUserActor } = useMsgUserInfo();
</script>

<style lang="scss">
.c-portrait-msg-user-info {
  display: inline;
  // transform: translateY(-2px);
}
.c-portrait-msg-user-info--actor {
  transform: translateY(-1px);
}
.c-portrait-msg-user-info__nick {
  color: #ffd16b;
}
</style>
