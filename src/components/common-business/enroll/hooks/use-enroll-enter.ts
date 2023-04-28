import { ref, unref } from 'vue';
import { EnrollDialogInstance } from './use-enroll-dialog';

/**
 * 报名观看入口 hook
 */
export const useEnrollEnter = () => {
  const dialogRef = ref<EnrollDialogInstance>();

  /** 处理点击入口 */
  function onClickEnter() {
    const dialogInstrance = unref(dialogRef);
    if (dialogInstrance) {
      dialogInstrance.openEnrollForm();
    }
  }

  return {
    dialogRef,
    onClickEnter,
  };
};
