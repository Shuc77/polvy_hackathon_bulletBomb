<!-- @file PC 端连麦 -->
<template>
  <div class="c-pc-connect-mic">
    <div class="c-pc-connect-mic__body">
      <!-- 占位图 -->
      <pc-connect-mic-placeholder
        v-if="[ConnectMicStatus.NotConnect, ConnectMicStatus.Applying].includes(connectMicStatus)"
      />

      <!-- 连麦用户列表 -->
      <pc-connect-mic-user-list v-if="connectMicList.length" />
    </div>

    <!-- 底部按钮 -->
    <pc-connect-mic-bottom />

    <!-- 结束二次确认 -->
    <pc-connect-mic-confirm />
  </div>
</template>

<script setup lang="ts">
import PcConnectMicBottom from './pc-connect-mic-bottom.vue';
import PcConnectMicConfirm from './pc-connect-mic-confirm.vue';
import PcConnectMicPlaceholder from './pc-connect-mic-placeholder.vue';
import PcConnectMicUserList from './pc-connect-mic-user-list.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { ConnectMicStatus } from '@polyv/live-watch-sdk';
import { useConnectMic } from '../hooks/use-connect-mic';

const { connectMicStatus, connectMicList } = storeDefinitionToRefs(useConnectMicStore);

useConnectMic();
</script>

<style lang="scss">
.c-pc-connect-mic {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-pc-connect-mic__body {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.test-item {
  width: 100%;
  height: 160px;
}
</style>
