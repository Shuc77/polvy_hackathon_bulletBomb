import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { isFormItemInstance } from '@/components/common-base/form/hooks/use-form-item';
import { ValidatorRules } from '@/plugins/async-validator';
import { AuthSettingItemCode } from '@polyv/live-watch-sdk';
import { computed, reactive, ref, unref } from 'vue';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon, useAuthProtocol } from '../hooks/use-auth-common';

/** 观看条件：验证码 hook */
export const useAuthCode = () => {
  const { getWatchCore } = useGlobalInject();

  const { authItem } = useAuthButtonInject<AuthSettingItemCode>(onClickAuthButton);

  /** 弹层是否显示 */
  const dialogVisible = ref(false);

  /** 弹层标题 */
  const dialogTitle = computed(() => authItem.codeAuthTips);

  /** 表单对象 */
  const formData = reactive({
    code: '',
    checkProtocol: false,
  });

  const { protocolContent, protocolFormRules } = useAuthProtocol({
    authItem,
    formData,
  });

  /** 处理点击授权入口按钮 */
  function onClickAuthButton(): void {
    dialogVisible.value = true;
    formData.code = '';
    formData.checkProtocol = false;
  }

  /** 处理点击取消 */
  function onClickCancel(): void {
    dialogVisible.value = false;
  }

  /** 二维码图片地址 */
  const qrcodeImg = computed(() => authItem.qcodeImg);

  /** 二维码提示文案 */
  const qrcodeTips = computed(() => authItem.qcodeTips);

  const formRules = computed<ValidatorRules>(() => {
    return {
      code: { type: 'string', message: translate('auth.error.codeEmpty'), required: true },
      ...unref(protocolFormRules),
    };
  });

  const { failMessage, handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();
  const formItemRef = ref();

  /** 提交授权表单 */
  async function submitAuth() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyCodeAuth({
      code: formData.code,
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
    qrcodeImg,
    qrcodeTips,
    protocolContent,
    formData,
    formRules,
    onClickCancel,
    submitAuth,
    failMessage,
    formItemRef,
  };
};
