<!-- @file 移动端竖屏-聊天区域异常提示组件 -->
<template>
  <div class="c-portrait-chat-error-tips">
    <span class="c-portrait-chat-error-tips-text">{{ content }}</span>
  </div>
</template>

<script setup lang="ts">
import { useProps } from '@polyv/vue-components';
import { chatErrorTipsProps } from './use-chat-error-tips';

const props = defineProps(chatErrorTipsProps());

const { content } = useProps(props);
</script>

<style lang="scss">
.c-portrait-chat-error-tips {
  display: inline-block;
  max-width: 60%;
  font-size: 12px;
  line-height: 1.5;
  color: #fff;
  vertical-align: middle;
}
</style>
