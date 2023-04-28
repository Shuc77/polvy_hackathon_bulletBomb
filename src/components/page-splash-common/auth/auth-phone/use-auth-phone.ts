import { translate } from '@/assets/lang';
import { isFormItemInstance } from '@/components/common-base/form/hooks/use-form-item';
import { getWatchCore } from '@/core/watch-sdk';
import { ValidatorRules } from '@/plugins/async-validator';
import { AuthSettingItemPhone } from '@polyv/live-watch-sdk';
import { computed, reactive, ref, unref } from 'vue';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon, useAuthProtocol } from '../hooks/use-auth-common';

/** 观看条件：白名单 hook */
export const useAuthPhone = () => {
  const { authItem } = useAuthButtonInject<AuthSettingItemPhone>(onClickAuthButton);

  /** 弹层是否显示 */
  const dialogVisible = ref(false);

  /** 弹层标题 */
  const dialogTitle = computed(() => authItem.authTips);

  /** 表单对象 */
  const formData = reactive({
    phone: '',
    checkProtocol: false,
  });

  /** 输入框占位文本 */
  const inputPlaceholder = computed(() => {
    return authItem.whiteListInputTips || translate('auth.phone.placeholder');
  });

  const { protocolContent, protocolFormRules } = useAuthProtocol({
    authItem,
    formData,
  });

  /** 处理点击授权入口按钮 */
  function onClickAuthButton(): void {
    dialogVisible.value = true;
    formData.phone = '';
    formData.checkProtocol = false;
  }

  /** 处理点击取消 */
  function onClickCancel(): void {
    dialogVisible.value = false;
  }

  const formRules = computed<ValidatorRules>(() => {
    return {
      phone: { type: 'string', message: translate('auth.error.phoneEmpty'), required: true },
      ...unref(protocolFormRules),
    };
  });

  const { failMessage, handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();
  const formItemRef = ref();

  /** 提交授权表单 */
  async function submitAuth() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyPhoneAuth({
      phone: formData.phone,
    });

    if (result.success) {
      dialogVisible.value = false;
      handleAuthVerifySuccess(result);
    } else {
      handleAuthVerifyFail(result);

      // 设置表单的异常提示
      const formItemInstance = unref(formItemRef);
      if (failMessage.value && isFormItemInstance(formItemInstance)) {
        formItemInstance.setErrorMessage(failMessage.value);
      }
    }
  }

  return {
    dialogVisible,
    dialogTitle,
    protocolContent,
    formData,
    inputPlaceholder,
    formRules,
    onClickCancel,
    submitAuth,
    failMessage,
    formItemRef,
  };
};
