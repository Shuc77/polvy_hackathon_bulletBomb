/**
 * @file （短信）直播预约表单 hook
 */
import { translate } from '@/assets/lang';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { useToastManager } from '@/hooks/components/use-toast';
import { ValidatorRules } from '@/plugins/async-validator';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { LiveBookingFormInstance } from '../types';
import { useLiveBookingFail } from './use-live-booking-fail';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useGlobalInject } from '@/app/use-global-inject';
import { useLiveBookingCache } from '@/hooks/business/use-live-booking-cache/use-live-booking-cache';
import { useIdentityStore } from '@/store/use-identity-store';
import { FormSubmitButtonInstance } from '@/components/common-base/form/hooks/use-form-submit-button';

export const useLiveBookingForm = ({ otherChannelId }: { otherChannelId?: string } = {}) => {
  const { getWatchCore } = useGlobalInject();

  const { setLiveBookingCache, getLiveBookingCache, clearLiveBookingCache } = useLiveBookingCache();

  const { toast } = useToastManager();
  const { toastBookingFail } = useLiveBookingFail();

  const liveBookingStore = useLiveBookingStore();
  const identityStore = useIdentityStore();

  function getDefaultFormNumber() {
    return getLiveBookingCache().phoneNumber || identityStore.identityUnionInfo?.phoneNumber || '';
  }

  function getDefaultFormAreaCode() {
    return getLiveBookingCache().areaCode || '+86';
  }

  const formSubmitRef = ref<FormSubmitButtonInstance | undefined>();

  /** 直播预约表单数据 */
  const bookingFormData = reactive({
    // 手机号
    phoneNumber: getDefaultFormNumber(),
    // 手机区号
    areaCode: getDefaultFormAreaCode(),
    // 短信验证码
    verifyCode: '',
  });

  /** 是否启用短信验证 */
  const smsEnabled = ref(true);

  const initSmsEnabled = () => {
    if (bookingFormData.phoneNumber !== getLiveBookingCache().phoneNumber) {
      // 如果手机号有变更，说明之前的短信验证结果不再有效，需要重新验证
      smsEnabled.value = true;
      return;
    }

    // 默认需要短信验证，除非缓存里有短信验证成功的记录
    smsEnabled.value = !getLiveBookingCache().smsVerified;
  };

  watch(
    () => bookingFormData.phoneNumber,
    (newValue, oldValue) => {
      if (oldValue && newValue !== oldValue) {
        initSmsEnabled();
      }
    },
  );

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
        {
          type: 'string',
          message: translate('form.error.smsVerifyRequired'),
          required: smsEnabled.value,
        },
      ],
    };
  });

  /** 预约表单是否显示 */
  const bookingFormVisible = ref(false);

  /** 打开弹层 */
  function openBookingForm() {
    bookingFormData.phoneNumber = getDefaultFormNumber();
    bookingFormData.areaCode = getDefaultFormAreaCode();
    bookingFormData.verifyCode = '';
    initSmsEnabled();

    formSubmitRef.value?.checkDisabled();
    nextTick(() => {
      bookingFormVisible.value = true;
    });
  }

  const { trackUserConfirmReservationLive } = useWatchEventTrack();

  /** 提交直播预约表单 */
  async function submitLiveBookingForm() {
    trackUserConfirmReservationLive({ reservationType: 'code' });

    const watchCore = getWatchCore();
    // 当存在自定义预约+短信预约时，在短信提醒成功后，后端会自动调用自定义预约接口，所以这里不需要再调用一次
    const result = await watchCore.liveBooking.submitSmsLiveBooking({
      phoneNumber: bookingFormData.phoneNumber,
      areaCode: bookingFormData.areaCode,
      verifyCode: bookingFormData.verifyCode,
      otherChannelId, // 其他频道预约时，需要传入 channelId
    });

    if (result.success) {
      setLiveBookingCache({
        phoneNumber: bookingFormData.phoneNumber,
        areaCode: bookingFormData.areaCode,
        smsVerified: false,
      });

      toast.success(translate('liveBooking.bookingSuccess'));

      // 预约下一场其他直播的处理
      if (otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            isSmsLiveBooking: true,
          },
        });
      } else {
        liveBookingStore.$patch({
          isSmsLiveBooking: true,
        });
      }

      bookingFormVisible.value = false;
    } else {
      toastBookingFail(result.failReason);
      setLiveBookingCache({ smsVerified: false });
      initSmsEnabled();
    }
  }

  /** 取消预约 */
  async function cancelLiveBooking() {
    const watchCore = getWatchCore();
    // 当存在自定义预约+短信预约时，在短信提醒成功后，后端会自动调用自定义预约接口，所以这里不需要再调用一次
    const result = await watchCore.liveBooking.cancelSmsLiveBooking({
      phoneNumber: bookingFormData.phoneNumber,
      areaCode: bookingFormData.areaCode,
      ...(otherChannelId ? { otherChannelId } : {}),
    });

    if (result.success) {
      clearLiveBookingCache();

      toast.success(translate('liveBooking.cancelSuccess'));

      if (otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            isSmsLiveBooking: false,
          },
        });
      } else {
        liveBookingStore.$patch({
          isSmsLiveBooking: false,
        });
      }
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
    formSubmitRef,
    smsEnabled,
    bookingFormData,
    bookingFormRules,
    bookingFormVisible,
    openBookingForm,
    submitLiveBookingForm,
    cancelLiveBooking,
    liveBookingFormInstance,
  };
};
