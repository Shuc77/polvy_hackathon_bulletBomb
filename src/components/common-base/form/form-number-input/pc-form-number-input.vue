<!-- @file PC 端表单组件：数值输入框 -->
<template>
  <div class="c-pc-number-input">
    <pc-form-input
      ref="inputRef"
      v-bind="attrs"
      type="number"
      :value="value"
      @input="onInputChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import PcFormInput from '@/components/common-base/form/form-input/pc-form-input.vue';
import {
  formNumberInputProps,
  formNumberInputEmits,
  useFormNumberInput,
} from './use-form-number-input';

const props = defineProps(formNumberInputProps());

const emit = defineEmits(formNumberInputEmits());

const attrs = useAttrs();

const { inputRef, value, onInputChange } = useFormNumberInput({
  props,
  emit,
});
</script>
