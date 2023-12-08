<!-- @file 移动端-邀请有礼活动中奖领取表单 -->

<template>
  <div class="c-mobile-invite-prize-receive-form">
    <div
      v-if="hasReceived"
      class="c-mobile-invite-prize-receive-form__tips"
    >
      <span>{{ $lang('invite.prize.receive.form.hasReceived.tips') }}</span>
    </div>
    <div class="c-mobile-invite-prize-receive-form__body">
      <div class="c-mobile-invite-prize-receive-form__body__content">
        <form-wrap
          label-model="header"
          :form-data="formData"
          :form-rules="formRules"
          :submit-action="submitForm"
        >
          <template v-for="(item, index) in invitePrizeReceiveFormFields">
            <!-- 姓名 -->
            <template v-if="item.type === InvitePrizeReceiveFormFieldType.Name">
              <form-item
                :label="item.field"
                :key="`name-${index}`"
                :required="item.required"
                :form-field="item.fieldId"
              >
                <mobile-form-input
                  :disabled="hasReceived"
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                  :maxlength="20"
                />
              </form-item>
            </template>

            <!-- 手机号码 -->
            <template v-if="item.type === InvitePrizeReceiveFormFieldType.Phone">
              <form-item
                :label="item.field"
                :key="`phone-${index}`"
                :required="item.required"
                :form-field="item.fieldId"
              >
                <mobile-form-phone-input
                  :disabled="hasReceived"
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                  :need-area-code="false"
                >
                </mobile-form-phone-input>
              </form-item>
            </template>

            <!-- 自定义 -->
            <template v-if="item.type === InvitePrizeReceiveFormFieldType.Custom">
              <form-item
                :label="item.field"
                :key="`custom-${index}`"
                :required="item.required"
                :form-field="item.fieldId"
              >
                <mobile-form-input
                  :disabled="hasReceived"
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                />
              </form-item>
            </template>
          </template>

          <div
            class="c-mobile-invite-prize-receive-form__body__submit"
            v-if="!hasReceived"
          >
            <form-submit-button
              :size="ButtonSize.Medium"
              block
              :text="$lang('base.submit')"
              debounce-submit
            />
          </div>
        </form-wrap>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, set, watch } from 'vue';
import { ValidatorRules, ValidatorRule } from '@/plugins/async-validator';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { translate } from '@/assets/lang';
import {
  InvitePrizeReceiveFormCollectParams,
  InvitePrizeReceiveFormFieldType,
  InvitePrizeWinnerForm,
} from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

import { toast } from '@/hooks/components/use-toast';
import { ButtonSize } from '@/components/common-base/normal-button';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import MobileFormInput from '@/components/common-base/form/form-input/mobile-form-input.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';

import { useInvitePrizeReceive } from '../_hooks/use-invite-prize-receive';
import { useInviteStore } from '@/store/use-invite-store';

const inviteStore = useInviteStore();
const { invitePrizeWinnerInfo, hasReceived } = useInvitePrizeReceive<InvitePrizeWinnerForm>();

const formData = reactive<{ [key: string]: any }>({});

const invitePrizeReceiveFormFields = computed(() => {
  return invitePrizeWinnerInfo.value.receiveInfo.formInfo;
});

watch(
  () => invitePrizeReceiveFormFields.value,
  () => {
    invitePrizeReceiveFormFields.value.forEach(cur => {
      if (cur.value) {
        set(formData, cur.fieldId, cur.value);
      }
    });
  },
  { immediate: true },
);

/** 表单验证规则 */
const formRules = computed<ValidatorRules>(() => {
  const rules: ValidatorRules = {};

  invitePrizeReceiveFormFields.value.forEach(fieldItem => {
    const fieldId = fieldItem.fieldId;
    const isRequired = fieldItem.required;

    const requiredRuleItem: ValidatorRule = {
      type: 'string',
      message: translate('form.error.improveInfo'),
      required: isRequired,
    };

    if (fieldItem.type === InvitePrizeReceiveFormFieldType.Phone) {
      rules[fieldId] = [
        requiredRuleItem,
        {
          validator: () => {
            if (validatePhoneNumber(formData[fieldItem.fieldId])) {
              return [];
            }

            return [translate('form.error.phoneNumberError')];
          },
        },
      ];
    } else {
      rules[fieldId] = [requiredRuleItem];
    }
  });

  return rules;
});

/** 提交表单 */
async function submitForm() {
  try {
    const paramFormData: InvitePrizeReceiveFormCollectParams['formData'] =
      invitePrizeReceiveFormFields.value.map(fieldItem => {
        return {
          ...fieldItem,
          value: formData[fieldItem.fieldId] || '',
        };
      });

    const watchCore = getWatchCore();
    await watchCore.invite.saveInvitePrizeReceiveForm({
      id: invitePrizeWinnerInfo.value.id,
      formData: paramFormData,
    });

    inviteStore.$patch({
      invitePrizeWinnerInfo: {
        ...invitePrizeWinnerInfo.value,
        hasReceived: true,
      },
    });

    toast.success(translate('base.submitSuccess'));
  } catch (error) {
    toast.error(translate('base.submitFail'));
  }
}
</script>

<style lang="scss">
.c-mobile-invite-prize-receive-form__tips {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  font-size: 12px;
  color: #3082fe;
  text-align: center;
  background: rgba(48, 130, 254, 0.1);
}

.c-mobile-invite-prize-receive-form__body {
  padding: 0 16px;
}
.c-mobile-invite-prize-receive-form__body__content {
  padding: 24px 0 0;
}

.c-mobile-invite-prize-receive-form__body__submit {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  background: $--color-white;

  &::before {
    position: absolute;
    bottom: 88px;
    left: 50%;
    width: 106%;
    height: 20px;
    pointer-events: none;
    content: '';
    background: linear-gradient(180deg, rgba(#fff, 0) 0%, #ffffff 100%);
    transform: translateX(-50%);
  }
}
</style>
