import { TaskActivityData, TaskActivityItem } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';

export interface TaskActivityStore {
  /**
   * 当前活动数据
   */
  currentActivityData: Ref<TaskActivityData | undefined>;
  /**
   * 任务列表
   */
  taskList: ComputedRef<TaskActivityItem[]>;

  syncTaskActivityStore(): void;
}

export const useTaskActivityStore = defineStore<'taskActivity', TaskActivityStore>(
  'taskActivity',
  () => {
    const watchAppStore = useWatchAppStore();
    const currentActivityData = ref<TaskActivityData>();

    const taskList = computed<TaskActivityItem[]>(() => {
      return currentActivityData.value?.tasks || [];
    });

    function syncTaskActivityStore() {
      const watchCore = watchAppStore.getWatchCore();

      const activityData = watchCore.taskActivity.getActivityData();
      currentActivityData.value = activityData;
    }

    return {
      currentActivityData,
      taskList,
      syncTaskActivityStore,
    };
  },
);
