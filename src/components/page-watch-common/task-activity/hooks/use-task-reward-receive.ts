import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import type {
  RewardReceiveData,
  RewardReceiveFormItem,
  RewardReceiveFormType,
  RewardReceiveSubmitAction,
} from '@polyv/iar-reward-receive-ui';
import {
  RewardAcceptFormItem,
  RewardAcceptFormType,
  TaskRewardItem,
  YN,
} from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { ref } from 'vue';

export const useTaskRewardReceive = () => {
  const { getWatchCore, getEmitter } = useGlobalInject();

  const watchCore = getWatchCore();

  const currentRewardItem = ref<TaskRewardItem>();

  const receiveData = ref<RewardReceiveData>();

  function open(rewardItem: TaskRewardItem) {
    if (!rewardItem.acceptInfo) {
      return;
    }

    const _formList: RewardReceiveFormItem[] = [];
    if (rewardItem.acceptInfo.formInfo) {
      rewardItem.acceptInfo.formInfo.forEach(item => {
        const texts = getItemText(item);
        let formType: RewardReceiveFormType = 'input';
        switch (item.type) {
          case RewardAcceptFormType.Address:
            formType = 'address';
            break;
          case RewardAcceptFormType.UserPhone:
            formType = 'phone';
            break;
        }

        _formList.push({
          title: texts.label,
          placeholder: texts.placeholder,
          value: item.value || '',
          formType,
          isRequired: item.required,
        });
      });
    }

    receiveData.value = {
      receiveType: rewardItem.acceptInfo.acceptType,
      isReceived: ynToBool(rewardItem.acceptInfo.received, YN.N),
      formList: _formList,
      linkUrl: rewardItem.acceptInfo.prizeUrl || '',
      qrCode: rewardItem.acceptInfo.qrCode || '',
      qrCodeTips: rewardItem.acceptInfo.qrCodeTips || '',
    };
    currentRewardItem.value = rewardItem;
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

  const submitTaskReceive: RewardReceiveSubmitAction = async formValue => {
    const formInfo = currentRewardItem.value?.acceptInfo?.formInfo;
    if (!formInfo || !currentRewardItem.value) {
      return;
    }

    const formInfoPostData = formInfo.map((item, index) => {
      const value = formValue[index];

      return {
        ...item,
        value,
      };
    });

    await watchCore.taskActivity.submitRewardReceive(currentRewardItem.value.id, formInfoPostData);
    getEmitter().emit(appEvents.global.RefreshTaskRewardList);
  };

  useEventBusListener(appEvents.global.OpenTaskRewardReceiveDialog, open);

  return {
    submitTaskReceive,
    receiveData,
  };
};
