import { ref, unref, watch } from 'vue';
import { useFormWrapInject, useFormWrapPropsInject } from './use-form';

export const useFormSubmitButton = () => {
  const formProps = useFormWrapPropsInject();
  const formContext = useFormWrapInject();

  /** 提交按钮是否禁用 */
  const buttonIsDisabled = ref(false);

  /** 检查按钮是否需要禁用 */
  async function checkDisabled(): Promise<void> {
    let isDisabled = false;

    if (!formContext) {
      return;
    }

    // 表单正在提交中
    if (unref(formContext.isSubmiting)) {
      isDisabled = true;
      buttonIsDisabled.value = isDisabled;
      return;
    }

    // 进行表单验证
    try {
      if (formContext.validateCurrentForm) {
        await formContext.validateCurrentForm({
          showErrorMessage: false,
        });
      }
    } catch (e) {
      if (unref(formContext.debug)) {
        console.error('form-submit-button-error', e);
      }
      isDisabled = true;
    }

    buttonIsDisabled.value = isDisabled;
  }

  watch(
    () => {
      return [formProps && formProps.formData, formContext && unref(formContext.isSubmiting)];
    },
    () => checkDisabled(),
    {
      immediate: true,
      deep: true,
    },
  );

  /** 处理按钮点击 */
  function onButtonClick() {
    formContext && formContext.submitForm();
  }

  return {
    buttonIsDisabled,
    checkDisabled,
    onButtonClick,
  };
};
