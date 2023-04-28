<!-- @file 竖屏观看页 -->
<template>
  <div
    class="c-portrait-watch"
    :style="wrapStyle"
  >
    <!-- 观看页主体布局 -->
    <portrait-watch-layout />

    <!-- ========= 弹出层类型组件 Start ========= -->

    <!-- 互动功能 -->
    <portrait-iar-render v-if="!isWatchBackUrl" />

    <!-- 邀请榜弹层 -->
    <portrait-invite-rank-popup v-if="inviteRankEnabled" />

    <!-- 聊天室连接失败提示 -->
    <portrait-chat-connect-error-dialog />

    <!-- 打赏弹层 -->
    <portrait-donate-popup v-if="showDonateFunction" />

    <!-- 提现申请弹层 -->
    <portrait-withdraw-apply v-if="withdrawEnabled" />

    <!-- 提现详情弹层 -->
    <portrait-withdraw-detail v-if="withdrawEnabled" />

    <!-- 切换语言弹层 -->
    <portrait-lang-switch v-if="langSwitchEnabled" />

    <!-- 微活动弹层 -->
    <portrait-micro-activity v-if="microActivityEnabled" />

    <!-- 设置昵称 -->
    <portrait-chat-set-nick v-if="canSetNick" />

    <!-- 聊天室消息输入框 -->
    <portrait-chat-input-controller />

    <!-- 聊天消息全文弹层 -->
    <portrait-chat-full-message />

    <!-- 播放器设置弹层 -->
    <portrait-player-control-popup />

    <!-- 直播开始提示 -->
    <portrait-live-start-tips />

    <!-- 回放 + 章节弹层 -->
    <portrait-playback-chapter-popup
      v-if="isPlaybacking && (playbackListVisible || chapterEnabled)"
    />

    <!-- ========= 弹出层类型组件 End ========= -->
  </div>
</template>

<script setup lang="ts">
import PortraitWatchLayout from './layout/portrait-watch-layout.vue';
import PortraitIarRender from '@/components/page-watch-common/interactive-receive/portrait-iar-render.vue';
import PortraitInviteRankPopup from '@/components/page-watch-common/invite/portrait-invite-rank/portrait-invite-rank.vue';
import PortraitDonatePopup from '@/components/page-watch-common/donate/donate-panel/portrait-donate-popup/portrait-donate-popup.vue';
import PortraitWithdrawApply from '@/components/page-watch-common/withdraw/portrait-withdraw-apply/portrait-withdraw-apply.vue';
import PortraitWithdrawDetail from '@/components/page-watch-common/withdraw/portrait-withdraw-detail/portrait-withdraw-detail.vue';
import PortraitLangSwitch from '@/components/common-business/lang-switch/mobile-lang-switch.vue';
import PortraitMicroActivity from '@/components/page-watch-common/micro-activity/portrait-micro-activity/portrait-micro-activity.vue';
import PortraitChatSetNick from '@/components/page-watch-common/chat/chat-set-nick/portrait-chat-set-nick.vue';
import PortraitChatInputController from '@/components/page-watch-common/chat/chat-input-controller/portrait-chat-input-controller/portrait-chat-input-controller.vue';
import PortraitPlaybackChapterPopup from '@/pages/watch/portrait-watch/components/playback-chapter-popup/portrait-playback-chapter-popup.vue';
import PortraitLiveStartTips from '@/components/page-watch-common/live-start-tips/mobile-live-start-tips.vue';

import PortraitChatFullMessage from '@/components/page-watch-common/chat/chat-full-message/portrait-chat-full-message.vue';
import PortraitChatConnectErrorDialog from '@/components/page-watch-common/chat/chat-connect-error/mobile-chat-connect-error-dialog.vue';
import PortraitPlayerControlPopup from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-control-popup.vue';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { computed, onMounted, unref } from 'vue';
import { CSSProperties } from 'vue/types/jsx';
import { usePageStore } from '@/store/use-page-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useWithdraw } from '@/components/page-watch-common/withdraw/use-withdraw';
import { useLangStore } from '@/store/use-lang-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useWatchPage } from '@/pages/watch/_hooks/use-watch-page';
import { storeToRefs } from 'pinia';
import { usePvTrack } from '@/hooks/business/use-pv-track';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';

const pageStore = usePageStore();
const { pageClientHeight } = storeToRefs(pageStore);

const { portraitPageBgUrl } = storeDefinitionToRefs(usePortraitLayoutStore);

const { isWatchBackUrl } = storeDefinitionToRefs(useWatchAppStore);

const { inviteRankEnabled } = storeDefinitionToRefs(useInviteStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { withdrawEnabled } = useWithdraw();

const { microActivityEnabled } = storeDefinitionToRefs(useMicroActivityStore);

const { isPlaybacking, playbackListVisible, chapterEnabled } =
  storeDefinitionToRefs(usePlaybackStore);

/** 外层样式 */
const wrapStyle = computed(() => {
  const style: CSSProperties = {
    height: `${pageClientHeight.value}px`,
  };

  if (unref(portraitPageBgUrl)) {
    style.backgroundImage = `url(${unref(portraitPageBgUrl)})`;
    style.backgroundSize = 'cover';
  }

  return style;
});

useWindowResizeListener(() => {
  pageStore.resetUpPageSize();
}, true);

onMounted(() => {
  /**
   * 由于引导页中多皮肤需要默认引入黑色皮肤
   * 而竖屏观看页中不需要多皮肤，所以这里在进入竖屏观看页时移除多皮肤设置
   * 避免黑色皮肤会覆盖到内部的样式（如商品库、问答）
   */
  pageStore.$patch({
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
