<!-- @file 用户体系登录页 -->
<template>
  <div class="p-watch-identify">
    <watch-identify-login-content
      v-show="pageVisible"
      @guest-auth-success="onGuestAuthSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { useChannelStore } from '@/store/use-channel-store';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { messageBox, MessageBoxPositionType } from '@/components/common-base/message-box';
import { translate } from '@/assets/lang';
import { appEvents, useEventBusListener } from '@/app/app-events';
import WatchIdentifyLoginContent from '@/components/common-business/identity-login-dialog-render/watch-identify-login-content.vue';
import { useIdentityStore } from '@/store/use-identity-store';

const isFeedMainMode = isBuildForFeedMainMode();
const { getEmitter } = useGlobalInject();
const identityStore = useIdentityStore();
const channelStore = useChannelStore();

const emitter = getEmitter();

const pageVisible = ref(true);

let confirmDialogVisible = false;

/** 打开游客确认登录窗口 */
async function openGuestConfirmLoginDialog() {
  if (confirmDialogVisible) return;

  confirmDialogVisible = true;

  const res = await messageBox({
    content: translate('auth.login.tips.ppt'),
    confirmButtonText: translate('auth.login.button'),
    contentCenter: true,
    cancelButtonText: translate('auth.login.tips.continue'),
    positionType: MessageBoxPositionType.Absolute,
  }).$confirm();

  confirmDialogVisible = false;

  if (res) {
    pageVisible.value = true;
  } else {
    emitter.emit(appEvents.global.SlideToNextFeedSwiper);
  }
}

function onGuestAuthSuccess() {
  if (!identityStore.checkAllowUseGuest()) {
    identityStore.resetGuest();
    return;
  }

  // 处理游客已授权的情况，防止页面一直刷新
  if (identityStore.isGuest) {
    identityStore.resetGuest();
    return;
  }

  pageVisible.value = false;
  window.location.reload();
}

/**
 * 当前仅处理信息流下的特殊场景
 */
function onPageActive() {
  if (!isFeedMainMode) return;

  if (channelStore.isPptChannel) {
    pageVisible.value = false;
    openGuestConfirmLoginDialog();
  }
}

useEventBusListener(appEvents.global.PageActive, onPageActive);

onBeforeMount(() => {
  onPageActive();
});
</script>

<style>
.p-watch-identify {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
