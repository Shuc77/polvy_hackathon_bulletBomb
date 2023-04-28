<!-- @file 移动端报名观看登录入口 -->
<template>
  <div class="c-mobile-enroll-login">
    <form-wrap
      label-model="header"
      :form-data="formData"
      :form-rules="formRules"
      :submit-action="submitLoginForm"
    >
      <!-- 手机号验证 -->
      <template v-if="enrollAuthType === EnrollAuthType.Mobile">
        <!-- 手机号输入 -->
        <form-item
          :label="enrollAuthName"
          required
          form-field="phoneNumber"
        >
          <mobile-form-phone-input
            v-model="formData.phoneNumber"
            :placeholder="enrollAuthTips"
            :area-code.sync="formData.areaCode"
          />
        </form-item>
        <!-- 图片验证码 -->
        <form-item v-if="smsVerifyEnabled">
          <mobile-form-image-verify-input
            ref="imageVerifyInputRef"
            v-model="formData.imageCaptcha"
            :image-id.sync="formData.imageId"
          />
        </form-item>
        <!-- 短信验证码 -->
        <form-item
          v-if="smsVerifyEnabled"
          form-field="smsCode"
        >
          <mobile-form-sms-verify-input
            v-model="formData.smsCode"
            :area-code="formData.areaCode"
            :phone-number="formData.phoneNumber"
            :sms-scene="SmsScene.Enroll"
            :image-id="formData.imageId"
            :image-captcha="formData.imageCaptcha"
            :image-verify-input-ref="imageVerifyInputRef"
          />
        </form-item>
      </template>

      <!-- 邮箱验证 -->
      <template v-if="enrollAuthType === EnrollAuthType.Email">
        <form-item
          :label="enrollAuthName"
          required
          form-field="email"
        >
          <mobile-form-input
            v-model="formData.email"
            :placeholder="enrollAuthTips"
          />
        </form-item>
      </template>

      <div class="c-mobile-enroll-login__submit">
        <form-submit-button
          class="c-mobile-enroll-login__submit__button"
          :size="ButtonSize.Medium"
          block
          :text="$lang('base.enterLive')"
        />
      </div>
    </form-wrap>
  </div>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import MobileFormImageVerifyInput from '@/components/common-base/form/form-image-verify-input/mobile-form-image-verify-input.vue';
import MobileFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/mobile-form-sms-verify-input.vue';
import MobileFormInput from '@/components/common-base/form/form-input/mobile-form-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';

import { SmsScene, EnrollAuthType } from '@polyv/live-watch-sdk';
import { useEnrollStore } from '@/store/use-enroll-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { enrollLoginEmits, useEnrollLogin } from './hooks/use-enroll-login';

const emit = defineEmits(enrollLoginEmits());

const { enrollAuthType, smsVerifyEnabled, enrollAuthName, enrollAuthTips } =
  storeDefinitionToRefs(useEnrollStore);

const { imageVerifyInputRef, formData, formRules, submitLoginForm } = useEnrollLogin({
  emit,
});
</script>

<style lang="scss">
.c-mobile-enroll-login {
  padding: 16px 16px 0;
}

.c-mobile-enroll-login__submit {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
