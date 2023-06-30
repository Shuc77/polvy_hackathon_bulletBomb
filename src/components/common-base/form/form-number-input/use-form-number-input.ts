import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils, useProps, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { ref, unref } from 'vue';
import { InputValueType } from '../form-input/hooks/use-form-input';
import { FormInputInstance } from '../form-input/types/form-input-types';
import { formCommonProps } from '../hooks/use-form-common';

export type NumberInputValueType = string | number;

export const formNumberInputProps = () => ({
  ...formCommonProps(),
  // 绑定值
  value: PropUtils.oneOfType<NumberInputValueType>([String, Number]).def(''),
  // 最大值
  max: PropUtils.number.def(Infinity),
  // 最小值
  min: PropUtils.number.def(-Infinity),
});

export const formNumberInputEmits = () => ({
  input: emitFunc<NumberInputValueType>(),
});

export const useFormNumberInput = (options: {
  props: VueProps<typeof formNumberInputProps>;
  emit: VueEmit<typeof formNumberInputEmits>;
}) => {
  const { props, emit } = options;

  const { value } = useProps(props);

  const inputRef = ref<FormInputInstance>();

  /**
   * 格式化值
   */
  function formatValue(val: string | number): NumberInputValueType {
    if (val === '') {
      return val;
    }
    return Number(val);
  }

  /**
   * 检查最大值和最小值
   */
  function checkMaxMin(val: NumberInputValueType): NumberInputValueType {
    if (val === '') {
      return val;
    }

    const _val = Number(val);
    if (_val > props.max) {
      return props.max;
    }
    if (_val < props.min) {
      return props.min;
    }
    return val;
  }

  function onInputChange(val: InputValueType): void {
    let newVal = formatValue(val);
    newVal = checkMaxMin(newVal);
    emit('input', newVal);

    const inputInstance = unref(inputRef);
    if (inputInstance) {
      inputInstance.forceUpdate();
    }
  }

  return {
    inputRef,
    value,
    onInputChange,
  };
};
