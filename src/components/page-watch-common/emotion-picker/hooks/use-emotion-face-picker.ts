import { onMounted, ref, unref } from 'vue';
import { genDOMList } from '@polyv/emotion-sdk';
import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';

export const emotionFacePickerEmits = () => ({
  /** 点击表情 */
  'click-face': emitFunc<string>(),
});

/**
 * face 表情选取 hook
 */
export const useEmotionFacePicker = (options: { emit: VueEmit<typeof emotionFacePickerEmits> }) => {
  const { emit } = options;

  /** 容器节点 */
  const containerRef = ref<HTMLDivElement>();

  /** 处理点击容器 */
  function onClickContainer(event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'I') {
      return;
    }
    const title = target.getAttribute('data-title');
    if (!title) {
      return;
    }

    emit('click-face', `[${title}]`);
  }

  /** 加载表情节点 */
  onMounted(() => {
    const containerElem = unref(containerRef);
    if (containerElem) {
      containerElem.appendChild(genDOMList());
    }
  });

  return {
    containerRef,
    onClickContainer,
  };
};
