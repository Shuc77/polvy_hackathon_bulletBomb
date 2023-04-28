<!-- @file PC 端自定义消息 -->
<template>
  <div class="c-pc-customer-msg pws-chat-customer-msg">{{ chatMsg.content }}</div>
</template>

<script setup lang="ts">
import { useCustomerMsg } from './use-customer-msg';

const { chatMsg } = useCustomerMsg();
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-pc-customer-msg {
  margin: 0 $--margin-horizontal-margin;
  font-size: 12px;
  text-align: center;
}
</style>
