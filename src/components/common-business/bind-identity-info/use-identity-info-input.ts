import { translate } from '@/assets/lang';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { useChannelAgreement } from '@/hooks/business/use-channel-agreement';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useToastManager } from '@/hooks/components/use-toast';
import { ValidatorRules } from '@/plugins/async-validator';
import { useIdentityStore } from '@/store/use-identity-store';
import { computed, reactive } from 'vue';

export enum IdentityInfoScene {
  /** 登录 */
  Login = 'login',
  /** 绑定 */
  Bind = 'bind',
}

/**
 * 用户信息输入
 * @hook
 */
export const useIdentityInfoInput = (options: { scene: IdentityInfoScene }) => {
  const { getWatchCore } = useMultiPolyvWatchApp();

  const { toast } = useToastManager();

  const watchCore = getWatchCore();
  const identityStore = useIdentityStore();

  const { channelAgreementConfig, protocolContent, protocolConfirmInfo } =
    useChannelAgreement(true);

  const formData = reactive({
    phoneNumber: '',
    areaCode: '+86',
    smsCode: '',
    protocolChecked: false,
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
    rules.smsCode = [
      {
        type: 'string',
        message: translate('form.error.smsVerifyRequired'),
        required: true,
      },
    ];

    return rules;
  });

  function submitForm() {
    if (channelAgreementConfig.value && !formData.protocolChecked) {
      const message = translate('base.needCheck') + protocolConfirmInfo.value.title;
      toast.error(message);
      return Promise.reject(new Error(message));
    }

    if (options.scene === IdentityInfoScene.Login) {
      return submitFormLogin();
    }
    return submitFormBind();
  }

  async function submitFormLogin() {
    const verifyResult = await watchCore.identity.loginIdentityInfo({
      phoneNumber: formData.phoneNumber,
      areaCode: formData.areaCode,
      smsCode: formData.smsCode,
    });

    if (!verifyResult.success) {
      console.error(verifyResult.failReason, verifyResult.failMessage);
      toast.error(verifyResult.failMessage || translate('base.error.unknown'));
      return;
    }

    // 成功提交后刷新当前页面即可
    window.location.reload();
  }

  async function submitFormBind() {
    const verifyResult = await watchCore.identity.bindIdentityInfo({
      phoneNumber: formData.phoneNumber,
      areaCode: formData.areaCode,
      smsCode: formData.smsCode,
    });

    if (!verifyResult.success) {
      console.error(verifyResult.failReason, verifyResult.failMessage);
      toast.error(verifyResult.failMessage || translate('base.error.unknown'));
      return Promise.reject(new Error(verifyResult.failMessage));
    } else {
      identityStore.syncIdentityStore();
    }
  }

  return {
    formData,
    formRules,
    channelAgreementConfig,
    protocolContent,
    submitForm,
  };
};
