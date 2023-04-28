<!-- @file PC 端系统消息 -->
<template>
  <div class="c-pc-system-msg pws-chat-system-msg">{{ chatMsg.content }}</div>
</template>

<script setup lang="ts">
import { useSystemMsg } from './use-system-msg';

const { chatMsg } = useSystemMsg();
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-pc-system-msg {
  margin: 0 $--margin-horizontal-margin;
  font-size: 12px;
  text-align: center;
}
</style>
