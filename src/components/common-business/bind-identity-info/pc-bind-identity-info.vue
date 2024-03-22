<template>
  <pc-dialog
    class="c-pc-bind-identity-info-dialog"
    :visible.sync="visible"
    :title="$lang('identityInfo.bindMobile')"
  >
    <div class="c-pc-bind-identity-info-dialog__content">
      <form-wrap
        label-model="inline"
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="onSubmit"
      >
        <form-item form-field="phoneNumber">
          <pc-form-phone-input
            v-model="formData.phoneNumber"
            :area-code.sync="formData.areaCode"
          />
        </form-item>

        <form-item form-field="smsCode">
          <pc-form-sms-verify-input
            v-model="formData.smsCode"
            :area-code="formData.areaCode"
            :phone-number="formData.phoneNumber"
            :sms-scene="SmsScene.IdentityInfo"
            :valid-type="SmsValidType.Slider"
          />
        </form-item>

        <form-item v-if="channelAgreementConfig">
          <pc-form-protocol
            circle
            v-model="formData.protocolChecked"
            :content="protocolContent"
          />
        </form-item>

        <div class="c-pc-bind-identity-info-dialog__btns">
          <form-submit-button
            :size="ButtonSize.Small"
            :text="$lang('base.submit')"
            debounce-submit
          />
          <normal-button
            :size="ButtonSize.Small"
            :type="ButtonType.Info"
            :text="$lang('base.cancel')"
            @click="closeDialog"
          />
        </div>
      </form-wrap>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import { SmsScene, SmsValidType } from '@polyv/live-watch-sdk';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import PcFormPhoneInput from '@/components/common-base/form/form-phone-input/pc-form-phone-input.vue';
import PcFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/pc-form-sms-verify-input.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import PcFormProtocol from '@/components/common-base/form/form-protocol/pc-form-protocol.vue';
import { useBindIdentityInfo } from './use-bind-identity-info';

const {
  visible,
  closeDialog,
  formData,
  formRules,
  onSubmit,
  protocolContent,
  channelAgreementConfig,
} = useBindIdentityInfo();
</script>

<style lang="scss">
.c-pc-bind-identity-info-dialog__content {
  padding: 40px 100px;
}
.c-pc-bind-identity-info-dialog__btns {
  display: flex;
  justify-content: center;
  margin-top: 36px;

  .c-normal-button {
    margin: 0 8px;
  }
}
</style>
