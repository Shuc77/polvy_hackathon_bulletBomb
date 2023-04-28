<!-- @file PC 端表单组件：图片验证码输入框 -->
<template>
  <div class="c-pc-form-image-verify-input">
    <pc-form-input
      v-bind="attrs"
      :value="value"
      :placeholder="inputPlaceholder"
      :maxlength="5"
      @input="onInputChange"
    >
      <img
        slot="suffix"
        class="c-pc-form-image-verify-input__image"
        :src="imageUrl"
        @click="refreshVerifyImage()"
      />
    </pc-form-input>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import PcFormInput from '@/components/common-base/form/form-input/pc-form-input.vue';
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
.c-pc-form-image-verify-input__image {
  flex-shrink: 0;
  width: 132px;
  height: 32px;
  margin-right: 4px;
  cursor: pointer;
}
</style>
