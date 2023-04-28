import { translate } from '@/assets/lang';
import { validateCnAndEn, validatePhoneNumber } from '@/assets/utils/validate';
import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { ImageVerifyInputInstance } from '@/components/common-base/form/form-image-verify-input/type';
import { SelectOptionItem } from '@/components/common-base/form/form-select/types/form-select-types';
import { toast } from '@/hooks/components/use-toast';
import { getWatchCore } from '@/core/watch-sdk';
import { ValidatorRules } from '@/plugins/async-validator';
import { useAuthStore } from '@/store/use-auth-store';
import {
  AuthInfoPropValKey,
  AuthInfoPropValType,
  AuthInfoType,
  AuthSettingItemInfo,
} from '@polyv/live-watch-sdk';
import { storeToRefs } from 'pinia';
import { computed, reactive, ref, unref } from 'vue';
import { useAuthButtonInject } from '../../hooks/use-auth-button';
import { useAuthCommon, useAuthProtocol } from '../../hooks/use-auth-common';
import { useAuthInfoSetting } from './use-auth-info-setting';

export const authInfoFormEmits = () => ({
  /** 关闭窗口 */
  'close-dialog': emitFunc<void>(),
  /** 点击了已登录 */
  'click-logined': emitFunc<void>(),
});

interface BasicFormData {
  /** 手机号 */
  phoneNumber: string;
  /** 手机区号 */
  areaCode: string;
  /** 图片验证码 */
  imageId: string;
  imageCaptcha: string;
  /** 短信验证码 */
  smsCode: string;
  /** 隐私协议勾选 */
  checkProtocol: boolean;
}

export interface AuthInfoFormInstance {
  /** 重置表单 */
  resetFormData(): void;
}

export const useAuthInfoForm = (options: { emit: VueEmit<typeof authInfoFormEmits> }) => {
  const { emit } = options;

  const authStore = useAuthStore();
  const { authItem } = useAuthButtonInject<AuthSettingItemInfo>();
  const { smsVerifyEnabled, hasMobileField } = useAuthInfoSetting();

  const { authInfoFields } = storeToRefs(authStore);

  /** 提示信息 */
  const infoDesc = computed(() => authItem.infoDesc);

  const imageVerifyInputRef = ref<ImageVerifyInputInstance>();

  /** 格式化下拉选项 */
  function formatSelectOptions(options?: string): SelectOptionItem[] {
    if (!options) {
      return [];
    }

    const strs = options.split(',').filter(str => !!str);
    return strs.map<SelectOptionItem>(str => {
      return {
        label: str,
        value: str,
      };
    });
  }

  /** 表单字段前缀 */
  const fieldPrefix = 'propValue' as const;

  function generateFromData(): AuthInfoPropValType & BasicFormData {
    function getInitFormData() {
      const data: AuthInfoPropValType = {};

      unref(authInfoFields).forEach((option, index) => {
        data[`${fieldPrefix}${index + 1}`] = '';
      });

      return data;
    }

    return {
      ...getInitFormData(),
      // 手机号
      phoneNumber: '',
      // 手机区号
      areaCode: '+86',
      // 图片验证码 id
      imageId: '',
      // 图片验证码
      imageCaptcha: '',
      // 短信验证码
      smsCode: '',
      // 隐私协议勾选
      checkProtocol: false,
    };
  }

  const formData = reactive<AuthInfoPropValType & BasicFormData>(generateFromData());

  function resetFormData() {
    const generatedData = generateFromData();
    for (const i in formData) {
      const key = i as keyof AuthInfoPropValType;
      formData[key] = generatedData[key];
    }
  }

  function onPhoneNumberChange(phoneNumber: string) {
    formData.phoneNumber = phoneNumber;
  }

  const { protocolContent, protocolFormRules } = useAuthProtocol({
    authItem,
    formData,
  });

  const formRules = computed<ValidatorRules>(() => {
    const rules: ValidatorRules = {
      ...unref(protocolFormRules),
    };

    unref(authInfoFields).forEach((option, index) => {
      const type = option.type;
      const field = `${fieldPrefix}${index + 1}` as AuthInfoPropValKey;

      switch (type) {
        case AuthInfoType.Name:
          rules[field] = [
            { type: 'string', message: translate('auth.error.improveInfo'), required: true },
            {
              validator: () => {
                const name = formData[field];

                if (validateCnAndEn(name)) {
                  return [];
                }

                return [translate('form.error.onlyCnAnEn')];
              },
            },
          ];
          break;
        case AuthInfoType.Text:
        case AuthInfoType.Option:
          rules[field] = [
            { type: 'string', message: translate('auth.error.improveInfo'), required: true },
          ];
          break;
        case AuthInfoType.Number:
          rules[field] = [
            { type: 'number', message: translate('auth.error.improveInfo'), required: true },
          ];
          break;
        case AuthInfoType.Mobile:
          rules[field] = [
            {
              type: 'string',
              message: translate('form.error.phoneNumberRequired'),
              required: true,
            },
            {
              validator: () => {
                const phoneNumber = formData[field];
                const areaCode = formData.areaCode;

                if (validatePhoneNumber(phoneNumber, areaCode)) {
                  return [];
                }

                return [translate('form.error.phoneNumberError')];
              },
            },
          ];
          if (unref(smsVerifyEnabled)) {
            rules.smsCode = [
              {
                type: 'string',
                message: translate('form.error.smsVerifyRequired'),
                required: true,
              },
            ];
          }
          break;
      }
    });

    return rules;
  });

  const { failMessage, handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();

  async function submitAuth() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyInfoAuth(formData);

    if (result.success) {
      handleAuthVerifySuccess(result);
    } else {
      handleAuthVerifyFail(result);

      if (failMessage.value) {
        toast.error(failMessage.value);
      }
    }
  }

  /** 处理点击取消 */
  function onClickCancel(): void {
    emit('close-dialog');
  }

  function onClickLogined() {
    emit('click-logined');
  }

  const authFormInstance: AuthInfoFormInstance = {
    resetFormData,
  };

  return {
    infoDesc,
    authInfoFields,
    imageVerifyInputRef,
    AuthInfoType,
    fieldPrefix,
    formData,
    formRules,

    protocolContent,
    smsVerifyEnabled,
    authFormInstance,
    hasMobileField,

    onPhoneNumberChange,
    formatSelectOptions,
    onClickCancel,
    submitAuth,
    onClickLogined,
  };
};
