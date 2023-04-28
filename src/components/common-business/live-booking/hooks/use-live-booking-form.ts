/**
 * @file （短信）直播预约表单 hook
 */
import { translate } from '@/assets/lang';
import { getStorageKey } from '@/assets/utils/storage';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { toast } from '@/hooks/components/use-toast';
import { getWatchCore } from '@/core/watch-sdk';
import { ValidatorRules } from '@/plugins/async-validator';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { local } from '@just4/storage';
import { computed, reactive, ref } from 'vue';
import { LiveBookingFormInstance } from '../types';
import { toastBookingFail } from './use-live-booking-fail';

// local 中的手机号码缓存 key
const LOCAL_PHONE_KEY = getStorageKey('live-booking-phone');
// local 中的手机区号缓存 key
const LOCAL_AREA_CODE_KEY = getStorageKey('live-booking-area-code');

export const useLiveBookingForm = () => {
  const liveBookingStore = useLiveBookingStore();

  /** 直播预约表单数据 */
  const bookingFormData = reactive({
    // 手机号
    phoneNumber: local.get(LOCAL_PHONE_KEY) || '',
    // 手机区号
    areaCode: local.get(LOCAL_AREA_CODE_KEY) || '+86',
    // 短信验证码
    verifyCode: '',
  });

  /** 直播预约表单验证规则 */
  const bookingFormRules = computed<ValidatorRules>(() => {
    return {
      phoneNumber: [
        { type: 'string', message: translate('form.error.phoneNumberRequired'), required: true },
        {
          validator: () => {
            const { phoneNumber, areaCode } = bookingFormData;

            if (validatePhoneNumber(phoneNumber, areaCode)) {
              return [];
            }

            return [translate('form.error.phoneNumberError')];
          },
        },
      ],
      verifyCode: [
        { type: 'string', message: translate('form.error.smsVerifyRequired'), required: true },
      ],
    };
  });

  /** 预约表单是否显示 */
  const bookingFormVisible = ref(false);

  /** 打开弹层 */
  function openBookingForm() {
    bookingFormVisible.value = true;
    bookingFormData.verifyCode = '';
  }

  /** 提交直播预约表单 */
  async function submitLiveBookingForm() {
    const watchCore = getWatchCore();
    const result = await watchCore.liveBooking.submitSmsLiveBooking({
      phoneNumber: bookingFormData.phoneNumber,
      areaCode: bookingFormData.areaCode,
      verifyCode: bookingFormData.verifyCode,
    });

    if (result.success) {
      local.set(LOCAL_PHONE_KEY, bookingFormData.phoneNumber);
      local.set(LOCAL_AREA_CODE_KEY, bookingFormData.areaCode);

      toast.success(translate('liveBooking.bookingSuccess'));
      liveBookingStore.isSmsLiveBooking = true;

      bookingFormVisible.value = false;
    } else {
      toastBookingFail(result.failReason);
    }
  }

  /** 取消预约 */
  async function cancelLiveBooking() {
    const watchCore = getWatchCore();
    const result = await watchCore.liveBooking.cancelSmsLiveBooking({
      phoneNumber: bookingFormData.phoneNumber,
      areaCode: bookingFormData.areaCode,
    });

    if (result.success) {
      local.remove(LOCAL_PHONE_KEY);
      local.remove(LOCAL_AREA_CODE_KEY);

      toast.success(translate('liveBooking.cancelSuccess'));
      liveBookingStore.isSmsLiveBooking = false;
    } else {
      toastBookingFail(result.failReason);
    }
  }

  const liveBookingFormInstance: LiveBookingFormInstance = {
    openBookingForm,
    submitLiveBookingForm,
    cancelLiveBooking,
  };

  return {
    bookingFormData,
    bookingFormRules,
    bookingFormVisible,
    openBookingForm,
    submitLiveBookingForm,
    cancelLiveBooking,
    liveBookingFormInstance,
  };
};
