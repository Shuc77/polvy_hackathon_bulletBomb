<!-- @file 移动端登记观看表单 -->
<template>
  <div class="c-mobile-auth-info-form">
    <div
      v-if="hasMobileField"
      class="c-mobile-auth-info-form__registered-entrance"
      @click="onClickLogined"
    >
      {{ $lang('auth.info.registered.entrance') }}
    </div>

    <div
      v-if="infoDesc"
      class="c-mobile-auth-info-form__desc"
    >
      {{ infoDesc }}
    </div>

    <form-wrap
      class="c-mobile-auth-info-form__form"
      label-model="header"
      :form-data="formData"
      :form-rules="formRules"
      :submit-action="submitAuth"
    >
      <template v-for="(item, index) in authInfoFields">
        <!-- 姓名 -->
        <template v-if="item.type === AuthInfoType.Name">
          <form-item
            :label="item.name"
            :key="`name-${index}`"
            :form-field="generateFormField(index)"
          >
            <mobile-form-input
              v-model.trim="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
            />
          </form-item>
        </template>

        <!-- 文本 -->
        <template v-if="item.type === AuthInfoType.Text">
          <form-item
            :label="item.name"
            :key="`text-${index}`"
            :form-field="generateFormField(index)"
          >
            <mobile-form-input
              v-model="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
            />
          </form-item>
        </template>

        <!-- 数值 -->
        <template v-if="item.type === AuthInfoType.Number">
          <form-item
            :label="item.name"
            :key="`number-${index}`"
            :form-field="generateFormField(index)"
          >
            <mobile-form-number-input
              v-model="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
            />
          </form-item>
        </template>

        <!-- 下拉选项 -->
        <template v-if="item.type === AuthInfoType.Option">
          <form-item
            :label="item.name"
            :key="`option-${index}`"
            :form-field="generateFormField(index)"
          >
            <mobile-form-select
              v-model="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
              :options="formatSelectOptions(item.options)"
              search
            />
          </form-item>
        </template>

        <!-- 手机号码 -->
        <template v-if="item.type === AuthInfoType.Mobile">
          <!-- 手机号码 -->
          <form-item
            :label="item.name"
            :key="`phone-${index}`"
            :form-field="generateFormField(index)"
          >
            <mobile-form-phone-input
              v-model="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
              :area-code.sync="formData.areaCode"
              @input="onPhoneNumberChange"
            />
          </form-item>
          <!-- 图片验证码 -->
          <form-item
            v-if="smsVerifyEnabled"
            :key="`image-code-${index}`"
          >
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
            :key="`sms-code-${index}`"
          >
            <mobile-form-sms-verify-input
              v-model="formData.smsCode"
              :area-code="formData.areaCode"
              :phone-number="formData[generateFormField(index)]"
              :image-id="formData.imageId"
              :image-captcha="formData.imageCaptcha"
              :sms-scene="SmsScene.AuthInfo"
              :image-verify-input-ref="imageVerifyInputRef"
            />
          </form-item>
        </template>
      </template>

      <!-- 隐私协议 -->
      <form-item
        v-if="protocolContent"
        form-field="checkProtocol"
        style="margin-bottom: 0"
      >
        <mobile-form-protocol
          v-model="formData.checkProtocol"
          :content="protocolContent"
        />
      </form-item>

      <div class="c-mobile-auth-info-form__submit">
        <form-submit-button
          :size="ButtonSize.Medium"
          :text="$lang('auth.enter')"
          block
        />
      </div>
    </form-wrap>
  </div>
</template>

<script setup lang="ts">
import { SmsScene } from '@polyv/live-watch-sdk';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import MobileFormInput from '@/components/common-base/form/form-input/mobile-form-input.vue';
import MobileFormNumberInput from '@/components/common-base/form/form-number-input/mobile-form-number-input.vue';
import MobileFormSelect from '@/components/common-base/form/form-select/mobile-form-select.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import MobileFormImageVerifyInput from '@/components/common-base/form/form-image-verify-input/mobile-form-image-verify-input.vue';
import MobileFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/mobile-form-sms-verify-input.vue';
import MobileFormProtocol from '@/components/common-base/form/form-protocol/mobile-form-protocol.vue';
import { useAuthInfoForm, authInfoFormEmits } from './hooks/use-auth-info-form';

const emit = defineEmits(authInfoFormEmits());

const {
  infoDesc,
  authInfoFields,
  AuthInfoType,
  formData,
  formRules,
  protocolContent,
  smsVerifyEnabled,
  authFormInstance,
  hasMobileField,
  imageVerifyInputRef,

  onPhoneNumberChange,
  formatSelectOptions,
  submitAuth,
  onClickLogined,
  generateFormField,
} = useAuthInfoForm({
  emit,
});

defineExpose(authFormInstance);
</script>

<style lang="scss">
.c-mobile-auth-info-form {
  padding: 24px 24px 0;
}

.c-mobile-auth-info-form__registered-entrance {
  margin-bottom: 20px;
  font-size: 14px;
  color: #2196f3;
  text-align: center;
}

.c-mobile-auth-info-form__desc {
  margin-bottom: 24px;
  font-size: 14px;
  color: #999;
}

.c-mobile-auth-info-form__form {
  margin-top: 20px;
}

.c-mobile-auth-info-form__submit {
  position: sticky;
  bottom: 0;
  padding: 24px 0;
  background: #fff;
  @include iphone-x-pb(24px);
}
</style>
