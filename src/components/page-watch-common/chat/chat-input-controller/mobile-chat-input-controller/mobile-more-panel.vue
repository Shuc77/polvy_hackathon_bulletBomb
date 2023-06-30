<!-- @file 移动端更多面板 -->
<template>
  <ul class="c-mobile-more-panel pws-mobile-more-panel">
    <!-- 只看主持人 -->
    <more-item
      v-if="onlySpecialMsgWidgetVisible"
      :icon="onlySpecialMsg ? 'look-all' : 'only-special'"
      :text="onlySpecialMsg ? $lang('chat.lookAll') : $lang('chat.onlyHost')"
      @click="onClickOnlySpecialMsg"
    />

    <!-- 发送图片 -->
    <more-item
      v-if="chatSetting.viewerSendImgEnabled"
      icon="send-image"
      :text="$lang('chat.sendImage')"
      @click="onClickSendImage"
    />

    <!-- 发红包 -->
    <more-item
      v-if="sendRedpackVisible"
      icon="send-redpack"
      :text="$lang('redpack.name')"
      @click="onClickSendRedpack"
    />

    <!-- 提现 -->
    <more-item
      v-if="withdrawVisible"
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

    <!-- 中奖记录 -->
    <more-item
      v-if="lotteryWinRecords.length"
      icon="message"
      :text="$lang('base.message')"
      :dotted="hasNotReceivedLottery"
      @click="onClickLotteryRecord"
    />

    <!-- 打赏特效开关 -->
    <more-item
      v-if="showDonateGifts"
      :icon="donateAnimationVisible ? 'show-donate' : 'hide-donate'"
      :text="donateAnimationVisible ? $lang('donate.hideAnimation') : $lang('donate.showAnimation')"
      @click="toggleDonateAnimationVisible"
    />

    <!-- 积分记录 -->
    <more-item
      v-if="scoreRedpackEnabled"
      icon="score"
      :text="$lang('interact.scoreRecord.title')"
      @click="onClickScoreRecord"
    />

    <!-- 投诉反馈 -->
    <more-item
      v-if="interactSetting.watchFeedbackEnabled"
      icon="feedback"
      :text="$lang('interact.feedBack.title')"
      @click="onClickFeedback"
    />
  </ul>
</template>

<script setup lang="ts">
import MoreItem from './mobile-more-item.vue';
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { useChatStore } from '@/store/use-chat-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { storeToRefs } from 'pinia';
import { eventBus, appEvents } from '@/app/app-events';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useLangStore } from '@/store/use-lang-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';

const emit = defineEmits({
  close: emitFunc<void>(),
});

const { announcementFunctionVisible, interactSetting, lotteryWinRecords, hasNotReceivedLottery } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const donateStore = useDonateStore();
const { donateAnimationVisible, showDonateGifts } = storeToRefs(donateStore);
const { toggleDonateAnimationVisible } = donateStore;

const chatStore = useChatStore();
const { onlySpecialMsg, chatSetting, onlySpecialMsgWidgetVisible } = storeToRefs(chatStore);
const { toggleOnlySpecialMsg } = chatStore;

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { sendRedpackVisible, scoreRedpackEnabled } = storeDefinitionToRefs(useRedpackStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

/** 关闭更多 */
function closeMore() {
  emit('close');
}

/** 点击只看主持人 */
function onClickOnlySpecialMsg() {
  toggleOnlySpecialMsg();
  closeMore();
}

/** 点击公告 */
function onClickAnnouncement() {
  eventBus.$emit(appEvents.interaction.OpenAnnouncementList, true);
  closeMore();
}

/** 点击投诉反馈 */
function onClickFeedback() {
  eventBus.$emit(appEvents.interaction.OpenFeedBack, true);
  closeMore();
}

/** 点击积分记录 */
function onClickScoreRecord() {
  eventBus.$emit(appEvents.interaction.OpenScoreRecord, true);
  closeMore();
}

/** 点击修改昵称 */
function onClickSetNick() {
  eventBus.$emit(appEvents.chat.OpenSetNick, true);
  closeMore();
}

/** 点击语言切换 */
function onClickLanguageSwitch() {
  eventBus.$emit(appEvents.global.OpenLanguageSwitch);
  closeMore();
}

/** 点击发红包 */
function onClickSendRedpack() {
  eventBus.$emit(appEvents.interaction.OpenSendRedpack, true);
  closeMore();
}

/** 点击发送图片 */
function onClickSendImage() {
  eventBus.$emit(appEvents.chat.ToSendImage);
  closeMore();
}

/** 点击提现 */
function onClickWithdraw() {
  eventBus.$emit(appEvents.withdraw.OpenWithdrawDetail, true);
  closeMore();
}

/** 点击中奖记录 */
function onClickLotteryRecord() {
  eventBus.$emit(appEvents.interaction.OpenLotteryRecord, true);
  closeMore();
}
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
