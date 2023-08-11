<!-- @file PC 端直播预约按钮 -->
<template>
  <div
    class="c-pc-live-booking-button"
    :class="{
      'c-pc-live-booking-button--booked': isSmsLiveBooking,
      'c-pc-live-booking-button--mini': buttonSize === 'mini',
    }"
  >
    <!-- 文字样式 -->
    <div
      v-if="buttonStyle === 'text'"
      class="c-pc-live-booking-button__text"
      @click="onClickButton"
    >
      <pc-icon-booking class="c-pc-live-booking-button__text__icon" />
      <span class="c-pc-live-booking-button__text__text">{{ buttonText }}</span>
    </div>

    <!-- 按钮样式 -->
    <normal-button
      v-if="buttonStyle === 'button'"
      class="c-pc-live-booking-button__button"
      :size="buttonSize"
      block
      @click="onClickButton"
    >
      <pc-icon-booking
        v-if="buttonSize === 'mini' && !isSmsLiveBooking"
        class="c-pc-live-booking-button__button__icon"
      />
      <span>{{ buttonText }}</span>
    </normal-button>

    <live-booking-form-dialog ref="bookingFormRef" />
  </div>
</template>

<script setup lang="ts">
import { PcIconBooking } from '@/components/component-icons/pc/map';
import LiveBookingFormDialog from './pc-live-booking-form-dialog.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { translate } from '@/assets/lang';
import { PropUtils, useProps } from '@/assets/utils/vue-utils/props-utils';
import { computed, ref, unref } from 'vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { LiveBookingFormInstance } from './types';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';

const { trackUserReservationLive } = useWatchEventTrack();

const props = defineProps({
  /** 按钮样式，默认：text，text-文本，button-按钮 */
  buttonStyle: PropUtils.oneOfType<'text' | 'button'>([String]).def('text'),
  /** 按钮大小，默认：ButtonSize.Large */
  buttonSize: PropUtils.enum<ButtonSize>().def(ButtonSize.Large),
});

const { buttonStyle, buttonSize } = useProps(props);

const { isSmsLiveBooking } = storeDefinitionToRefs(useLiveBookingStore);

/** 按钮文本 */
const buttonText = computed(() => {
  if (unref(isSmsLiveBooking)) {
    return translate('liveBooking.booked');
  }

  if (unref(buttonStyle) === 'button' && unref(buttonSize) === ButtonSize.Mini) {
    return translate('liveBooking.book');
  }

  return translate('liveBooking.bookLive');
});

/** 预约表单组件实例 */
const bookingFormRef = ref<LiveBookingFormInstance>();

/** 处理按钮点击 */
function onClickButton() {
  const instance = unref(bookingFormRef);

  trackUserReservationLive({ reservationType: 'code' });

  if (unref(isSmsLiveBooking)) {
    instance?.cancelLiveBooking();
  } else {
    instance?.openBookingForm();
  }
}
</script>

<style lang="scss">
.c-pc-live-booking-button__text {
  display: flex;
  align-items: center;
  color: $--color-primary;
  cursor: pointer;
}

.c-pc-live-booking-button__text__icon {
  display: flex;
  font-size: 20px !important;
}

.c-pc-live-booking-button__text__text {
  margin-left: 2px;
  font-size: 18px;
}

.c-pc-live-booking-button--booked {
  .c-pc-live-booking-button__text {
    color: #adadc0;
  }
}

.c-pc-live-booking-button__button {
  width: 184px;
}

.c-pc-live-booking-button__button__icon {
  display: flex;
  margin-right: 3px;
  font-size: 20px !important;
}

.c-pc-live-booking-button--mini {
  .c-pc-live-booking-button__button {
    width: 68px;
    white-space: nowrap;
  }
}
</style>
