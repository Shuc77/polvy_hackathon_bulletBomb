<!-- @file 移动端横屏-延迟加载的弹出层类型组件 -->

<template>
  <div class="c-mobile-watch-layout-lazyload">
    <!-- 互动功能 -->
    <mobile-iar-render v-if="!isPlaybackWatchUrl && iarSdkLoaded" />

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

    <template v-if="inviteActivityEnabled">
      <!-- 邀请有礼活动详情弹窗 -->
      <mobile-invite-activity-detail-popup />
      <!-- 邀请有礼中奖领取弹窗 -->
      <mobile-invite-prize-receive-popup />
    </template>

    <!-- 固定的聊天消息输入框 -->
    <mobile-chat-input-controller-fixed v-if="chatInputControllerEnable" />

    <!-- 绑定用户身份信息弹层 -->
    <mobile-bind-identity-info-popup v-if="bindMobileVisible" />

    <!-- 任务奖励弹层 -->
    <mobile-task-reward-popup />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import MobileWatchPendant from './mobile-watch-pendant.vue';
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
import MobileInviteActivityDetailPopup from '@/components/page-watch-common/invite/mobile-invite-activity/mobile-invite-activity-detail-popup/mobile-invite-activity-detail-popup.vue';
import MobileInvitePrizeReceivePopup from '@/components/page-watch-common/invite/mobile-invite-activity/mobile-invite-prize-receive-popup/mobile-invite-prize-receive-popup.vue';
import MobileChatInputControllerFixed from '@/components/page-watch-common/chat/chat-input-controller/mobile-chat-input-controller-fixed/mobile-chat-input-controller-fixed.vue';
import MobileBindIdentityInfoPopup from '@/components/common-business/bind-identity-info/mobile-bind-identity-info.vue';
import MobileTaskRewardPopup from '@/components/page-watch-common/task-activity/mobile-task-reward-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';

import { useLangStore } from '@/store/use-lang-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useIdentityStore } from '@/store/use-identity-store';

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

const { inviteDetailEnabled, inviteActivityEnabled } = storeDefinitionToRefs(useInviteStore);

const { chatInputControllerEnable } = storeDefinitionToRefs(useChatStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);
</script>
