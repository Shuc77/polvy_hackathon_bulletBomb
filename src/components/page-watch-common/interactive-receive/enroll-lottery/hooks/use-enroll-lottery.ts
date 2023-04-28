import { onBeforeUnmount, onMounted, ref } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

/**
 * @hook 互动-抽奖-报名抽奖
 */
export const useEnrollLottery = () => {
  const watchCore = getWatchCore();
  /** 报名抽奖实例 */
  const enrollLotterySdk = watchCore.interactReceive.getEnrollLottery();

  const dialogVisible = ref(false);

  /** 更新弹层显示状态 */
  function updateDialogVisible(visible = true) {
    dialogVisible.value = !!visible;
  }

  onMounted(() => {
    eventBus.$on(appEvents.interaction.OpenEnrollLottery, updateDialogVisible);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.OpenEnrollLottery, updateDialogVisible);
  });

  return {
    enrollLotterySdk,
    dialogVisible,
    updateDialogVisible,
  };
};
