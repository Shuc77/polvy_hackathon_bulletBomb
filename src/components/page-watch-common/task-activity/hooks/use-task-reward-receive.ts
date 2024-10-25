import { appEvents, eventBus, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { getWatchCore } from '@/core/watch-sdk';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { toast } from '@/hooks/components/use-toast';
import { getSelectData } from '@/plugins/polyv-ui/area-utils';
import { useCommonStore } from '@/store/use-common-store';
import {
  RewardAcceptFormItem,
  RewardAcceptFormType,
  RewardAcceptType,
  TaskRewardItem,
  YN,
} from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { ref } from 'vue';

export const useTaskRewardReceive = () => {
  const commonStore = useCommonStore();

  const { visible, show } = useSimpleVisible();

  const currentRewardItem = ref<TaskRewardItem>();
  const isReadonly = ref(false);
  const formList = ref<RewardAcceptFormItem[]>([]);
  const qrCode = ref('');
  const qrCodeTips = ref('');
  const acceptType = ref(RewardAcceptType.Form);

  const areaPickerValue = ref([]);

  function open(rewardItem: TaskRewardItem) {
    if (!rewardItem.acceptInfo) {
      return;
    }
    isReadonly.value = ynToBool(rewardItem.acceptInfo.received, YN.N);
    currentRewardItem.value = rewardItem;
    acceptType.value = rewardItem.acceptInfo.acceptType;

    if (rewardItem.acceptInfo.acceptType === RewardAcceptType.Form) {
      formList.value = rewardItem.acceptInfo.formInfo;
    }

    if (rewardItem.acceptInfo.acceptType === RewardAcceptType.QrCode) {
      formList.value = rewardItem.acceptInfo.formInfo;
      qrCode.value = rewardItem.acceptInfo.qrCode || '';
      qrCodeTips.value = rewardItem.acceptInfo.qrCodeTips || '';
    }

    show();
  }

  function isSimpleFormType(type: RewardAcceptFormType) {
    return [
      RewardAcceptFormType.UserName,
      RewardAcceptFormType.UserPhone,
      RewardAcceptFormType.Custom,
    ].includes(type);
  }

  function getItemText(item: RewardAcceptFormItem) {
    const res = {
      label: item.field,
      placeholder: item.tips,
    };

    switch (item.type) {
      case RewardAcceptFormType.UserName:
        res.label = translate('taskActivity.rewardReceive.nameLabel');
        res.placeholder = translate('taskActivity.rewardReceive.namePlaceholder');
        break;
      case RewardAcceptFormType.UserPhone:
        res.label = translate('taskActivity.rewardReceive.phoneLabel');
        res.placeholder = translate('taskActivity.rewardReceive.phonePlaceholder');
        break;
      case RewardAcceptFormType.Address:
        res.label = translate('taskActivity.rewardReceive.addressLabel');
        res.placeholder = translate('taskActivity.rewardReceive.addressPlaceholder2');
        break;
    }

    return res;
  }

  async function submitForm() {
    if (!currentRewardItem.value) {
      return;
    }
    for (let i = 0; i < formList.value.length; i++) {
      const formItem = formList.value[i];

      if (!formItem.required) {
        continue;
      }

      if (isSimpleFormType(formItem.type) && !formItem.value) {
        toast.error(translate('taskActivity.rewardReceive.error1'));
        return;
      }

      if (
        formItem.type === RewardAcceptFormType.UserPhone &&
        !validatePhoneNumber(formItem.value || '')
      ) {
        toast.error(translate('taskActivity.rewardReceive.error2'));
        return;
      }

      if (
        formItem.type === RewardAcceptFormType.Address &&
        (areaPickerValue.value.length === 0 || !formItem.value)
      ) {
        toast.error(translate('taskActivity.rewardReceive.error1'));
        return;
      }
    }

    const formInfoPostData = formList.value.map(item => {
      let value = item.value;

      if (item.type === RewardAcceptFormType.Address) {
        const areaData = getSelectData(areaPickerValue.value, commonStore.areaData).map(
          item => item.name,
        );
        value = `${areaData.join('')}${item.value || ''}`;
      }

      return {
        ...item,
        value,
      };
    });

    const watchCore = getWatchCore();
    await watchCore.taskActivity.submitRewardReceive(currentRewardItem.value.id, formInfoPostData);

    toast.success(translate('base.submitSuccess'));
    eventBus.$emit(appEvents.global.RefreshTaskRewardList);
    visible.value = false;
  }

  useEventBusListener(appEvents.global.OpenTaskRewardReceiveDialog, open);

  return {
    visible,
    isReadonly,
    acceptType,
    areaPickerValue,
    formList,
    qrCode,
    qrCodeTips,
    isSimpleFormType,
    submitForm,
    getItemText,
  };
};
