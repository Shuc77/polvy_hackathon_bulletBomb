/**
 * @file 手机号码输入框 hook
 */

import { translate } from '@/assets/lang';
import { formCommonProps, useFormCommonValidate } from '../hooks/use-form-common';
import { computed } from 'vue';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { emitFunc, updateModelEmit, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { InputValueType } from '../form-input/hooks/use-form-input';

export const formPhoneInputProps = () => ({
  ...formCommonProps(),
  // 绑定值
  value: PropUtils.string,
  // 区号，支持.sync
  areaCode: PropUtils.string.def('+86'),
  // 占位符
  placeholder: PropUtils.string,
});

export const formPhoneInputEmits = () => ({
  input: emitFunc<string>(),
  blur: emitFunc<string>(),
  ...updateModelEmit<'areaCode', string>('areaCode'),
});

export const useFormPhoneInput = (options: {
  props: VueProps<typeof formPhoneInputProps>;
  emit: VueEmit<typeof formPhoneInputEmits>;
  closePhoneCode?: () => void;
}) => {
  const { props, emit, closePhoneCode } = options;
  const { validateCurrentFormItem, blurToValidateItem } = useFormCommonValidate({
    props,
  });

  /** 输入框占位文本 */
  const inputPlaceholder = computed(() => {
    return props.placeholder || translate('form.placeholder.phoneInput');
  });

  /** 处理表单输入框修改 */
  function onFormInputChange(val: InputValueType) {
    emit('input', `${val}`);
  }

  /** 处理表单输入框失焦 */
  async function onFormInputBlur() {
    try {
      await blurToValidateItem();
      emit('blur', props.value);
    } catch (error) {}
  }

  /** 处理区号选择 */
  function onPhoneCodeInput(code: string) {
    emit('update:areaCode', code);
    validateCurrentFormItem();
    closePhoneCode && closePhoneCode();
  }

  return {
    inputPlaceholder,
    onFormInputChange,
    onFormInputBlur,
    onPhoneCodeInput,
  };
};
