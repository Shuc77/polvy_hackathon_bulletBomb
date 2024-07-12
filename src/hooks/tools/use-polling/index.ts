import { onBeforeMount, onMounted } from 'vue';

/**
 * 轮询 hook
 * @param callback 回调函数
 * @param time 轮询时间，单位：毫秒
 */
export const usePolling = (callback: () => unknown, time = 3000) => {
  let timer: number | undefined;

  function startPolling() {
    removePolling();
    timer = window.setInterval(() => {
      callback();
    }, time);
  }

  function removePolling() {
    clearInterval(timer);
    timer = undefined;
  }

  onMounted(() => {
    startPolling();
  });

  onBeforeMount(() => {
    removePolling();
  });

  return {
    startPolling,
    removePolling,
  };
};
