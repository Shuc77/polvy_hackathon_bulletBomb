<!-- @file 移动端红包领取消息 -->
<template>
  <div class="c-mobile-redpaper-receive-msg">
    <div class="c-mobile-redpaper-receive-msg__content pws-chat-redpaper-receive-msg">
      <i class="c-mobile-redpaper-receive-msg__icon g-img-cover"></i>
      <span>{{ receiveNick }}</span>

      <span v-if="isRedpaperRain">{{ $lang('redpack.rain.get') }}</span>
      <span v-else-if="isRedpaperPassword">{{ $lang('redpack.password.get') }}</span>
      <span v-else>{{ $lang('redpack.normal.get') }}</span>

      <span class="c-mobile-redpaper-receive-msg__highlight">
        {{ $lang('redpack.receive.name') }}
      </span>

      <template v-if="isOver">
        <span v-if="isRedpaperRain">{{ $lang('redpack.rain.finish') }}</span>
        <span v-else>{{ $lang('redpack.finish') }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRedpaperReceiveMsg } from './use-redpaper-receive-msg';

const { receiveNick, isRedpaperRain, isRedpaperPassword, isOver } = useRedpaperReceiveMsg();
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-mobile-redpaper-receive-msg {
  margin: 0 $--margin-horizontal-margin;
}

.c-mobile-redpaper-receive-msg__content {
  box-sizing: border-box;
  width: fit-content;
  padding: 4px 16px;
  margin: 0 auto;
  font-size: 12px;
  line-height: 17px;
  text-align: center;
  word-break: keep-all;
  background: rgba(#000, 0.3);
  border-radius: 4px;
}

.c-mobile-redpaper-receive-msg__icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-top: -2px;
  margin-right: 4px;
  vertical-align: middle;
  background-image: url(./imgs/redpaper-msg-ico.png);
}

.c-mobile-redpaper-receive-msg__highlight {
  color: #ff5353;
}
</style>
