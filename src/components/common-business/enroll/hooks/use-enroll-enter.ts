import { appEvents, useEventBusListener } from '@/app/app-events';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { ref, unref } from 'vue';
import { EnrollDialogInstance } from './use-enroll-dialog';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

/**
 * 报名观看入口 hook
 */
export const useEnrollEnter = () => {
  const enrollStore = useEnrollStore();
  const identityStore = useIdentityStore();

  const dialogRef = ref<EnrollDialogInstance>();

  const { needInterruptUserClick, toInterruptUserClick } = useInterruptUserClick();

  /** 处理点击入口 */
  async function onClickEnter() {
    if (enrollStore.needEnrollByChat && needInterruptUserClick.value) {
      toInterruptUserClick({
        triggerSource: 'enroll',
        ignoreSetNick: true,
      });
      return;
    }

    // 开启用户系统后，如果报名观看需要审核且已填写过表单后，则不在显示表单
    if (
      identityStore.watchUserSystemEnabled &&
      enrollStore.needEnrollByEnter &&
      enrollStore.auditNotPass
    ) {
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
