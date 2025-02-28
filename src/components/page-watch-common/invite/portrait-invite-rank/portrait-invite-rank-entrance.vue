<!-- @file 竖屏-邀请榜入口 -->
<template>
  <div class="c-portrait-invite-rank__entrance">
    <div @click="showInviteRank">
      {{ $lang('menu.tabName.invite') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

const { getEmitter } = useGlobalInject();

function showInviteRank() {
  getEmitter().emit(appEvents.invite.OpenPortraitInviteRank);
}
</script>

<style lang="scss">
.c-portrait-invite-rank__entrance {
  white-space: nowrap;
  > div {
    display: inline-block;
    padding: 0 8px;
    font-size: 12px;
    line-height: 28px;
    color: #ffa611;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 16px;
    &::before {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-top: -3px;
      margin-right: 2px;
      vertical-align: middle;
      content: '';
      background-image: url(./imgs/icon-invite.png);
      background-repeat: no-repeat;
      background-size: contain;
    }
  }
}
</style>
