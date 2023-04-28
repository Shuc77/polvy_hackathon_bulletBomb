<!-- @file 移动端关注按钮 -->
<template>
  <div
    class="c-mobile-follow-btn pws-mobile-follow-button"
    @click="onClickFollowBtn"
  >
    {{ followEntrance }}
  </div>
</template>

<script setup lang="ts">
import { useFollowBtn } from '../hooks/use-follow-btn';
import { useFollowSetting } from '../hooks/use-follow-setting';

const { followEntrance } = useFollowSetting();

const { onClickFollowBtn } = useFollowBtn();
</script>

<style lang="scss">
.c-mobile-follow-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 100%;
  padding: 0 16px;
  font-size: 16px;
}
</style>
