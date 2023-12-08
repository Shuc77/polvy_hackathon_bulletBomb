<!-- @file PC 端表单组件：短信验证码输入框 -->
<template>
  <div class="c-pc-form-sms-verify-input">
    <pc-form-input
      v-bind="attrs"
      :placeholder="inputPlaceholder"
      :maxlength="4"
      :value="value"
      @input="onInputChange"
    >
      <div
        slot="suffix"
        class="c-pc-form-sms-verify-input__send"
        :class="{
          'c-pc-form-sms-verify-input__send--disabled': sendDisabled,
        }"
        @click="onClickSend"
      >
        {{ sendText }}
      </div>
    </pc-form-input>

    <div
      v-if="slideVerifyVisible && validType === SmsValidType.Slider"
      class="c-pc-form-sms-verify-input__slide"
    >
      <pc-form-slide-verify @verify-success="toSendSliderSmsCode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import PcFormInput from '@/components/common-base/form/form-input/pc-form-input.vue';
import PcFormSlideVerify from '@/components/common-base/form/form-slide-verify/pc-form-slide-verify.vue';
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
  SmsValidType,
  onInputChange,
  onClickSend,
  toSendSliderSmsCode,
} = useSmsVerifyInput({ props, emit });
</script>

<style lang="scss">
.c-pc-form-sms-verify-input {
  position: relative;
}
.c-pc-form-sms-verify-input__send {
  display: flex;
  align-items: center;
  height: 100%;
  padding-right: 12px;
  font-size: 14px;
  color: #3082fe;
  white-space: nowrap;
  cursor: pointer;
}

.c-pc-form-sms-verify-input__send--disabled {
  color: $--font-color-disabled;
  cursor: not-allowed;
}

.c-pc-form-sms-verify-input__slide {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  background: $--color-white;
  box-shadow: $--shadow-popper;
}
</style>
