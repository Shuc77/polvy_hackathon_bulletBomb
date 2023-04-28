<!-- @file 聊天室关闭提示 -->
<template>
  <div class="c-chat-close-tips">
    <span class="c-chat-close-tips__icon g-img-cover"></span>
    <span class="c-chat-close-tips__text">{{ $lang('chat.closeTips') }}</span>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.c-chat-close-tips {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 45% 12px;
}

.c-chat-close-tips__icon {
  width: 88px;
  height: 88px;
  margin-bottom: 8px;
  background-image: url(./imgs/closed_chat_icon.png);
}

.c-chat-close-tips__text {
  font-size: 14px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.25);
  text-align: center;
}
</style>
