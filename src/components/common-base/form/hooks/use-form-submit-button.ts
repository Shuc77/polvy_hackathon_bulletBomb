import { ref, unref, watch } from 'vue';
import { useFormWrapInject, useFormWrapPropsInject } from './use-form';
import debounce from 'lodash-es/debounce';
import { normalButtonProps } from '../../normal-button/use-normal-button';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';

export const formSubmitButtonProps = () => ({
  ...normalButtonProps(),
  /** 防抖提交，默认：false */
  debounceSubmit: PropUtils.bool.def(false),
});

export const useFormSubmitButton = (options: { props: VueProps<typeof formSubmitButtonProps> }) => {
  const props = options.props;
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

  /** 触发表单提交 */
  const triggerSubmitForm = () => {
    formContext && formContext.submitForm();
  };

  /** 防抖触发表单提交 */
  const debounceTriggerSubmitForm = debounce(triggerSubmitForm, 500);

  /** 处理按钮点击 */
  function onButtonClick() {
    if (props.debounceSubmit) {
      debounceTriggerSubmitForm();
    } else {
      triggerSubmitForm();
    }
  }

  return {
    buttonIsDisabled,
    checkDisabled,
    onButtonClick,
  };
};
