<!-- @file 移动端-横屏-"去邀请"胶囊按钮入口 -->
<template>
  <div
    class="c-mobile-invite-poster-entry-capsule"
    @click="onClickInvitePosterEntry"
  >
    {{ $lang('invite.rank.invite.btn') }}
  </div>
</template>

<script setup lang="ts">
import { onClickInvitePosterEntry } from '../hooks/use-invite-poster-entry';
</script>

<style lang="scss">
.c-mobile-invite-poster-entry-capsule {
  z-index: 1;
  width: 74px;
  height: 32px;
  font-size: 14px;
  line-height: 32px;
  color: #fff;
  text-align: center;
  background: linear-gradient(157deg, #46a6fe 0%, #1f67fd 100%);
  border-radius: 16px;
}
</style>
