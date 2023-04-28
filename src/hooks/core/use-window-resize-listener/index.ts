import { onBeforeUnmount, onMounted } from 'vue';
import { debounce } from 'lodash-es';

/**
 * @hook 监听 windows resize 事件
 */
export const useWindowResizeListener = (
  callback: () => unknown,
  autoListen = false,
  debounceTime = 0,
) => {
  const debounceFunc = debounceTime === 0 ? callback : debounce(callback, debounceTime);

  /** 监听 resize 事件 */
  function bindWindowResize() {
    unbindWindowResize();
    window.addEventListener('resize', debounceFunc);
  }

  /** 移除 resize 事件监听 */
  function unbindWindowResize() {
    window.removeEventListener('resize', debounceFunc);
  }

  if (autoListen) {
    onMounted(() => {
      bindWindowResize();
    });
  }

  onBeforeUnmount(() => {
    unbindWindowResize();
  });

  return {
    bindWindowResize,
    unbindWindowResize,
  };
};
