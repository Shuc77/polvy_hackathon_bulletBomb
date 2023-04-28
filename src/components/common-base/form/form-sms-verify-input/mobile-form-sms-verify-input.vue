<!-- @file 移动端表单组件：短信验证码输入框 -->
<template>
  <div class="c-mobile-form-sms-verify-input">
    <mobile-form-input
      v-bind="attrs"
      :placeholder="inputPlaceholder"
      :maxlength="5"
      :value="value"
      @input="onInputChange"
    >
      <div
        slot="suffix"
        class="c-mobile-form-sms-verify-input__send"
        :class="{
          'c-mobile-form-sms-verify-input__send--disabled': sendDisabled,
        }"
        @click="onClickSend"
      >
        {{ sendText }}
      </div>
    </mobile-form-input>

    <div
      v-if="slideVerifyVisible"
      class="c-mobile-form-sms-verify-input__slide"
    >
      <mobile-form-slide-verify @verify-success="toSendSliderSmsCode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import MobileFormInput from '@/components/common-base/form/form-input/mobile-form-input.vue';
import MobileFormSlideVerify from '@/components/common-base/form/form-slide-verify/mobile-form-slide-verify.vue';
import {
  formSmsVerifyInputProps,
  formSmsVerifyInputEmits,
  useSmsVerifyInput,
} from './use-sms-verify-input';

const props = defineProps(formSmsVerifyInputProps());

const emit = defineEmits(formSmsVerifyInputEmits());

const attrs = useAttrs();

const {
  inputPlaceholder,
  sendDisabled,
  sendText,
  slideVerifyVisible,
  onInputChange,
  onClickSend,
  toSendSliderSmsCode,
} = useSmsVerifyInput({ props, emit });
</script>

<style lang="scss">
.c-mobile-form-sms-verify-input {
  position: relative;
}
.c-mobile-form-sms-verify-input__send {
  display: flex;
  align-items: center;
  height: 100%;
  padding-right: 12px;
  font-size: 14px;
  color: #3082fe;
  white-space: nowrap;
  cursor: pointer;
}

.c-mobile-form-sms-verify-input__send--disabled {
  color: $--font-color-disabled;
  cursor: not-allowed;
}

.c-mobile-form-sms-verify-input__slide {
  width: 100%;
  margin-top: 20px;
}
</style>
