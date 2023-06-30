<!-- @file 表单提交按钮组件 -->
<template>
  <normal-button
    :text="text"
    :native-type="nativeType"
    :type="type"
    :size="size"
    :block="block"
    :disabled="disabled || buttonIsDisabled"
    @click="onButtonClick"
  />
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { formSubmitButtonProps, useFormSubmitButton } from './hooks/use-form-submit-button';

const props = defineProps(formSubmitButtonProps());

const { buttonIsDisabled, onButtonClick } = useFormSubmitButton({
  props,
});
</script>
