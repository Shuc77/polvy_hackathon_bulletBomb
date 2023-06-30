<!-- @file 聊天室关闭提示 -->
<template>
  <div class="c-chat-close-tips">
    <span class="c-chat-close-tips__icon g-img-cover pws-chat-close-tips-icon"></span>
    <span class="c-chat-close-tips__text pws-chat-close-tips-text">{{
      $lang('chat.closeTips')
    }}</span>
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
}

.c-chat-close-tips__text {
  font-size: 14px;
  line-height: 18px;
  text-align: center;
}
</style>
