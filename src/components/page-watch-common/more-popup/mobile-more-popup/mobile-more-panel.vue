<!-- @file 移动端更多面板 -->
<template>
  <ul class="c-mobile-more-panel pws-mobile-more-panel">
    <!-- 个人中心 -->
    <more-item
      v-if="identitySetting.profileEnabled"
      icon="profile"
      :text="$lang('identitySetting.profile')"
      @click="onClickProfile"
    />

    <!-- 只看主持人 -->
    <more-item
      v-if="onlySpecialMsgWidgetVisible && chatMenuData.visible"
      :icon="onlySpecialMsg ? 'look-all' : 'only-special'"
      :text="onlySpecialMsg ? $lang('chat.lookAll') : $lang('chat.onlyHost')"
      @click="onClickOnlySpecialMsg"
    />

    <!-- 发送图片 -->
    <more-item
      v-if="chatSetting.viewerSendImgEnabled && chatMenuData.visible"
      icon="send-image"
      :text="$lang('chat.sendImage')"
      @click="onClickSendImage"
    />

    <!-- 发红包 -->
    <more-item
      v-if="sendRedpackVisible && chatMenuData.visible"
      icon="send-redpack"
      :text="$lang('redpack.name')"
      @click="onClickSendRedpack"
    />

    <!-- 提现 -->
    <more-item
      v-if="withdrawVisible && chatMenuData.visible"
      icon="withdraw"
      :text="$lang('withdraw.name')"
      @click="onClickWithdraw"
    />

    <!-- 公告 -->
    <more-item
      v-if="announcementFunctionVisible"
      icon="announcement"
      :text="$lang('interact.announcement.title')"
      @click="onClickAnnouncement"
    />

    <!-- 语言切换 -->
    <more-item
      v-if="langSwitchEnabled"
      icon="language"
      :text="$lang('base.changeLang')"
      @click="onClickLanguageSwitch"
    />

    <!-- 修改昵称 -->
    <more-item
      v-if="canSetNick"
      icon="set-nick"
      :text="$lang('chat.setNick')"
      @click="onClickSetNick"
    />

    <!-- 任务奖励 -->
    <more-item
      icon="my-reward"
      :text="$lang('taskActivity.myReward')"
      @click="onClickMyReward"
    />

    <!-- 积分记录 -->
    <more-item
      v-if="scoreRedpackEnabled && chatMenuData.visible"
      icon="score"
      :text="$lang('interact.scoreRecord.title')"
      @click="onClickScoreRecord"
    />

    <!-- 打赏特效开关 -->
    <more-item
      v-if="showDonateGifts && chatMenuData.visible"
      :icon="donateAnimationVisible ? 'show-donate' : 'hide-donate'"
      :text="donateAnimationVisible ? $lang('donate.hideAnimation') : $lang('donate.showAnimation')"
      @click="toggleDonateAnimationVisible"
    />

    <!-- 投诉反馈 -->
    <more-item
      v-if="feedbackMenuVisible"
      icon="feedback"
      :text="$lang('interact.feedback.title')"
      @click="onClickFeedback"
    />

    <!-- 绑定手机号 -->
    <more-item
      v-if="bindMobileVisible"
      icon="bind-mobile"
      :text="$lang('identityInfo.bindMobile')"
      @click="onClickBindMobile"
    />

    <!-- 小窗播放 -->
    <more-item
      v-if="pictureInPictureEnabled"
      icon="pip"
      :text="$lang('player.pictureInPicture.title')"
      @click="onClickPIP"
    />

    <!-- 播放设置 -->
    <more-item
      v-if="pictureInPictureEnabled"
      icon="playback-setting"
      :text="$lang('player.pictureInPicture.playbackSetting')"
      @click="onClickPlaybackSetting"
    />

    <!-- 优惠券 -->
    <more-item
      v-if="couponPendantVisible"
      icon="coupon"
      :text="$lang('interact.coupon.title')"
      @click="onClickCoupon"
    />
  </ul>
</template>

<script setup lang="ts">
import MoreItem from './mobile-more-item.vue';
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { useChatStore } from '@/store/use-chat-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { storeToRefs } from 'pinia';
import { appEvents } from '@/app/app-events';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useLangStore } from '@/store/use-lang-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { useDonateAnimationVisible } from '@/components/page-watch-common/donate/donate-animation/use-donate-animation';
import { useWebviewStore } from '@/store/use-webview-store';
import { watch } from 'vue';

const emit = defineEmits({
  close: emitFunc<void>(),
});

const { getEmitter, getWatchCore } = useGlobalInject();

const { announcementFunctionVisible, feedbackMenuVisible, couponPendantVisible } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const donateStore = useDonateStore();
const { donateAnimationVisible, showDonateGifts } = storeToRefs(donateStore);
const { toggleDonateAnimationVisible } = useDonateAnimationVisible();

const chatStore = useChatStore();
const { onlySpecialMsg, chatSetting, onlySpecialMsgWidgetVisible } = storeToRefs(chatStore);
const { toggleOnlySpecialMsg } = chatStore;

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { sendRedpackVisible, scoreRedpackEnabled } = storeDefinitionToRefs(useRedpackStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { identitySetting, bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);

const { toSmallWindow } = useWebviewStore();

const { isSmallWindow, pictureInPictureEnabled } = storeDefinitionToRefs(useWebviewStore);

const watchCore = getWatchCore();

/** 关闭更多 */
function closeMore() {
  emit('close');
}

/** 点击"个人中心" */
function onClickProfile() {
  const url = watchCore.utils.generateProfilePageUrl();
  if (url) {
    window.open(url, '_blank');
  }

  closeMore();
}

/** 点击只看主持人 */
function onClickOnlySpecialMsg() {
  toggleOnlySpecialMsg();
  closeMore();
}

/** 点击公告 */
function onClickAnnouncement() {
  getEmitter().emit(appEvents.interaction.OpenAnnouncementList, true);
  closeMore();
}

/** 点击投诉反馈 */
function onClickFeedback() {
  getEmitter().emit(appEvents.interaction.OpenFeedback, true);
  closeMore();
}

/** 点击积分记录 */
function onClickScoreRecord() {
  getEmitter().emit(appEvents.interaction.OpenScoreRecord, true);
  closeMore();
}

/** 点击修改昵称 */
function onClickSetNick() {
  getEmitter().emit(appEvents.chat.OpenSetNick, true);
  closeMore();
}

/** 点击语言切换 */
function onClickLanguageSwitch() {
  getEmitter().emit(appEvents.global.OpenLanguageSwitch);
  closeMore();
}

/** 点击发红包 */
function onClickSendRedpack() {
  getEmitter().emit(appEvents.interaction.OpenSendRedpack, true);
  closeMore();
}

/** 点击发送图片 */
function onClickSendImage() {
  const viewerStore = useViewerStore();
  const checkRealName = viewerStore.checkNeedRealNameAuth();
  if (checkRealName) {
    return;
  }

  getEmitter().emit(appEvents.chat.ToSendImage);
  closeMore();
}

/** 点击提现 */
function onClickWithdraw() {
  getEmitter().emit(appEvents.withdraw.OpenWithdrawDetail, true);
  closeMore();
}

/** 点击绑定手机号 */
function onClickBindMobile() {
  getEmitter().emit(appEvents.global.OpenBindIdentityInfoDialog, true);
  closeMore();
}

/** 点击任务奖励 */
function onClickMyReward() {
  getEmitter().emit(appEvents.global.OpenPersonalRewardDialog);
  closeMore();
}

/** 点击小窗播放 */
function onClickPIP() {
  toSmallWindow();
}

/** 点击播放设置 */
function onClickPlaybackSetting() {
  getEmitter().emit(appEvents.global.PlaybackSettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击优惠券 */
function onClickCoupon() {
  getEmitter().emit(appEvents.interaction.OpenCouponUserList, true);
  closeMore();
}

watch(isSmallWindow, pip => {
  if (pip) closeMore();
});
</script>

<style lang="scss">
.c-mobile-more-panel {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  max-height: 280px;
  padding: 0 24px 30px;
  overflow-y: auto;
  border-radius: 8px 8px 0 0;
}
</style>
