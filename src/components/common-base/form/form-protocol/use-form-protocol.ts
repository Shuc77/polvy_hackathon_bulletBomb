import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { computed } from 'vue';

export const formProtocolProps = () => ({
  /** 是否选中 */
  value: PropUtils.bool.def(false),
  /** 协议内容 */
  content: PropUtils.string,
});

export const formProtocolEmits = () => ({
  input: emitFunc<boolean>(),
});

export const useFormProtocol = (options: {
  props: VueProps<typeof formProtocolProps>;
  emit: VueEmit<typeof formProtocolEmits>;
}) => {
  const { props, emit } = options;

  const checkboxChecked = computed(() => props.value);

  const contentHtml = computed(() => props.content);

  function onCheckboxChange(checked: boolean) {
    emit('input', checked);
  }

  return {
    checkboxChecked,
    contentHtml,
    onCheckboxChange,
  };
};
