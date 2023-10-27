<!-- @file 移动端-横屏自定义消息（客户端） -->
<template>
  <div class="c-mobile-customer-msg"></div>
</template>

<script setup lang="ts">
import { useCustomMsg } from './use-custom-msg';

const { chatMsg } = useCustomMsg();
console.info(chatMsg.value);
</script>
