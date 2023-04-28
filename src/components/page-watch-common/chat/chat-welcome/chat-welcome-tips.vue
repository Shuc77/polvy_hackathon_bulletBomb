<!-- @file PC、移动、竖屏端欢迎语提示 -->
<template>
  <transition
    v-if="welcomeEnabled"
    :name="useTransition ? 'c-welcome-in' : ''"
  >
    <div
      v-show="welcomeVisible"
      class="c-chat-welcome-tips"
    >
      <p class="c-chat-welcome-tips__inner">
        <span class="c-chat-welcome-tips__star c-chat-welcome-tips__star--left"></span>
        <span class="c-chat-welcome-tips__prefix">{{ $lang('welcome.text') }}</span>
        <span class="c-chat-welcome-tips__msg g-singleline">{{ welcomeText }}</span>
        <span class="c-chat-welcome-tips__star c-chat-welcome-tips__star--right"></span>
      </p>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { PropUtils, useProps } from '@/assets/utils/vue-utils/props-utils';
import { useChatStore } from '@/store/use-chat-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatWelcomeTips } from './use-chat-welcome-tips';

const props = defineProps({
  /** 是否使用动画 */
  useTransition: PropUtils.bool.def(false),
});

const { useTransition } = useProps(props);

const { welcomeEnabled } = storeDefinitionToRefs(useChatStore);

const { welcomeText, welcomeVisible } = useChatWelcomeTips();
</script>

<style lang="scss">
$--welcome-tips-height: 32px;

.c-chat-welcome-tips__inner {
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  width: 100%;
  height: $--welcome-tips-height;
  padding: 0 16px;
  font-size: 14px;
  line-height: $--welcome-tips-height;
  color: #fff;
  vertical-align: top;
  pointer-events: none;
  background: url('./imgs/bg.png') no-repeat center;
  background-size: 100% 100%;
  border-radius: 2px;
  box-shadow: none;
}
.c-chat-welcome-tips__prefix,
.c-chat-welcome-tips__suffix {
  white-space: nowrap;
}
.c-chat-welcome-tips__prefix {
  margin-right: 8px;
}
.c-chat-welcome-tips__suffix {
  margin-left: 8px;
}
.c-chat-welcome-tips__msg {
  max-width: calc(100vw - 40px);
  max-width: calc(100vmin - 40px) \9\0;
}
.c-chat-welcome-tips__star {
  display: inline-block;
  flex: none;
  width: 16px;
  height: $--welcome-tips-height;
}
.c-chat-welcome-tips__star--left {
  margin-right: 10px;
  background: url('./imgs/icon-start-left.png') no-repeat center;
  background-size: contain;
}
.c-chat-welcome-tips__star--right {
  margin-left: 10px;
  background: url('./imgs/icon-start-right.png') no-repeat center;
  background-size: contain;
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
