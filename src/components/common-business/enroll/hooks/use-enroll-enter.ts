import { appEvents, useEventBusListener } from '@/app/app-events';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { ref, unref } from 'vue';
import { EnrollDialogInstance } from './use-enroll-dialog';

/**
 * 报名观看入口 hook
 */
export const useEnrollEnter = () => {
  const enrollStore = useEnrollStore();
  const viewerStore = useViewerStore();

  const dialogRef = ref<EnrollDialogInstance>();

  /** 处理点击入口 */
  function onClickEnter() {
    if (enrollStore.needEnrollByChat && viewerStore.needRealNameAuth) {
      viewerStore.checkNeedRealNameAuth();
      return;
    }

    const dialogInstance = unref(dialogRef);
    if (dialogInstance) {
      dialogInstance.openEnrollForm();
    }
  }

  useEventBusListener(appEvents.global.OpenEnrollDialog, () => {
    onClickEnter();
  });

  return {
    dialogRef,
    onClickEnter,
  };
};
