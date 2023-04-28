<!-- @file 竖屏端系统消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-system-msg"
    hide-user-info
  >
    <span>{{ chatMsg.content }}</span>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useSystemMsg } from './use-system-msg';

const { chatMsg } = useSystemMsg();
</script>
