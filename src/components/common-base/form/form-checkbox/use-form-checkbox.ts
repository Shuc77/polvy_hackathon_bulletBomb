import { emitFunc, updateModelEmit, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { computed, unref } from 'vue';

export const formCheckboxProps = () => ({
  /** 是否选中，支持.sync */
  checked: PropUtils.bool.def(false),
});

export const formCheckboxEmits = () => ({
  ...updateModelEmit<'checked', boolean>('checked'),
  change: emitFunc<boolean>(),
});

export const useFormCheckbox = (options: {
  props: VueProps<typeof formCheckboxProps>;
  emit: VueEmit<typeof formCheckboxEmits>;
}) => {
  const { props, emit } = options;

  /** 是否已选中 */
  const isChecked = computed(() => props.checked);

  /** 处理点击复选框 */
  function onClickCheckbox(): void {
    emit('update:checked', !unref(isChecked));
    emit('change', !unref(isChecked));
  }

  return {
    isChecked,
    onClickCheckbox,
  };
};
