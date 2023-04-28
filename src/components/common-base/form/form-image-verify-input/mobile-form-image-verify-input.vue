<!-- @file 移动端表单组件：图片验证码输入框 -->
<template>
  <div class="c-mobile-form-image-verify-input">
    <mobile-form-input
      v-bind="attrs"
      :value="value"
      :placeholder="inputPlaceholder"
      :maxlength="5"
      @input="onInputChange"
    >
      <img
        slot="suffix"
        class="c-mobile-form-image-verify-input__image"
        :src="imageUrl"
        @click="refreshVerifyImage()"
      />
    </mobile-form-input>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import MobileFormInput from '@/components/common-base/form/form-input/mobile-form-input.vue';
import {
  formImageVerifyInputProps,
  formImageVerifyInputEmits,
  useImageVerifyInput,
} from './use-image-verify-input';

const props = defineProps(formImageVerifyInputProps());

const emit = defineEmits(formImageVerifyInputEmits());

const attrs = useAttrs();

const { inputPlaceholder, imageUrl, refreshVerifyImage, onInputChange, instance } =
  useImageVerifyInput({
    props,
    emit,
  });

defineExpose(instance);
</script>

<style lang="scss">
.c-mobile-form-image-verify-input__image {
  flex-shrink: 0;
  width: 132px;
  height: 32px;
  margin-right: 16px;
  cursor: pointer;
}
</style>
