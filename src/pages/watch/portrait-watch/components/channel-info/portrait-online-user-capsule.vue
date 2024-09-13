<!-- @file 竖屏在线人数胶囊 -->
<template>
  <div
    class="portrait-online-user-capsule"
    @click="showInviteRank"
  >
    {{ shortNumber(onlineUserCount) }}{{ $lang('member.online.userCount') }}
  </div>
</template>

<script setup lang="ts">
import { shortNumber } from '@/assets/utils/number';
import { useChatStore } from '@/store/use-chat-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { eventBus, appEvents } from '@/app/app-events';

const { onlineUserCount } = storeDefinitionToRefs(useChatStore);

function showInviteRank() {
  eventBus.$emit(appEvents.portrait.OpenPortraitOnlineUserListPopup);
}
</script>

<style lang="scss">
.portrait-online-user-capsule {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  height: 23px;
  padding: 3px 8px;

  font-size: 12px;
  color: $--color-white;
  white-space: nowrap;
  background-color: rgba(#000, 0.4);
  border-radius: 18px;
}
</style>
