<template>
  <mobile-popup
    class="c-mobile-bind-identity-info-popup"
    :visible.sync="visible"
    :title="$lang('identityInfo.bindMobile')"
  >
    <div class="c-mobile-bind-identity-info-popup__content">
      <form-wrap
        label-model="inline"
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="onSubmit"
      >
        <form-item form-field="phoneNumber">
          <mobile-form-phone-input
            v-model="formData.phoneNumber"
            :area-code.sync="formData.areaCode"
          />
        </form-item>

        <form-item form-field="smsCode">
          <mobile-form-sms-verify-input
            v-model="formData.smsCode"
            :area-code="formData.areaCode"
            :phone-number="formData.phoneNumber"
            :sms-scene="SmsScene.IdentityInfo"
            :valid-type="SmsValidType.Slider"
          />
        </form-item>

        <form-item v-if="channelAgreementConfig">
          <mobile-form-protocol
            circle
            v-model="formData.protocolChecked"
            :content="protocolContent"
          />
        </form-item>

        <div class="c-mobile-bind-identity-info-popup__submit">
          <form-submit-button
            :type="ButtonType.Primary"
            :size="ButtonSize.Medium"
            block
            :text="$lang('base.submit')"
            debounce-submit
          />
        </div>
      </form-wrap>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button';
import { SmsScene, SmsValidType } from '@polyv/live-watch-sdk';

import FormItem from '@/components/common-base/form/form-item.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import MobileFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/mobile-form-sms-verify-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileFormProtocol from '@/components/common-base/form/form-protocol/mobile-form-protocol.vue';
import { useBindIdentityInfo } from './use-bind-identity-info';

const { visible, formData, formRules, onSubmit, protocolContent, channelAgreementConfig } =
  useBindIdentityInfo();
</script>

<style lang="scss">
.c-mobile-bind-identity-info-popup__content {
  padding: 24px;
}
</style>
