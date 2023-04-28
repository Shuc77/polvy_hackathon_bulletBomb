import Vue, { Ref, unref } from 'vue';

export type SimilarResponsive<T = unknown> = T | Ref<T>;

/**
 * 获取 ref 响应式对象中的 dom 节点，如果不是则返回 undefined
 * @param targetRef 响应式对象
 */
export const getRefElem = <E extends HTMLElement>(targetRef: Ref | HTMLElement): E | undefined => {
  const refValue = unref(targetRef);

  // 如果解构出来的是 dom 节点
  if (refValue instanceof HTMLElement) {
    return refValue as E;
  }

  // 如果解构出来的是 vue 对象，则返回 $el
  if (refValue instanceof Vue) {
    return refValue.$el;
  }

  return undefined;
};
