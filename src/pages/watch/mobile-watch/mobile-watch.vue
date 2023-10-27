<!-- @file 移动端观看页 -->
<template>
  <div class="c-mobile-watch">
    <!-- 观看页主体布局 -->
    <mobile-watch-layout />

    <!-- ========= 弹出层类型组件 Start ========= -->

    <!-- 互动功能 -->
    <mobile-iar-render v-if="!isPlaybackWatchUrl" />

    <!-- 连麦挂件 -->
    <mobile-connect-mic-pendant
      v-if="connectMicPendantRenderEnabled"
      v-show="connectMicPendantVisible"
    />

    <!-- 常驻挂件 -->
    <mobile-watch-pendant />

    <!-- 直播开始提示 -->
    <mobile-live-start-tips />

    <!--  取消关联转播提示 -->
    <mobile-transmit-switch-tip />

    <!-- 聊天室连接失败提示 -->
    <mobile-chat-connect-error-dialog />

    <!-- 设置昵称 -->
    <mobile-chat-set-nick v-if="canSetNick" />

    <!-- 切换语言弹层 -->
    <mobile-lang-switch v-if="langSwitchEnabled" />

    <!-- 发送红包弹层 -->
    <mobile-send-redpack v-if="sendRedpackVisible" />

    <!-- 提现申请弹层 -->
    <mobile-withdraw-apply v-if="withdrawVisible" />

    <!-- 提现详情弹层 -->
    <mobile-withdraw-detail v-if="withdrawVisible" />

    <!-- 聊天消息全文弹层 -->
    <mobile-chat-full-message />

    <!-- 更多弹层 -->
    <mobile-more-popup />

    <!-- 打赏弹层 -->
    <mobile-donate-popup v-if="showDonateFunction" />

    <!-- 实名认证弹层 -->
    <mobile-real-name-auth-popup />

    <!-- 邀请明细弹层 -->
    <mobile-invite-detail-popup v-if="inviteDetailEnabled" />

    <!-- 固定的聊天消息输入框 -->
    <mobile-chat-input-controller-fixed v-if="chatInputControllerEnable" />

    <!-- ========= 弹出层类型组件 End ========= -->
  </div>
</template>

<script setup lang="ts">
import MobileLangSwitch from '@/components/common-business/lang-switch/mobile-lang-switch.vue';
import MobileChatConnectErrorDialog from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-dialog/mobile-chat-connect-error-dialog.vue';
import MobileChatFullMessage from '@/components/page-watch-common/chat/chat-full-message/mobile-chat-full-message.vue';
import MobileChatSetNick from '@/components/page-watch-common/chat/chat-set-nick/mobile-chat-set-nick.vue';
import MobileConnectMicPendant from '@/components/page-watch-common/connect-mic/mobile-connect-mic/mobile-connect-mic-pendant.vue';
import MobileIarRender from '@/components/page-watch-common/interactive-receive/mobile-iar-render.vue';
import MobileLiveStartTips from '@/components/page-watch-common/live-start-tips/mobile-live-start-tips.vue';
import MobileTransmitSwitchTip from '@/components/page-watch-common/transmit-switch-tip/mobile-transmit-switch-tip.vue';
import MobileMorePopup from '@/components/page-watch-common/more-popup/mobile-more-popup/mobile-more-popup.vue';
import MobileDonatePopup from '@/components/page-watch-common/donate/donate-panel/mobile-donate-panel/mobile-donate-popup.vue';
import MobileRealNameAuthPopup from '@/components/page-watch-common/real-name-auth/mobile-real-name-auth.vue';
import MobileInviteDetailPopup from '@/components/page-watch-common/invite/mobile-invite-detail/mobile-invite-detail-popup.vue';
import MobileChatInputControllerFixed from '@/components/page-watch-common/chat/chat-input-controller/mobile-chat-input-controller-fixed/mobile-chat-input-controller-fixed.vue';
import { defineAsyncComponent } from 'vue';
import MobileWatchLayout from './layout/mobile-watch-layout.vue';
import MobileWatchPendant from './layout/mobile-watch-pendant.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';

import { usePvTrack } from '@/hooks/business/use-pv-track';
import { useWatchPage } from '@/pages/watch/_hooks/use-watch-page';
import { useLangStore } from '@/store/use-lang-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useChatStore } from '@/store/use-chat-store';

const MobileSendRedpack = defineAsyncComponent(
  () => import('@/components/page-watch-common/send-redpack/mobile-send-redpack.vue'),
);
const MobileWithdrawApply = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "mobile-withdraw-apply" */ '@/components/page-watch-common/withdraw/mobile-withdraw-apply/mobile-withdraw-apply.vue'
    ),
);
const MobileWithdrawDetail = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "mobile-withdraw-detail" */ '@/components/page-watch-common/withdraw/mobile-withdraw-detail/mobile-withdraw-detail.vue'
    ),
);

const { connectMicPendantRenderEnabled, connectMicPendantVisible } =
  storeDefinitionToRefs(useConnectMicStore);

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { sendRedpackVisible } = storeDefinitionToRefs(useRedpackStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { inviteDetailEnabled } = storeDefinitionToRefs(useInviteStore);

const { chatInputControllerEnable } = storeDefinitionToRefs(useChatStore);

useWatchPage();

usePvTrack('saas-web-watch-mobile');
</script>

<style lang="scss">
.c-mobile-watch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
