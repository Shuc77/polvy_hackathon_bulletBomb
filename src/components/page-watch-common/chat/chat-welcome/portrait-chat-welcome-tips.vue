<!-- @file PC、移动、竖屏端欢迎语提示 -->
<template>
  <div class="c-portrait-chat-welcome-tips">
    <transition name="c-welcome-in">
      <p
        v-show="welcomeVisible"
        class="c-portrait-chat-welcome-tips__inner g-img-cover g-singleline"
      >
        <span class="c-portrait-chat-welcome-tips__prefix">{{ $lang('welcome.text') }} </span>
        <span class="c-portrait-chat-welcome-tips__msg g-singleline">{{ welcomeText }}</span>
      </p>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useChatWelcomeTips } from './use-chat-welcome-tips';

const { welcomeText, welcomeVisible } = useChatWelcomeTips();
</script>

<style lang="scss">
$--welcome-width: 258px;
$--welcome-height: 22px;

.c-portrait-chat-welcome-tips {
  width: $--welcome-width;
  height: $--welcome-height;
  overflow: hidden;
  color: $--color-white;
}

.c-portrait-chat-welcome-tips__inner {
  box-sizing: border-box;
  width: $--welcome-width;
  height: $--welcome-height;
  padding: 0 15px;
  line-height: $--welcome-height;
  background-image: url(./imgs/bg-portrait.png);
}

.c-welcome-in-enter-active,
.c-welcome-in-leave-active {
  transition: transform 0.5s;
  transform: translateX(0);
}
.c-welcome-in-enter,
.c-welcome-in-leave-active {
  transform: translateX(-100%);
}
</style>
