<!-- @file 移动端-横屏-"去邀请"挂件入口 -->
<template>
  <button
    class="c-mobile-invite-poster-entry"
    @click="redirectToPosterPage"
  ></button>
</template>

<script setup lang="ts">
import { redirectToPosterPage } from '../hooks/use-invite-poster-entry';
</script>

<style lang="scss">
.c-mobile-invite-poster-entry {
  z-index: 1;
  width: 40px;
  height: 40px;
  background-color: transparent;
  background-image: url(./imgs/invite-poster-entry.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
