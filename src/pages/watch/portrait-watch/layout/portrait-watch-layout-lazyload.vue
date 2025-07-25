<!-- @file 移动端竖屏-延迟加载的弹出层类型组件 -->

<template>
  <div class="c-portrait-watch-layout-lazyload">
    <!-- 连麦挂件 -->
    <portrait-connect-mic-pendant
      v-if="connectMicPendantRenderEnabled"
      v-show="connectMicPendantVisible"
    />

    <!-- 互动功能 -->
    <portrait-iar-render v-if="iarSdkLoaded" />
    <portrait-iar-render-v2 v-if="!isPlaybackWatchUrl && iarSdkLoaded" />
    <portrait-product-render v-if="!isPlaybackWatchUrl && iarSdkLoaded" />

    <!-- 邀请榜弹层 -->
    <portrait-invite-rank-popup v-if="inviteRankEnabled" />

    <!-- 聊天室连接失败提示 -->
    <mobile-chat-connect-error-dialog />

    <!-- 打赏弹层 -->
    <mobile-donate-popup v-if="showDonateFunction" />

    <!-- 提现申请弹层 -->
    <mobile-withdraw-apply v-if="withdrawVisible" />

    <!-- 提现详情弹层 -->
    <mobile-withdraw-detail v-if="withdrawVisible" />

    <!-- 切换语言弹层 -->
    <mobile-lang-switch v-if="langSwitchEnabled" />

    <!-- 微活动弹层 -->
    <portrait-micro-activity v-if="microActivityEnabled" />

    <!-- 设置昵称 -->
    <portrait-chat-set-nick v-if="canSetNick" />

    <!-- 聊天室消息输入框 -->
    <portrait-chat-input-controller v-if="chatInputControllerEnable" />

    <!-- 聊天消息全文弹层 -->
    <portrait-chat-full-message />

    <!-- 播放器设置弹层 -->
    <portrait-player-control-popup />

    <!-- 流多轨切换 -->
    <portrait-player-stream-track-popup v-if="supportMultiStreamTrack" />

    <!-- 直播开始提示 -->
    <mobile-live-start-tips />

    <!--  取消关联转播提示 -->
    <mobile-transmit-switch-tip />

    <!-- 回放 + 章节弹层 -->
    <portrait-playback-chapter-popup
      v-if="isPlaybacking && (playbackListVisible || chapterVisible)"
    />

    <!-- 实名认证弹层 -->
    <mobile-real-name-auth-popup />

    <!-- 邀请明细弹层 -->
    <portrait-invite-detail-popup v-if="inviteDetailEnabled" />

    <template v-if="inviteActivityEnabled">
      <!-- 邀请有礼活动详情弹窗 -->
      <mobile-invite-activity-detail-popup />
      <!-- 邀请有礼中奖领取弹窗 -->
      <mobile-invite-prize-receive-popup />
    </template>

    <!-- 绑定用户身份信息弹层 -->
    <mobile-identity-collect-info-dialog v-if="bindMobileVisible" />

    <!-- 任务奖励领取弹层 -->
    <mobile-task-reward-receive-popup />

    <!-- 任务完成弹层 -->
    <mobile-task-activity-finish-dialog />

    <!-- 在线用户列表弹层 -->
    <portrait-member-list-popup />

    <!-- 在线用户列表规则弹层 -->
    <mobile-member-list-rule-popup />

    <!-- 播放设置弹层 -->
    <portrait-player-playback-setting />

    <!-- 多会场弹层 -->
    <portrait-multi-meeting-popup v-if="multiMeetingEnabled" />

    <!-- 我的奖励弹层 -->
    <mobile-personal-reward-popup />
  </div>
</template>

<script setup lang="ts">
import MobileLangSwitch from '@/components/common-business/lang-switch/mobile-lang-switch.vue';
import PortraitChatInputController from '@/components/page-watch-common/chat/chat-input-controller/portrait-chat-input-controller/portrait-chat-input-controller.vue';
import PortraitChatSetNick from '@/components/page-watch-common/chat/chat-set-nick/portrait-chat-set-nick.vue';
import MobileDonatePopup from '@/components/page-watch-common/donate/donate-panel/mobile-donate-panel/mobile-donate-popup.vue';
import PortraitIarRender from '@/components/page-watch-common/interactive-receive/portrait-iar-render.vue';
import PortraitIarRenderV2 from '@/components/page-watch-common/interactive-receive-v2/portrait-iar-render-v2.vue';
import PortraitProductRender from '@/components/page-watch-common/product/portrait-product-render.vue';
import PortraitInviteRankPopup from '@/components/page-watch-common/invite/portrait-invite-rank/portrait-invite-rank.vue';
import MobileLiveStartTips from '@/components/page-watch-common/live-start-tips/mobile-live-start-tips.vue';
import MobileTransmitSwitchTip from '@/components/page-watch-common/transmit-switch-tip/mobile-transmit-switch-tip.vue';
import PortraitMicroActivity from '@/components/page-watch-common/micro-activity/portrait-micro-activity/portrait-micro-activity.vue';
import MobileWithdrawApply from '@/components/page-watch-common/withdraw/mobile-withdraw-apply/mobile-withdraw-apply.vue';
import MobileWithdrawDetail from '@/components/page-watch-common/withdraw/mobile-withdraw-detail/mobile-withdraw-detail.vue';
import PortraitPlaybackChapterPopup from '@/pages/watch/portrait-watch/components/playback-chapter-popup/portrait-playback-chapter-popup.vue';
import MobileRealNameAuthPopup from '@/components/page-watch-common/real-name-auth/mobile-real-name-auth.vue';
import MobileIdentityCollectInfoDialog from '@/components/common-business/identity-collect-info-dialog/mobile-identity-collect-info-dialog.vue';

import MobileChatConnectErrorDialog from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-dialog/mobile-chat-connect-error-dialog.vue';
import PortraitChatFullMessage from '@/components/page-watch-common/chat/chat-full-message/portrait-chat-full-message.vue';
import PortraitConnectMicPendant from '@/components/page-watch-common/connect-mic/portrait-connect-mic/portrait-connect-mic-pendant.vue';
import PortraitPlayerControlPopup from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-control-popup.vue';
import PortraitPlayerStreamTrackPopup from '@/components/page-watch-common/player/player-stream-track/portrait-player-stream-track-popup.vue';
import PortraitInviteDetailPopup from '@/components/page-watch-common/invite/mobile-invite-detail/mobile-invite-detail-popup.vue';
import MobileInviteActivityDetailPopup from '@/components/page-watch-common/invite/mobile-invite-activity/mobile-invite-activity-detail-popup/mobile-invite-activity-detail-popup.vue';
import MobileInvitePrizeReceivePopup from '@/components/page-watch-common/invite/mobile-invite-activity/mobile-invite-prize-receive-popup/mobile-invite-prize-receive-popup.vue';
import MobileTaskRewardReceivePopup from '@/components/page-watch-common/task-activity/mobile-task-reward-receive.vue';
import MobileTaskActivityFinishDialog from '@/components/page-watch-common/task-activity/mobile-task-activity-finish.vue';
import PortraitMemberListPopup from '@/components/page-watch-common/member-list/portrait-member-list.vue';
import MobileMemberListRulePopup from '@/components/page-watch-common/member-list/member-list-rule.vue';
import portraitPlayerPlaybackSetting from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-playback-setting.vue';
import PortraitMultiMeetingPopup from '@/components/page-watch-common/multi-meeting/portrait-multi-meeting/portrait-multi-meeting-popup.vue';
import MobilePersonalRewardPopup from '@/components/page-watch-common/personal-reward/mobile-personal-reward-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useLangStore } from '@/store/use-lang-store';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { chatInputControllerEnable } = storeDefinitionToRefs(useChatStore);

const { inviteRankEnabled, inviteDetailEnabled, inviteActivityEnabled } =
  storeDefinitionToRefs(useInviteStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { microActivityEnabled } = storeDefinitionToRefs(useMicroActivityStore);

const { connectMicPendantRenderEnabled, connectMicPendantVisible } =
  storeDefinitionToRefs(useConnectMicStore);

const { isPlaybacking, playbackListVisible, chapterVisible } =
  storeDefinitionToRefs(usePlaybackStore);

const { supportMultiStreamTrack } = storeDefinitionToRefs(useChannelStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);

const { multiMeetingEnabled } = storeDefinitionToRefs(useMultiMeetingStore);
</script>
