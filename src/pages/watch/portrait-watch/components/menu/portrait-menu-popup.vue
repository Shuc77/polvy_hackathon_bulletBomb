<!-- @file 竖屏菜单弹层 -->
<template>
  <mobile-popup
    class="c-portrait-menu-popup"
    :visible.sync="menuVisible"
    :theme="PopupTheme.Portrait"
    :use-transition.sync="useTransition"
  >
    <ul class="c-portrait-menu-popup__content">
      <!-- 个人中心 -->
      <menu-item
        v-if="identitySetting.profileEnabled"
        icon="profile"
        :text="$lang('identitySetting.profile')"
        @click="onClickProfile"
      />

      <!-- 音视频切换 -->
      <menu-item
        v-if="playerModeSwitcherVisible"
        :icon="isAudioPlayerMode ? 'video' : 'audio'"
        :text="isAudioPlayerMode ? $lang('player.mode.video') : $lang('player.mode.audio')"
        @click="onClickPlayMode"
      />

      <!-- 线路设置 -->
      <menu-item
        v-if="lineSettingVisible"
        icon="line-setting"
        :text="$lang('player.lineSetting')"
        @click="onClickLineSetting"
      />

      <!-- 清晰度设置 -->
      <menu-item
        v-if="qualitySettingVisible"
        icon="quality-setting"
        :text="$lang('player.qualitySetting')"
        @click="onClickQualitySetting"
      />

      <!-- 倍速设置 -->
      <menu-item
        v-if="rateSettingVisible"
        icon="rate-setting"
        :text="$lang('player.rate')"
        @click="onClickRateSetting"
      />

      <!-- 延迟模式 -->
      <menu-item
        v-if="latencyModeSettingVisible"
        icon="latency-setting"
        :text="$lang('player.latencyMode.name')"
        @click="onClickLatencySwitch"
      />

      <!-- 提现 -->
      <menu-item
        v-if="withdrawVisible"
        icon="withdraw"
        :text="$lang('withdraw.name')"
        @click="onClickWithdraw"
      />

      <!-- 只看主持人 -->
      <menu-item
        v-if="onlySpecialMsgWidgetVisible"
        :icon="onlySpecialMsg ? 'look-all' : 'only-special'"
        :text="onlySpecialMsg ? $lang('chat.lookAll') : $lang('chat.onlyHost2')"
        @click="onClickOnlySpecialMsg"
      />

      <!-- 打赏特效开关 -->
      <menu-item
        v-if="showDonateGifts"
        :icon="donateAnimationVisible ? 'hide-donate' : 'show-donate'"
        :text="
          donateAnimationVisible ? $lang('donate.hideAnimation') : $lang('donate.showAnimation')
        "
        @click="toggleDonateAnimationVisible"
      />

      <!-- 问答 -->
      <menu-item
        v-if="qaMenuData.visible"
        icon="question-answer"
        :text="$lang('menu.tabName.qa')"
        @click="onClickQuestionAnswer"
      />

      <!-- 积分记录 -->
      <menu-item
        v-if="scoreRedpackEnabled"
        icon="score"
        :text="$lang('interact.scoreRecord.title')"
        @click="onClickScoreRecord"
      />

      <!-- 投诉反馈 -->
      <menu-item
        v-if="feedbackMenuVisible"
        icon="feedback"
        :text="$lang('interact.feedback.title')"
        @click="onClickFeedback"
      />

      <!-- 语言切换 -->
      <menu-item
        v-if="langSwitchEnabled"
        icon="language"
        :text="$lang('base.changeLang')"
        @click="onClickLanguageSwitch"
      />

      <!-- 切换双流/切换流多轨 -->
      <menu-item
        v-if="supportMultiStreamTrack"
        :icon="isMultiLanguageTrack ? 'stream-track' : 'stream-track-normal'"
        :text="
          isMultiLanguageTrack ? $lang('player.streamTrack') : $lang('player.streamTrack.normal')
        "
        @click="onClickSwitchStream"
      />

      <!-- 修改昵称 -->
      <menu-item
        v-if="canSetNick"
        icon="set-nick"
        :text="$lang('chat.setNick')"
        @click="onClickSetNick"
      />

      <!-- 绑定手机号 -->
      <menu-item
        v-if="bindMobileVisible"
        icon="bind-mobile"
        :text="$lang('identityInfo.bindMobile')"
        @click="onClickBindMobile"
      />

      <!-- 任务奖励 -->
      <menu-item
        icon="my-reward"
        :text="$lang('taskActivity.myReward')"
        @click="onClickMyReward"
      />

      <!-- 小窗播放 -->
      <menu-item
        v-if="pictureInPictureEnabled"
        icon="pip"
        :text="$lang('player.pictureInPicture.title')"
        @click="onClickPIP"
      />

      <!-- 播放设置 -->
      <menu-item
        v-if="pictureInPictureEnabled"
        icon="playback-setting"
        :text="$lang('player.pictureInPicture.playbackSetting')"
        @click="onClickPlaybackSetting"
      />

      <!-- 发送图片 -->
      <menu-item
        v-if="chatSetting.viewerSendImgEnabled"
        icon="send-image"
        :text="$lang('chat.sendImage')"
        @click="onClickSendImage"
      />

      <!-- 发红包 -->
      <!-- <menu-item
        v-if="sendRedpackVisible"
        icon="send-redpack"
        :text="$lang('redpack.name')"
        @click="onClickSendRedpack"
      /> -->

      <!-- 优惠券 -->
      <menu-item
        v-if="couponPendantVisible"
        icon="coupon"
        :text="$lang('interact.coupon.title')"
        @click="onClickCoupon"
      />
    </ul>
  </mobile-popup>
</template>

<script setup lang="ts">
/* eslint-disable no-unused-vars */

import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PopupTheme } from '@/components/common-base/popup/types';
import { useDonateAnimationVisible } from '@/components/page-watch-common/donate/donate-animation/use-donate-animation';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { useStreamTrack } from '@/components/page-watch-common/player/player-stream-track/use-stream-track';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLangStore } from '@/store/use-lang-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { storeToRefs } from 'pinia';
import { useWebviewStore } from '@/store/use-webview-store';
import { ref, watch } from 'vue';
import MenuItem from './portrait-menu-item.vue';

const { visible: menuVisible, setVisible: setMenuVisible } = useSimpleVisible();

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const {
  lineSettingVisible,
  qualitySettingVisible,
  rateSettingVisible,
  latencyModeSettingVisible,
  playerModeSwitcherVisible,
} = usePlayerControl();

const useTransition = ref(true);

/** 关闭弹层 */
function closeMenu(_useTransition = true) {
  useTransition.value = _useTransition;
  setMenuVisible(false);
}

useEventBusListener(
  appEvents.portrait.OpenMenuPopup,
  (params: { _visible?: boolean; _useTransition: boolean }) => {
    const { _visible = true, _useTransition = true } = params;
    useTransition.value = _useTransition;
    setMenuVisible(_visible);
  },
);

const { supportMultiStreamTrack } = storeToRefs(useChannelStore());
const { isMultiLanguageTrack } = useStreamTrack();

const donateStore = useDonateStore();
const { donateAnimationVisible, showDonateGifts } = storeToRefs(donateStore);
const { toggleDonateAnimationVisible } = useDonateAnimationVisible();

const chatStore = useChatStore();
const { onlySpecialMsg, onlySpecialMsgWidgetVisible } = storeToRefs(chatStore);
const { toggleOnlySpecialMsg } = chatStore;

const playerStore = usePlayerStore();
const { isAudioPlayerMode } = storeToRefs(playerStore);

const { feedbackMenuVisible, couponPendantVisible } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { scoreRedpackEnabled, sendRedpackVisible } = storeDefinitionToRefs(useRedpackStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { identitySetting, bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);

const { getEmitter, getWatchCore } = useGlobalInject();

const { toSmallWindow } = useWebviewStore();

const { isSmallWindow, pictureInPictureEnabled } = storeDefinitionToRefs(useWebviewStore);

const watchCore = getWatchCore();

function onClickProfile() {
  const url = watchCore.utils.generateProfilePageUrl();
  if (url) {
    window.open(url, '_blank');
  }

  closeMenu();
}

/** 点击线路切换 */
function onClickLineSetting() {
  closeMenu(false);
  getEmitter().emit(appEvents.portrait.OpenLineSettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击清晰度切换 */
function onClickQualitySetting() {
  closeMenu(false);
  getEmitter().emit(appEvents.portrait.OpenQualitySettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击倍速设置 */
function onClickRateSetting() {
  closeMenu(false);
  getEmitter().emit(appEvents.portrait.OpenRateSettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击只看主持人 */
function onClickOnlySpecialMsg() {
  toggleOnlySpecialMsg();
  closeMenu();
}

/** 点击发送图片 */
function onClickSendImage() {
  getEmitter().emit(appEvents.chat.ToSendImage);
  closeMenu();
}

/** 点击发红包 */
function onClickSendRedpack() {
  getEmitter().emit(appEvents.interaction.OpenSendRedpack, true);
  closeMenu();
}

/** 点击积分记录 */
function onClickScoreRecord() {
  getEmitter().emit(appEvents.interaction.OpenScoreRecord, true);
  closeMenu();
}

/** 点击投诉反馈 */
function onClickFeedback() {
  getEmitter().emit(appEvents.interaction.OpenFeedback, true);
  closeMenu();
}

/** 点击提现 */
function onClickWithdraw() {
  getEmitter().emit(appEvents.withdraw.OpenWithdrawDetail, true);
  closeMenu();
}

/** 点击问答 */
function onClickQuestionAnswer() {
  const viewerStore = useViewerStore();
  const checkResult = viewerStore.checkNeedRealNameAuth();
  if (checkResult) {
    return;
  }

  getEmitter().emit(appEvents.interaction.OpenQuestionAnswer, true);
  closeMenu();
}

/** 点击语言切换 */
function onClickLanguageSwitch() {
  getEmitter().emit(appEvents.global.OpenLanguageSwitch);
  closeMenu();
}

/** 点击修改昵称 */
function onClickSetNick() {
  getEmitter().emit(appEvents.chat.OpenSetNick, true);
  closeMenu();
}

/** 点击延迟模式 */
function onClickLatencySwitch() {
  getEmitter().emit(appEvents.portrait.OpenLatencySwitchPopup, true);
  closeMenu();
}

/** 点击播放模式 */
function onClickPlayMode() {
  playerStore.$patch({
    isAudioPlayerMode: !playerStore.isAudioPlayerMode,
  });
  closeMenu();
}

/** 点击切换语言流 */
function onClickSwitchStream() {
  getEmitter().emit(appEvents.portrait.OpenLangStreamPopup, true);
  closeMenu();
}

/** 点击绑定手机号 */
function onClickBindMobile() {
  getEmitter().emit(appEvents.global.OpenBindIdentityInfoDialog, true);
  closeMenu();
}

/** 点击我的奖励 */
function onClickMyReward() {
  getEmitter().emit(appEvents.global.OpenPersonalRewardDialog);
  closeMenu();
}

/** 点击小窗播放 */
function onClickPIP() {
  toSmallWindow();
}

/** 点击播放设置 */
function onClickPlaybackSetting() {
  closeMenu(false);
  getEmitter().emit(appEvents.global.PlaybackSettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击优惠券 */
function onClickCoupon() {
  getEmitter().emit(appEvents.interaction.OpenCouponUserList, true);
  closeMenu();
}

watch(isSmallWindow, (pip: boolean) => {
  if (pip) closeMenu();
});
</script>

<style lang="scss">
.c-portrait-menu-popup__content {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 22px;
}
</style>
