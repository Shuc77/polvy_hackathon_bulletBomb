<!-- @file PC端-延迟加载的弹出层类型组件 -->

<template>
  <div class="c-pc-watch-layout-lazyload">
    <!-- 互动功能渲染入口 -->
    <pc-iar-render v-if="iarSdkLoaded" />
    <pc-iar-render-v2 v-if="iarSdkLoaded" />

    <!-- 商品库大卡片弹层 -->
    <pc-product-big-card-popup v-if="iarSdkLoaded" />

    <!-- 直播开始倒计时提示 -->
    <pc-live-start-tips />

    <!--  取消关联转播提示   -->
    <pc-transmit-switch-tip />

    <!-- 设置昵称 -->
    <pc-chat-set-nick v-if="canSetNick" />

    <!-- 页面右下角固定挂件 -->
    <pc-page-fixed-widgets hide-web-share />

    <!-- 聊天消息全文弹层 -->
    <pc-chat-full-message v-if="!isChatUIV2" />

    <!-- 实名认证弹层 -->
    <pc-real-name-dialog />

    <!-- 绑定用户信息 -->
    <pc-identity-collect-info-dialog v-if="bindMobileVisible" />

    <!-- 用户体系登录弹层 -->
    <pc-identity-login-dialog-render v-if="needIdentityGuestForceLogin" />

    <!-- 引导关注弹层 -->
    <pc-follow-dialog />

    <!-- 文件管理 -->
    <pc-file-management />

    <!-- 观看/学习时长统计弹层 -->
    <pc-learning-stat-dialog v-if="learningStatsDialogEnabled" />
  </div>
</template>

<script setup lang="ts">
import PcIdentityCollectInfoDialog from '@/components/common-business/identity-collect-info-dialog/pc-identity-collect-info-dialog.vue';
import PcIdentityLoginDialogRender from '@/components/common-business/identity-login-dialog-render/pc-identity-login-dialog-render.vue';

import PcPageFixedWidgets from '@/components/common-business/page-fixed-widgets/page-fixed-widgets.vue';
import PcChatFullMessage from '@/components/page-watch-common/chat/chat-full-message/pc-chat-full-message.vue';
import PcChatSetNick from '@/components/page-watch-common/chat/chat-set-nick/pc-chat-set-nick.vue';
import PcIarRenderV2 from '@/components/page-watch-common/interactive-receive-v2/pc-iar-render-v2.vue';
import PcIarRender from '@/components/page-watch-common/interactive-receive/pc-iar-render.vue';
import PcLiveStartTips from '@/components/page-watch-common/live-start-tips/pc-live-start-tips.vue';
import PcRealNameDialog from '@/components/page-watch-common/real-name-auth/pc-real-name-auth.vue';
import PcTransmitSwitchTip from '@/components/page-watch-common/transmit-switch-tip/pc-transmit-switch-tip.vue';
import PcFileManagement from '@/components/page-watch-common/file-management/pc-file-management.vue';

import PcFollowDialog from '@/components/page-watch-common/follow/follow-layer/pc-follow-dialog.vue';
import PcLearningStatDialog from '@/components/page-watch-common/learning-stat-dialog/pc-learning-stat-dialog.vue';

import PcProductBigCardPopup from '@/components/page-watch-common/product/product-big-card-popup/product-big-card-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useIdentityStore } from '@/store/use-identity-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChatStore } from '@/store/use-chat-store';

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { bindMobileVisible, needIdentityGuestForceLogin } = storeDefinitionToRefs(useIdentityStore);

const { learningStatsDialogEnabled } = storeDefinitionToRefs(useChannelInfoStore);

const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);
</script>
