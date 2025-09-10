import { appEvents, useEventBusListener } from '@/app/app-events';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { ref, unref } from 'vue';
import { EnrollDialogInstance } from './use-enroll-dialog';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { DirectBusinessPageType } from '@/app/layout/direct-business-page/type';
import { messageBox, MessageBoxPositionType } from '@/components/common-base/message-box';
import { translate } from '@/assets/lang';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';

/**
 * 报名观看入口 hook
 */
export const useEnrollEnter = () => {
  const enrollStore = useEnrollStore();
  const viewerStore = useViewerStore();
  const identityStore = useIdentityStore();
  const watchAppStore = useWatchAppStore();

  const dialogRef = ref<EnrollDialogInstance>();
  const isFeedMainMode = isBuildForFeedMainMode();

  async function handleLoginDialog(): Promise<boolean> {
    const res = await messageBox({
      content: translate('auth.login.tips'),
      confirmButtonText: translate('auth.login.button'),
      contentCenter: true,
      cancelButtonText: translate('base.cancel'),
      positionType: isFeedMainMode ? MessageBoxPositionType.Absolute : MessageBoxPositionType.Fix,
    }).$confirm();

    if (res) {
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.WatchIdentity,
      });
      return true;
    }

    return false;
  }

  /** 处理点击入口 */
  async function onClickEnter() {
    // 游客登录需要弹出登录提示
    if (identityStore.isGuest) {
      await handleLoginDialog();
      return;
    }

    if (enrollStore.needEnrollByChat && viewerStore.needRealNameAuth) {
      viewerStore.checkNeedRealNameAuth();
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
