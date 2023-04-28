import { translate } from '@/assets/lang';
import { useEnrollStore } from '@/store/use-enroll-store';
import { computed, ref, unref } from 'vue';

/**
 * 报名表单实例
 */
export interface EnrollDialogInstance {
  /** 显示报名观看表单弹层 */
  openEnrollForm(): void;
}

export type EnrollDialogModel = 'form' | 'login';

/**
 * 报名观看弹窗 hook
 */
export const useEnrollDialog = () => {
  const enrollStore = useEnrollStore();

  /** 弹层是否显示 */
  const dialogVisible = ref(false);

  /** 弹层模式 */
  const dialogModel = ref<EnrollDialogModel>('form');

  /** 弹层标题 */
  const dialogTitle = computed<string>(() => {
    if (unref(dialogModel) === 'login') {
      return translate('enroll.loginTitle');
    }

    return enrollStore.enrollTitle;
  });

  /** 显示报名观看表单弹层 */
  function openEnrollForm() {
    dialogModel.value = 'form';
    dialogVisible.value = true;
  }

  /** 关闭报名观看表单弹层 */
  function closeEnrollDialog() {
    dialogVisible.value = false;
  }

  /** 处理点击已报名入口 */
  function onClickEnrolled() {
    dialogModel.value = 'login';
  }

  function onClickBack() {
    dialogModel.value = 'form';
  }

  const enrollDialogInstance: EnrollDialogInstance = {
    openEnrollForm,
  };

  return {
    dialogVisible,
    dialogTitle,
    enrollDialogInstance,
    dialogModel,
    openEnrollForm,
    closeEnrollDialog,
    onClickEnrolled,
    onClickBack,
  };
};
