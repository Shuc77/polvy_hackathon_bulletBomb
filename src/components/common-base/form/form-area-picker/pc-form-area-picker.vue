<!-- @file PC 端表单组件：地区选择 -->
<template>
  <div
    class="c-pc-form-area-picker"
    :class="{
      'c-pc-form-area-picker--error': formItemIsError,
    }"
  >
    <plv-area-picker
      v-model="innerValue"
      :placeholder="placeholder"
      @hidden-popper="onHiddenPicker"
      @show-popper="onShowPicker"
    />
  </div>
</template>

<script setup lang="ts">
import { PlvAreaPicker } from '@/plugins/polyv-ui/pc-import';
import type { AreaPickerComponent } from '@/plugins/polyv-ui/types';
import { formAreaPickerEmit, formAreaPickerProps, useFormAreaPicker } from './use-form-area-picker';

const props = defineProps(formAreaPickerProps());

const emit = defineEmits(formAreaPickerEmit());

const { innerValue, instance, formItemIsError, onHiddenPicker, onShowPicker } = useFormAreaPicker({
  props,
  emit,
  AreaPicker: PlvAreaPicker as AreaPickerComponent,
});

defineExpose(instance);
</script>

<style lang="scss">
.c-pc-form-area-picker--error {
  .plv-area-picker__input {
    background: #ffe9e9;
    border-color: #ff5722;

    input {
      background: none;
    }
  }
}
</style>
