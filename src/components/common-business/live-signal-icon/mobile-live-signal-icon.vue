<template>
  <div class="c-signal-container">
    <div
      class="c-signal-bar"
      v-for="n in barCount"
      :key="n"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

defineProps({
  barCount: PropUtils.number.def(5),
});
</script>

<style lang="scss">
.c-signal-container {
  box-sizing: border-box;
  display: inline-flex;
  align-items: flex-end;
  width: 12px;
  height: 12px;
  padding: 2px;
}

.c-signal-bar {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: #fff;
  border-radius: 1px;
  animation: pulse 1.5s infinite ease-in-out;
}

.c-signal-bar:nth-child(2n) {
  background-color: transparent;
}
/* 定义动画关键帧 */
@keyframes pulse {
  0%,
  100% {
    height: 30%; /* 最低高度 */
  }
  50% {
    height: 90%; /* 最高高度 */
  }
}

/* 设置每个信号条的动画延迟，以错开每根信号条的动画 */
.c-signal-bar:nth-child(1) {
  animation-delay: 0s;
}

.c-signal-bar:nth-child(2) {
  animation-delay: 0.9s;
}

.c-signal-bar:nth-child(3) {
  animation-delay: 0.6s;
}
</style>
