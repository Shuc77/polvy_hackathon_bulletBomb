import { getCurrentInstance, VNode } from 'vue';

/**
 * @hook 对 Vue 一些方法的简单封装
 */
export const useVue = () => {
  /** 当前 vue 实例 */
  const instanceVm = getCurrentInstance();

  /** 获取当前 vue 实例对象 */
  function getInstance() {
    return instanceVm?.proxy;
  }

  /** 获取当前组件的 dom 节点 */
  function getCurrentElem() {
    const instance = getInstance();
    return instance?.$el;
  }

  /** 获取当前组件的子组件 */
  function getCurrentChildrens() {
    return getInstance()?.$children;
  }

  /** 获取指定的 slot */
  function getSlot(slotName = 'default'): VNode[] {
    const instance = getInstance();
    return (instance?.$slots && instance.$slots[slotName]) || [];
  }

  return {
    getInstance,
    getCurrentElem,
    getCurrentChildrens,
    getSlot,
  };
};
