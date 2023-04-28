import { translate } from '@/assets/lang';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { DialogInstance } from '@/components/common-base/dialog/pc-dialog/types';
import { useAuthStore } from '@/store/use-auth-store';
import { AuthSettingItemInfo } from '@polyv/live-watch-sdk';
import { storeToRefs } from 'pinia';
import { computed, nextTick, ref } from 'vue';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { AuthInfoFormInstance } from './hooks/use-auth-info-form';

export type AuthInfoDialogModel = 'form' | 'login';

export const useAuthInfo = () => {
  const authStore = useAuthStore();
  const { authItem } = useAuthButtonInject<AuthSettingItemInfo>(onClickAuthButton);

  const { authInfoFields } = storeToRefs(authStore);

  const dialogRef = ref<DialogInstance>();

  const dialogModel = ref<AuthInfoDialogModel>('form');

  const { visible: dialogVisible, close: closeDialog } = useSimpleVisible(false);

  const formRef = ref<AuthInfoFormInstance>();

  function onClickAuthButton(): void {
    dialogVisible.value = true;
    dialogModel.value = 'form';
    formRef.value?.resetFormData();
  }

  /** 弹层标题 */
  const dialogTitle = computed(() => {
    if (dialogModel.value === 'form') {
      return authItem.infoAuthTips;
    }
    return translate('auth.info.registered.title');
  });

  async function openLogined() {
    dialogModel.value = 'login';
    await nextTick();
    dialogRef.value?.resetPosition();
  }

  async function openAuthInfoForm() {
    dialogModel.value = 'form';
    await nextTick();
    dialogRef.value?.resetPosition();
  }

  return {
    dialogVisible,
    dialogModel,
    dialogTitle,
    dialogRef,
    formRef,

    authInfoFields,
    closeDialog,
    openLogined,
    openAuthInfoForm,
  };
};
