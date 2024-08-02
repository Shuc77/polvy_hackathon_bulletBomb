<!-- @file 竖屏端聊天室红包消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-redpaper-msg"
    hide-user-info
  >
    <div
      ref="portraitRedpaperMsgRef"
      class="c-portrait-redpaper-msg__content"
    >
      <span class="c-portrait-redpaper-msg__icon g-img-cover"></span>
      <template>{{ sendNick }} {{ $lang('redpack.sendMsg') }}{{ redpackText }}，</template>
      <span
        class="c-portrait-redpaper-msg__hightlight"
        @click="openRedpackDialog"
      >
        {{ $lang('redpack.receive') }}
      </span>
    </div>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useRedpaperMsg } from './use-redpaper-msg';

const { sendNick, redpackText, portraitRedpaperMsgRef, openRedpackDialog } = useRedpaperMsg();
</script>

<style lang="scss">
.c-portrait-redpaper-msg {
  width: 231px;
  font-size: 12px;
}
.c-portrait-redpaper-msg__content {
  padding-left: 26px;
  line-height: 18px;
}
.c-portrait-redpaper-msg__icon {
  position: absolute;
  top: 50%;
  left: 0;
  width: 20px;
  height: 20px;
  background-image: url(./imgs/icon_redpack.png);
  transform: translateY(-50%);
}
.c-portrait-redpaper-msg__hightlight {
  color: #ff5459;
}
</style>
