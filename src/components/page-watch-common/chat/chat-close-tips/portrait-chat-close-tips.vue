<!-- @file 聊天室关闭提示 -->
<template>
  <div class="c-portrait-chat-close-tips">
    <span class="c-portrait-chat-close-tips-text">{{ $lang('chat.closeTips') }}</span>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.c-portrait-chat-close-tips {
  display: inline-block;
  max-width: 60%;
  font-size: 12px;
  line-height: 1.5;
  color: #fff;
  vertical-align: middle;
}
</style>
