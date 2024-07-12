import { useTaskActivityStore } from '@/store/use-task-activity-store';
import { TaskActivityEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '../watch-sdk';

export function bindTaskActivityEvents() {
  const watchCore = getWatchCore();
  const taskActivityStore = useTaskActivityStore();

  watchCore.taskActivity.eventEmitter.on(TaskActivityEvents.StartTask, () => {
    taskActivityStore.syncTaskActivityStore();
  });
  watchCore.taskActivity.eventEmitter.on(TaskActivityEvents.EndTask, () => {
    taskActivityStore.syncTaskActivityStore();
  });
  watchCore.taskActivity.eventEmitter.on(TaskActivityEvents.TaskActivityDataUpdate, () => {
    taskActivityStore.syncTaskActivityStore();
  });
}
