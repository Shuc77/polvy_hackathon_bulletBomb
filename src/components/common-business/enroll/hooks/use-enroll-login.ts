import { DEFAULT_PHONE_NUMBER_AREA_CODE } from '@/assets/constants/defaults';
import { translate } from '@/assets/lang';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { toast } from '@/hooks/components/use-toast';
import { getWatchCore } from '@/core/watch-sdk';
import { ValidatorRules } from '@/plugins/async-validator';
import { useEnrollStore } from '@/store/use-enroll-store';
import { EnrollAuthType } from '@polyv/live-watch-sdk';
import { computed, reactive } from 'vue';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useEnrollSms } from './use-enroll-sms';

export const enrollLoginEmits = () => ({
  /** 点击取消 */
  'click-cancel': emitFunc<void>(),
  /** 关闭弹层 */
  'close-dialog': emitFunc<void>(),
});

/**
 * 报名观看登录 hook
 */
export const useEnrollLogin = (options: { emit: VueEmit<typeof enrollLoginEmits> }) => {
  const { emit } = options;

  const watchAppStore = useWatchAppStore();
  const enrollStore = useEnrollStore();

  const { imageVerifyInputRef, imageVerifyInputEnabled, smsValidType } = useEnrollSms();

  /** 表单对象 */
  const formData = reactive({
    // 手机号
    phoneNumber: '',
    // 区号
    areaCode: DEFAULT_PHONE_NUMBER_AREA_CODE,
    // 图片验证码
    imageId: '',
    imageCaptcha: '',
    // 短信验证码
    smsCode: '',
    // 邮箱
    email: '',
  });

  /** 表单验证规则 */
  const formRules = computed<ValidatorRules>(() => {
    const rules: ValidatorRules = {};

    // 手机号验证
    if (enrollStore.enrollAuthType === EnrollAuthType.Mobile) {
      rules.phoneNumber = [
        { type: 'string', message: translate('form.error.phoneNumberRequired'), required: true },
        {
          validator: () => {
            const phoneNumber = formData.phoneNumber;
            const areaCode = formData.areaCode;

            if (validatePhoneNumber(phoneNumber, areaCode)) {
              return [];
            }

            return [translate('form.error.phoneNumberError')];
          },
        },
      ];

      if (enrollStore.smsVerifyEnabled) {
        rules.smsCode = [
          { type: 'string', message: translate('form.error.smsVerifyRequired'), required: true },
        ];
      }
    }

    // 邮箱验证
    if (enrollStore.enrollAuthType === EnrollAuthType.Email) {
      rules.email = [
        { type: 'string', message: translate('form.error.emailRequired'), required: true },
        { type: 'email', message: translate('form.error.emailError') },
      ];
    }

    return rules;
  });

  /**
   * 提交登录表单
   */
  async function submitLoginForm() {
    const watchCore = getWatchCore();

    const result = await watchCore.enroll.loginEnroll({
      phoneNumber: formData.phoneNumber,
      areaCode: formData.areaCode,
      smsCode: formData.smsCode,
      email: formData.email,
    });

    if (!result.success) {
      toast.error(result.failMessage || translate('base.error.unknown'));
      return;
    }

    // 未填写报名信息
    if (!result.hasEnrolled) {
      let toastMsg = translate('enroll.error.phoneUnenroll');
      if (enrollStore.enrollAuthType === EnrollAuthType.Email) {
        toastMsg = translate('enroll.error.emailUnenroll');
      }
      toast.error(toastMsg);
      return;
    }

    // 已填写但报名审核中
    if (result.auditEnabled && !result.hasAudited) {
      toast.success(translate('enroll.auditing'));
      emit('close-dialog');
      return;
    }

    // 入口报名且报名成功的情况下需要重新安装 watchCore
    if (enrollStore.needEnrollByEnter && result.hasEnrolled) {
      await watchAppStore.resetUpWatchCore();
    }

    emit('close-dialog');
  }

  function onClickCancel() {
    emit('click-cancel');
  }

  return {
    imageVerifyInputRef,
    imageVerifyInputEnabled,
    smsValidType,

    formData,
    formRules,
    submitLoginForm,
    onClickCancel,
  };
};
