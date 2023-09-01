<!-- @file 竖屏观看页 -->
<template>
  <div
    class="c-portrait-watch"
    :style="wrapStyle"
  >
    <!-- 观看页主体布局 -->
    <portrait-watch-layout />

    <!-- ========= 弹出层类型组件 Start ========= -->

    <!-- 连麦挂件 -->
    <portrait-connect-mic-pendant
      v-if="connectMicPendantRenderEnabled"
      v-show="connectMicPendantVisible"
    />

    <!-- 互动功能 -->
    <portrait-iar-render v-if="!isPlaybackWatchUrl" />

    <!-- 邀请榜弹层 -->
    <portrait-invite-rank-popup v-if="inviteRankEnabled" />

    <!-- 聊天室连接失败提示 -->
    <portrait-chat-connect-error-dialog />

    <!-- 打赏弹层 -->
    <portrait-donate-popup v-if="showDonateFunction" />

    <!-- 提现申请弹层 -->
    <portrait-withdraw-apply v-if="withdrawVisible" />

    <!-- 提现详情弹层 -->
    <portrait-withdraw-detail v-if="withdrawVisible" />

    <!-- 切换语言弹层 -->
    <portrait-lang-switch v-if="langSwitchEnabled" />

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

    <!-- 双语流切换 -->
    <portrait-player-stream-track-popup v-if="supportLanguageStream" />

    <!-- 直播开始提示 -->
    <portrait-live-start-tips />

    <!-- 回放 + 章节弹层 -->
    <portrait-playback-chapter-popup
      v-if="isPlaybacking && (playbackListVisible || chapterVisible)"
    />

    <!-- 实名认证弹层 -->
    <portrait-real-name-auth-popup />

    <!-- 邀请明细弹层 -->
    <portrait-invite-detail-popup />

    <!-- ========= 弹出层类型组件 End ========= -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, unref } from 'vue';
import { CSSProperties } from 'vue/types/jsx';

import PortraitLangSwitch from '@/components/common-business/lang-switch/mobile-lang-switch.vue';
import PortraitChatInputController from '@/components/page-watch-common/chat/chat-input-controller/portrait-chat-input-controller/portrait-chat-input-controller.vue';
import PortraitChatSetNick from '@/components/page-watch-common/chat/chat-set-nick/portrait-chat-set-nick.vue';
import PortraitDonatePopup from '@/components/page-watch-common/donate/donate-panel/portrait-donate-popup/portrait-donate-popup.vue';
import PortraitIarRender from '@/components/page-watch-common/interactive-receive/portrait-iar-render.vue';
import PortraitInviteRankPopup from '@/components/page-watch-common/invite/portrait-invite-rank/portrait-invite-rank.vue';
import PortraitLiveStartTips from '@/components/page-watch-common/live-start-tips/mobile-live-start-tips.vue';
import PortraitMicroActivity from '@/components/page-watch-common/micro-activity/portrait-micro-activity/portrait-micro-activity.vue';
import PortraitWithdrawApply from '@/components/page-watch-common/withdraw/portrait-withdraw-apply/portrait-withdraw-apply.vue';
import PortraitWithdrawDetail from '@/components/page-watch-common/withdraw/portrait-withdraw-detail/portrait-withdraw-detail.vue';
import PortraitPlaybackChapterPopup from '@/pages/watch/portrait-watch/components/playback-chapter-popup/portrait-playback-chapter-popup.vue';
import PortraitRealNameAuthPopup from '@/components/page-watch-common/real-name-auth/mobile-real-name-auth.vue';
import PortraitWatchLayout from './layout/portrait-watch-layout.vue';

import PortraitChatConnectErrorDialog from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-dialog/mobile-chat-connect-error-dialog.vue';
import PortraitChatFullMessage from '@/components/page-watch-common/chat/chat-full-message/portrait-chat-full-message.vue';
import PortraitConnectMicPendant from '@/components/page-watch-common/connect-mic/portrait-connect-mic/portrait-connect-mic-pendant.vue';
import PortraitPlayerControlPopup from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-control-popup.vue';
import PortraitPlayerStreamTrackPopup from '@/components/page-watch-common/player/player-stream-track/portrait-player-stream-track-popup.vue';
import PortraitInviteDetailPopup from '@/components/page-watch-common/invite/mobile-invite-detail/portrait-invite-detail-popup.vue';

import { usePvTrack } from '@/hooks/business/use-pv-track';
import { useWatchPage } from '@/pages/watch/_hooks/use-watch-page';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useLangStore } from '@/store/use-lang-store';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useChatStore } from '@/store/use-chat-store';
import { usePlayerStore } from '@/store/use-player-store';

const themeStore = useThemeStore();
const { portraitPageBgUrl } = storeDefinitionToRefs(useThemeStore);

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { chatInputControllerEnable } = storeDefinitionToRefs(useChatStore);

const { inviteRankEnabled } = storeDefinitionToRefs(useInviteStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { microActivityEnabled } = storeDefinitionToRefs(useMicroActivityStore);

const { connectMicPendantRenderEnabled, connectMicPendantVisible } =
  storeDefinitionToRefs(useConnectMicStore);

const { isPlaybacking, playbackListVisible, chapterVisible } =
  storeDefinitionToRefs(usePlaybackStore);

const { supportLanguageStream } = storeDefinitionToRefs(usePlayerStore);

/** 外层样式 */
const wrapStyle = computed(() => {
  const style: CSSProperties = {};

  if (unref(portraitPageBgUrl)) {
    style.backgroundImage = `url(${unref(portraitPageBgUrl)})`;
    style.backgroundSize = 'cover';
  }

  return style;
});

onMounted(() => {
  /**
   * 由于引导页中多皮肤需要默认引入黑色皮肤
   * 而竖屏观看页中不需要多皮肤，所以这里在进入竖屏观看页时移除多皮肤设置
   * 避免黑色皮肤会覆盖到内部的样式（如商品库、问答）
   */
  themeStore.$patch({
    pageSkin: undefined,
  });
});

useWatchPage();

usePvTrack('saas-web-watch-portrait');
</script>

<style lang="scss">
.c-portrait-watch {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-image: url(./layout/images/portrait-bg.png);
  background-repeat: no-repeat;
  background-size: cover;
}

.c-portrait-watch__carousel-wrap {
  height: 100%;
}
</style>
