import { translate } from '@/assets/lang';
import { ValidatorRules } from '@/plugins/async-validator';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import {
  AuthSettingItem,
  AuthVerifyError,
  AuthVerifyResultFail,
  AuthVerifyResultSuccess,
  YN,
} from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { computed, ref, unref } from 'vue';

export interface AuthProtocolFormData {
  /** 是否勾选了隐私声明 */
  checkProtocol: boolean;
}

export interface UseAuthProtocolOptions {
  authItem: AuthSettingItem;
  formData: AuthProtocolFormData;
}

/**
 * 观看条件隐私协议 hook
 */
export const useAuthProtocol = (options: UseAuthProtocolOptions) => {
  const { authItem, formData } = options;

  /** 隐私协议内容 */
  const protocolContent = computed(() => {
    let privacyStatus = YN.N;
    let privacyContent = '';

    if ('privacyStatus' in authItem && authItem.privacyStatus) {
      privacyStatus = authItem.privacyStatus;
    }
    if ('privacyContent' in authItem && authItem.privacyContent) {
      privacyContent = authItem.privacyContent;
    }

    if (!ynToBool(privacyStatus)) {
      return '';
    }

    return privacyContent;
  });

  /** 隐私协议表单验证规则 */
  const protocolFormRules = computed<ValidatorRules>(() => {
    return {
      checkProtocol: {
        validator: () => {
          if (unref(protocolContent) && !formData.checkProtocol) {
            return [translate('auth.error.checkProtocol')];
          }
          return [];
        },
      },
    };
  });

  return {
    protocolContent,
    protocolFormRules,
  };
};

/**
 * 观看条件公用 hook
 */
export const useAuthCommon = () => {
  const watchAppStore = useWatchAppStore();

  /** 失败信息 */
  const failMessage = ref<string>();

  /**
   * 处理观看条件验证成功
   * @param successResult 成功结果
   */
  async function handleAuthVerifySuccess(successResult: AuthVerifyResultSuccess): Promise<void> {
    if (!successResult.success) return;

    failMessage.value = undefined;
    await watchAppStore.resetUpWatchCore();
  }

  /**
   * 处理观看条件验证失败
   * @param failResult 失败结果
   */
  async function handleAuthVerifyFail(failResult: AuthVerifyResultFail): Promise<void> {
    failMessage.value = undefined;

    switch (failResult.errorReason) {
      case AuthVerifyError.Unknown:
        failMessage.value = translate('auth.error.unknown');
        break;
      case AuthVerifyError.PhoneNotExist:
        failMessage.value = translate('auth.error.phoneNotExistent');
        break;
      case AuthVerifyError.CodeError:
        failMessage.value = translate('auth.error.codeError');
        break;
      case AuthVerifyError.SmsCodeError:
        failMessage.value = translate('auth.error.smsCodeError');
        break;
      case AuthVerifyError.PhoneNotRegister:
        failMessage.value = translate('auth.error.phoneNotRegister');
        break;
      case AuthVerifyError.RedirectUrl:
        if (failResult.getRedirectUrl) {
          const redirectUrl = failResult.getRedirectUrl();
          window.location.href = redirectUrl;
        }
        break;
    }
  }

  return {
    failMessage,
    handleAuthVerifySuccess,
    handleAuthVerifyFail,
  };
};
