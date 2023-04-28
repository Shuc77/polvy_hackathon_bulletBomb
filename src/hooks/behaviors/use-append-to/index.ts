import { getRefElem } from '@/assets/utils/vue-utils';
import { onBeforeUnmount, onMounted, Ref } from 'vue';

/**
 * @hook 处理将节点插入到某个容器中
 * @param elemRef 对应的节点
 * @param parentRef 父节点，默认：document.body
 */
export const useAppendTo = (
  elemRef: Ref | HTMLElement,
  parentRef: Ref | HTMLElement = document.body,
) => {
  onMounted(() => {
    const elem = getRefElem(elemRef);
    const parentElem = getRefElem(parentRef);
    if (!elem || !parentElem) {
      console.warn('useAppendTo fail, elem is undefined');
      return;
    }

    parentElem.appendChild(elem);
  });

  onBeforeUnmount(() => {
    const elem = getRefElem(elemRef);
    if (elem && elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  });
};
