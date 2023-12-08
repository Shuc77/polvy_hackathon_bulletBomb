<!-- @file PC端-延迟加载的弹出层类型组件 -->

<template>
  <div class="c-pc-watch-layout-lazyload">
    <!-- 互动功能渲染入口 -->
    <pc-iar-render v-if="!isPlaybackWatchUrl && iarSdkLoaded" />

    <!-- 聊天室连接失败提示 -->
    <pc-chat-connect-error-dialog />

    <!-- 直播开始倒计时提示 -->
    <pc-live-start-tips />

    <!--  取消关联转播提示   -->
    <pc-transmit-switch-tip />

    <!-- 设置昵称 -->
    <pc-chat-set-nick v-if="canSetNick" />

    <!-- 页面右下角固定挂件 -->
    <pc-page-fixed-widgets hide-web-share />

    <!-- 聊天消息全文弹层 -->
    <pc-chat-full-message />

    <!-- 实名认证弹层 -->
    <pc-real-name-dialog />
  </div>
</template>

<script setup lang="ts">
import PcPageFixedWidgets from '@/components/common-business/page-fixed-widgets/page-fixed-widgets.vue';
import PcChatConnectErrorDialog from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-dialog/pc-chat-connect-error-dialog.vue';
import PcChatSetNick from '@/components/page-watch-common/chat/chat-set-nick/pc-chat-set-nick.vue';
import PcIarRender from '@/components/page-watch-common/interactive-receive/pc-iar-render.vue';
import PcLiveStartTips from '@/components/page-watch-common/live-start-tips/pc-live-start-tips.vue';
import PcTransmitSwitchTip from '@/components/page-watch-common/transmit-switch-tip/pc-transmit-switch-tip.vue';
import PcChatFullMessage from '@/components/page-watch-common/chat/chat-full-message/pc-chat-full-message.vue';
import PcRealNameDialog from '@/components/page-watch-common/real-name-auth/pc-real-name-auth.vue';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useViewerStore } from '@/store/use-viewer-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
