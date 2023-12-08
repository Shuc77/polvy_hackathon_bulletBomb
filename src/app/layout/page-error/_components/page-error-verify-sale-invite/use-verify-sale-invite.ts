import { computed, reactive, ref } from 'vue';
import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';
import { ValidatorRules } from '@/plugins/async-validator';
import { getWatchCore } from '@/core/watch-sdk';
import { validatePhoneNumber } from '@/assets/utils/validate';

/**
 * 一客一码表单逻辑
 * @hook
 */
export const useVerifySaleInvite = () => {
  const watchCore = getWatchCore();

  const saleInviteVerifySmsEnabled = ref(watchCore.saleInvite.getSaleInviteVerifySmsEnabled());

  const formData = reactive<{
    phoneNumber: string;
    areaCode: string;
    smsCode: string;
  }>({
    phoneNumber: '',
    areaCode: '+86',
    smsCode: '',
  });

  const formRules = computed<ValidatorRules>(() => {
    const rules: ValidatorRules = {};

    // 手机号规则
    rules.phoneNumber = [
      {
        type: 'string',
        message: translate('form.error.phoneNumberRequired'),
        required: true,
      },
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

    // 短信验证码规则
    if (saleInviteVerifySmsEnabled.value) {
      rules.smsCode = [
        {
          type: 'string',
          message: translate('form.error.smsVerifyRequired'),
          required: true,
        },
      ];
    }

    return rules;
  });

  async function submitForm() {
    const verifyResult = await watchCore.saleInvite.verifySaleInviteAuth({
      ...formData,
    });

    if (!verifyResult.success) {
      console.error(verifyResult.failReason, verifyResult.failMessage);
      toast.error(verifyResult.failMessage || translate('base.error.unknown'));
      return;
    }

    // 成功提交后刷新当前页面即可
    window.location.reload();
  }

  return {
    saleInviteVerifySmsEnabled,

    formData,
    formRules,
    submitForm,
  };
};
