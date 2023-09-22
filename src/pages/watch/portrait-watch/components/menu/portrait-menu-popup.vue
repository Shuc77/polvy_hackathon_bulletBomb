<!-- @file 竖屏菜单弹层 -->
<template>
  <mobile-popup
    class="c-portrait-menu-popup"
    :visible.sync="menuVisible"
    :theme="PopupTheme.Portrait"
    :use-transition.sync="useTransition"
  >
    <ul class="c-portrait-menu-popup__content">
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
        v-if="interactSetting.watchFeedbackEnabled"
        icon="feedback"
        :text="$lang('interact.feedBack.title')"
        @click="onClickFeedback"
      />

      <!-- 语言切换 -->
      <menu-item
        v-if="langSwitchEnabled"
        icon="language"
        :text="$lang('base.changeLang')"
        @click="onClickLanguageSwitch"
      />

      <!-- 切换双语流 -->
      <menu-item
        v-if="supportLanguageStream"
        icon="stream-track"
        :text="$lang('player.streamTrack')"
        @click="onClickSwitchStream"
      />

      <!-- 修改昵称 -->
      <menu-item
        v-if="canSetNick"
        icon="set-nick"
        :text="$lang('chat.setNick')"
        @click="onClickSetNick"
      />

      <!-- 发送图片 -->
      <!-- <menu-item
        v-if="chatSetting.viewerSendImgEnabled"
        icon="send-image"
        :text="$lang('chat.sendImage')"
        @click="onClickSendImage"
      /> -->

      <!-- 发红包 -->
      <!-- <menu-item
        v-if="sendRedpackVisible"
        icon="send-redpack"
        :text="$lang('redpack.name')"
        @click="onClickSendRedpack"
      /> -->
    </ul>
  </mobile-popup>
</template>

<script setup lang="ts">
/* eslint-disable no-unused-vars */

import { appEvents, eventBus, useEventBusListener } from '@/app/app-events';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PopupTheme } from '@/components/common-base/popup/types';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLangStore } from '@/store/use-lang-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import MenuItem from './portrait-menu-item.vue';

const { visible: menuVisible, setVisible: setMenuVisible } = useSimpleVisible();

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

const donateStore = useDonateStore();
const { donateAnimationVisible, showDonateGifts } = storeToRefs(donateStore);
const { toggleDonateAnimationVisible } = donateStore;

const chatStore = useChatStore();
const { onlySpecialMsg, onlySpecialMsgWidgetVisible } = storeToRefs(chatStore);
const { toggleOnlySpecialMsg } = chatStore;

const playerStore = usePlayerStore();
const { isAudioPlayerMode, supportLanguageStream } = storeToRefs(playerStore);

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { scoreRedpackEnabled, sendRedpackVisible } = storeDefinitionToRefs(useRedpackStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

/** 点击线路切换 */
function onClickLineSetting() {
  closeMenu(false);
  eventBus.$emit(appEvents.portrait.OpenLineSettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击清晰度切换 */
function onClickQualitySetting() {
  closeMenu(false);
  eventBus.$emit(appEvents.portrait.OpenQualitySettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击倍速设置 */
function onClickRateSetting() {
  closeMenu(false);
  eventBus.$emit(appEvents.portrait.OpenRateSettingPopup, {
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
  eventBus.$emit(appEvents.chat.ToSendImage);
  closeMenu();
}

/** 点击发红包 */
function onClickSendRedpack() {
  eventBus.$emit(appEvents.interaction.OpenSendRedpack, true);
  closeMenu();
}

/** 点击积分记录 */
function onClickScoreRecord() {
  eventBus.$emit(appEvents.interaction.OpenScoreRecord, true);
  closeMenu();
}

/** 点击投诉反馈 */
function onClickFeedback() {
  eventBus.$emit(appEvents.interaction.OpenFeedBack, true);
  closeMenu();
}

/** 点击提现 */
function onClickWithdraw() {
  eventBus.$emit(appEvents.withdraw.OpenWithdrawDetail, true);
  closeMenu();
}

/** 点击问答 */
function onClickQuestionAnswer() {
  const viewerStore = useViewerStore();
  const checkResult = viewerStore.checkNeedRealNameAuth();
  if (checkResult) {
    return;
  }

  eventBus.$emit(appEvents.interaction.OpenQuestionAnswer, true);
  closeMenu();
}

/** 点击语言切换 */
function onClickLanguageSwitch() {
  eventBus.$emit(appEvents.global.OpenLanguageSwitch);
  closeMenu();
}

/** 点击修改昵称 */
function onClickSetNick() {
  eventBus.$emit(appEvents.chat.OpenSetNick, true);
  closeMenu();
}

/** 点击延迟模式 */
function onClickLatencySwitch() {
  eventBus.$emit(appEvents.portrait.OpenLatencySwitchPopup, true);
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
  eventBus.$emit(appEvents.portrait.OpenLangStreamPopup, true);
  closeMenu();
}
</script>

<style lang="scss">
.c-portrait-menu-popup__content {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 22px;
}
</style>
