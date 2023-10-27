<!-- @file 移动端直播预约按钮 -->
<template>
  <div
    class="c-mobile-live-booking-button"
    :class="{
      'c-mobile-live-booking-button--booked': isLiveBooking,
      'c-mobile-live-booking-button--splash': buttonPosition === 'splash',
      'c-mobile-live-booking-button--player': buttonPosition === 'player',
      'c-mobile-live-booking-button--corner': buttonPosition === 'corner',
    }"
  >
    <normal-button
      class="c-mobile-live-booking-button__button pws-mobile-live-booking-button"
      :size="buttonSize"
      :type="buttonType"
      block
      @click="onClickButton"
    >
      <div class="c-mobile-live-booking-button__button__top">
        <mobile-icon-booking
          v-if="!isLiveBooking"
          class="c-mobile-live-booking-button__button__top__icon"
        />
        <span>{{ buttonText }}</span>
      </div>
      <div
        v-if="isShowBookingCount"
        class="c-mobile-live-booking-button__button__bottom"
      >
        {{ wxBookingCount }} {{ $lang('base.people') }}
      </div>
    </normal-button>

    <!-- 短信预约表单弹层 -->
    <mobile-live-booking-form-popup ref="bookingFormRef" />

    <!-- 关注公众号弹层 -->
    <mobile-live-booking-subscribe-popup ref="subscribeRef" />

    <!-- 取消微信预约提示弹层 -->
    <mobile-message-box
      ref="bookingCancelTipsRef"
      content-center
      :title="$lang('base.warmTips')"
      :content="$lang('liveBooking.cancel.tips')"
      :confirm-button-text="$lang('base.confirm')"
      :cancel-button-text="$lang('base.cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import { translate } from '@/assets/lang';
import { computed, ref, unref } from 'vue';
import { PropUtils, useProps } from '@/assets/utils/vue-utils/props-utils';

import { MobileIconBooking } from '@/components/component-icons/mobile/map';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import MobileLiveBookingFormPopup from './mobile-live-booking-form-popup.vue';
import MobileLiveBookingSubscribePopup from './mobile-live-booking-subscribe-popup.vue';
import MobileMessageBox from '@/components/common-base/message-box/mobile-message-box.vue';
import { MessageBoxInstance } from '@/components/common-base/message-box/use-message-box';

import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useLiveBookingWx } from './hooks/use-live-booking-wx';
import { LiveBookingFormInstance } from './types';

const { trackUserReservationLive } = useWatchEventTrack();

const props = defineProps({
  /** 按钮使用的位置，splash-引导页（默认），player-播放器，corner-播放器角落 */
  buttonPosition: PropUtils.oneOf(['splash', 'player', 'corner'] as const).def('splash'),
  /** 按钮类型 */
  buttonType: PropUtils.enum<ButtonType>().def(ButtonType.Primary),
});

const { buttonPosition } = useProps(props);

const { subscribeRef, wxSubmitLiveBooking, wxCancelLiveBooking } = useLiveBookingWx();

const { isLiveBooking, wxBookingCount, useWxBooking, wxBookingCountVisible } =
  storeDefinitionToRefs(useLiveBookingStore);

/** 按钮尺寸 */
const buttonSize = computed(() => {
  if (unref(buttonPosition) === 'corner') {
    return ButtonSize.XMini;
  }
  return ButtonSize.Default;
});

/** 按钮文本 */
const buttonText = computed(() => {
  if (unref(isLiveBooking)) {
    return translate('liveBooking.booked');
  }

  let text = translate('liveBooking.bookLive');

  switch (unref(buttonPosition)) {
    case 'splash':
      text = translate('liveBooking.book');
      break;
    case 'player':
      text = translate('liveBooking.bookLive');
      break;
    case 'corner':
      text = translate('liveBooking.book');
      break;
  }

  return text;
});

/** 是否展示预约人数 */
const isShowBookingCount = computed(() => {
  if (unref(buttonPosition) === 'corner') return false;

  return unref(useWxBooking) && unref(wxBookingCountVisible);
});

/** 预约表单组件实例 */
const bookingFormRef = ref<LiveBookingFormInstance>();

/** 取消预约提示弹层实例 */
const bookingCancelTipsRef = ref<MessageBoxInstance>();

/** 处理按钮点击 */
async function onClickButton() {
  if (unref(useWxBooking)) {
    onClickWxButton();
  } else {
    onClickSmsButton();
  }
}

/** 处理微信预约点击 */
async function onClickWxButton() {
  trackUserReservationLive({ reservationType: 'official_account' });

  if (unref(isLiveBooking)) {
    const res = await bookingCancelTipsRef.value?.$confirm();
    if (res) {
      wxCancelLiveBooking();
    }
  } else {
    wxSubmitLiveBooking();
  }
}

/** 处理短信预约点击 */
async function onClickSmsButton() {
  const instance = unref(bookingFormRef);

  trackUserReservationLive({ reservationType: 'code' });
  if (unref(isLiveBooking)) {
    const res = await bookingCancelTipsRef.value?.$confirm();
    if (res) {
      instance?.cancelLiveBooking();
    }
  } else {
    instance?.openBookingForm();
  }
}
</script>

<style lang="scss">
.c-mobile-live-booking-button__button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.c-mobile-live-booking-button__button__top {
  display: flex;
  align-items: center;

  .c-mobile-live-booking-button__button__top__icon {
    display: flex;
    margin-right: 4px;
    font-size: 16px !important;
  }
}

.c-mobile-live-booking-button__button__bottom {
  margin-bottom: -3px;
  font-size: 12px;
  transform: scale(0.83);
}

.c-mobile-live-booking-button__button__icon {
  margin-right: 4px;
  font-size: 16px !important;
}

.c-mobile-live-booking-button--splash {
  .c-mobile-live-booking-button__button {
    width: 80px;
    min-width: 80px;
    padding: 0;
  }
}

.c-mobile-live-booking-button--player {
  .c-mobile-live-booking-button__button {
    width: 224px;
  }
}

.c-mobile-live-booking-button--corner {
  .c-mobile-live-booking-button__button {
    width: 60px;
    white-space: nowrap;
  }
}
</style>
