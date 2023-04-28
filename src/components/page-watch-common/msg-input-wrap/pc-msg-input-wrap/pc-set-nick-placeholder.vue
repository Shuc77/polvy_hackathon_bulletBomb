<!-- @file PC 端设置昵称占位 -->
<template>
  <div
    class="c-pc-set-nick-placeholder pws-pc-set-nick-placeholder"
    @click="onClickSetNick"
  >
    <span>{{ $lang('chat.setNick.tips1') }}</span>
    <span class="c-pc-set-nick-placeholder--highlight pws-pc-set-nick-placeholder-highlight">
      {{ $lang('chat.setNick.tips2') }}
    </span>
    <span>{{ $lang('chat.setNick.tips3') }}</span>
  </div>
</template>

<script setup lang="ts">
import { appEvents, eventBus } from '@/app/app-events';

function onClickSetNick() {
  eventBus.$emit(appEvents.chat.OpenSetNick, true);
}
</script>

<style lang="scss">
.c-pc-set-nick-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  background: #1a1b1f;
}

.c-pc-set-nick-placeholder--highlight {
  margin: 0 3px;
  font-weight: bold;
  color: #78a7ed;
}

.c-pc-msg-input-wrap__msg-input {
  position: relative;
  display: flex;
}
</style>
