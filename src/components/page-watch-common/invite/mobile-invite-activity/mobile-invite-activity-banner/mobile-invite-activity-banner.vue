<!-- @file 移动端-邀请有礼活动横幅  -->

<template>
  <div class="c-mobile-invite-activity-banner">
    <!-- 背景图 -->
    <div
      class="c-mobile-invite-activity-banner__bg"
      :class="{
        'c-mobile-invite-activity-banner__bg--zh_cn': isChineseLang,
        'c-mobile-invite-activity-banner__bg--en': !isChineseLang,
      }"
    ></div>
    <!-- 内容区 -->
    <div
      class="c-mobile-invite-activity-banner__content"
      :class="{
        'c-mobile-invite-activity-banner__content--addition-bottom': showBottomBg,
      }"
    >
      <list-loading v-if="loadingVisible" />

      <mobile-invite-activity-count-down
        v-if="inviteActivityStatus === InviteActivityStatus.Processing && !countDownFinished"
        class="c-mobile-invite-activity-banner__content__count-down"
        :end-timestamp="countDownTime"
        @count-down-change="onCountDownChange"
        @count-down-finish="onCountDownFinish"
      />

      <mobile-invite-activity-result
        v-if="inviteActivityStatus === InviteActivityStatus.End && invitePrizeWinnerInfo"
        class="c-mobile-invite-activity-banner__content__activity-result"
      />
    </div>
    <!-- 底部背景图 -->
    <div
      v-if="showBottomBg"
      class="c-mobile-invite-activity-banner__bottom-bg pws-invite-activity-banner__bottom-bg"
    ></div>
    <!-- 奖励挂件 -->
    <div
      class="c-mobile-invite-activity-banner__pendant"
      @click="openDetailPopup"
    >
      <span>{{ $lang('invite.activity.pendant.text') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { appEvents, useEventBusEmitter } from '@/app/app-events';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { InviteActivityStatus } from '@polyv/live-watch-sdk';

import { IRemaining as CountDownSurplusData } from '@utils-ts/countdown';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInviteStore } from '@/store/use-invite-store';
import { useLangStore } from '@/store/use-lang-store';

import ListLoading from '@/components/common-base/list-loading/list-loading.vue';
import MobileInviteActivityCountDown from './mobile-invite-activity-count-down.vue';
import MobileInviteActivityResult from './mobile-invite-activity-result.vue';

defineProps({
  showBottomBg: PropUtils.bool.def(true),
});

const { isChineseLang } = storeDefinitionToRefs(useLangStore);

const inviteStore = useInviteStore();
const { inviteActivityStatus, invitePrizeWinnerInfo } = storeDefinitionToRefs(useInviteStore);

/** 倒计时是否结束 */
const countDownFinished = ref(false);
const countDownTime = computed(() => {
  return inviteStore.inviteActivityInfo.endTime || Date.now();
});

function onCountDownChange(params: CountDownSurplusData) {
  // 剩余倒计时小于 2 分钟
  if (params.totalMsecs < 2 * 60 * 1000) {
    inviteStore.$patch({
      inviteActivityWillEndTipVisible: true,
    });
  }
}

function onCountDownFinish() {
  countDownFinished.value = true;
  inviteStore.$patch({
    inviteActivityWillEndTipVisible: false,
  });
}

const loadingVisible = computed(() => {
  if (inviteActivityStatus.value === InviteActivityStatus.Processing) {
    return countDownFinished.value;
  }

  if (inviteActivityStatus.value === InviteActivityStatus.End) {
    return invitePrizeWinnerInfo.value === null;
  }

  return false;
});

watch(
  () => inviteActivityStatus.value,
  () => {
    if (inviteActivityStatus.value === InviteActivityStatus.End) {
      countDownFinished.value = true;
      inviteStore.$patch({
        inviteActivityWillEndTipVisible: false,
      });
      inviteStore.syncInvitePrizeWinnerInfo();
    }
  },
  {
    immediate: true,
  },
);

const { emitEvent: openDetailPopup } = useEventBusEmitter(
  appEvents.invite.OpenInviteActivityDetailPopup,
);
</script>

<style lang="scss">
$--invite-activity-banner-bg-height: 163px;

.c-mobile-invite-activity-banner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background: #ffebd4;
}

.c-mobile-invite-activity-banner__bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: $--invite-activity-banner-bg-height;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  &--zh_cn {
    background-image: url('../imgs/banner-bg.png');
  }
  &--en {
    background-image: url('../imgs/banner-bg--en.png');
  }
}

.c-mobile-invite-activity-banner__content {
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92%;
  min-height: 50px;
  padding: 0 12px;
  margin-top: $--invite-activity-banner-bg-height;
  background: linear-gradient(180deg, #ffeddd 0%, #fff7ec 100%);
  border: 1px solid #fff;
  border-radius: 8px;
  &--addition-bottom {
    min-height: 70px;
    padding-bottom: 20px;
  }
}
.c-mobile-invite-activity-banner__content__activity-result {
  margin-top: 12px;
  margin-bottom: 12px;
}

.c-mobile-invite-activity-banner__bottom-bg {
  position: absolute;
  bottom: -1px;
  z-index: 3;
  width: 100%;
  height: 48px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.c-mobile-invite-activity-banner__pendant {
  position: absolute;
  top: 30px;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  min-width: 24px;
  height: 30px;
  padding-right: 6px;
  padding-left: 8px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px 0 0 10px;
  > span {
    font-size: 12px;
    color: #fff;
  }
}

@media screen and (max-width: 375px) {
  .c-mobile-invite-activity-banner__bottom-bg {
    height: 42px;
  }
}
</style>
