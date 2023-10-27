<!-- @file 移动端横屏-课堂激励点赞消息 -->
<template>
  <div class="c-mobile-motivation-like-msg">
    <div
      class="c-mobile-motivation-like-msg__content pws-chat-motivation-like-msg"
      v-html="content"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useMotivationLikeMsg } from './use-motivation-like-msg';

const { content } = useMotivationLikeMsg();
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-mobile-motivation-like-msg {
  margin: 0 $--margin-horizontal-margin;
  font-size: 12px;
  text-align: center;
}

.c-mobile-motivation-like-msg__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 5px 8px;
  color: #adadc0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}
</style>
