import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';
import { ref } from 'vue';
import { useIdentityInfoInput, IdentityInfoScene } from './use-identity-info-input';

export const useBindIdentityInfo = () => {
  const { formData, formRules, channelAgreementConfig, protocolContent, submitForm } =
    useIdentityInfoInput({
      scene: IdentityInfoScene.Bind,
    });

  const visible = ref(false);

  function closeDialog() {
    visible.value = false;
  }

  async function onSubmit() {
    await submitForm();
    toast.success(translate('base.submitSuccess'));
    visible.value = false;
  }

  useEventBusListener(appEvents.global.OpenBindIdentityInfoDialog, () => {
    visible.value = true;
  });

  return {
    visible,
    formData,
    formRules,
    channelAgreementConfig,
    protocolContent,
    onSubmit,
    closeDialog,
  };
};
