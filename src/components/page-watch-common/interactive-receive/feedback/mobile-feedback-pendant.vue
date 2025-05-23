<!-- @file 投诉反馈挂件 -->
<template>
  <div
    class="c-mobile-feedback-pendant"
    @click="onClickFeedback"
  ></div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

const { getEmitter } = useGlobalInject();

/** 点击投诉反馈 */
function onClickFeedback() {
  getEmitter().emit(appEvents.interaction.OpenFeedback, true);
}
</script>

<style lang="scss">
.c-mobile-feedback-pendant {
  width: 40px;
  height: 40px;
  background-image: url(./images/icon-feedback.png);
  background-repeat: no-repeat;
  background-size: 100%;
}
</style>
