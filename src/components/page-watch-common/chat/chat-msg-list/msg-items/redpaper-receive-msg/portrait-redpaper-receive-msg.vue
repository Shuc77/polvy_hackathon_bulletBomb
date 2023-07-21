<!-- @file 竖屏端红包领取消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-redpaper-receive-msg"
    hide-user-info
  >
    <div class="c-portrait-redpaper-receive-msg__content">
      <i class="c-portrait-redpaper-receive-msg__icon g-img-cover"></i>
      <span class="c-portrait-redpaper-receive-msg__nick">{{ receiveNick }}</span>

      <span v-if="isRedpaperRain">{{ $lang('redpack.rain.get') }}</span>
      <span v-else-if="isRedpaperPassword">{{ $lang('redpack.password.get') }}</span>
      <span v-else-if="isRedpaperQuestion">{{ $lang('redpack.question.get') }}</span>
      <span v-else>{{ $lang('redpack.normal.get') }}</span>

      <span class="c-portrait-redpaper-receive-msg__highlight">
        {{ $lang('redpack.receive.name') }}
      </span>

      <template v-if="isOver">
        <span v-if="isRedpaperRain">{{ $lang('redpack.rain.finish') }}</span>
        <span v-else>{{ $lang('redpack.finish') }}</span>
      </template>
    </div>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useRedpaperReceiveMsg } from './use-redpaper-receive-msg';

const { receiveNick, isRedpaperRain, isRedpaperPassword, isOver, isRedpaperQuestion } =
  useRedpaperReceiveMsg();
</script>

<style lang="scss">
.c-portrait-redpaper-receive-msg__content {
  font-size: 12px;
}

.c-portrait-redpaper-receive-msg__icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-top: -2px;
  margin-right: 4px;
  vertical-align: middle;
  background-image: url(./imgs/redpaper-msg-ico.png);
}

.c-portrait-redpaper-receive-msg__nick {
  margin-right: 4px;
  color: #ffd16b;
}
.c-portrait-redpaper-receive-msg__highlight {
  color: #ffd16b;
}
</style>
