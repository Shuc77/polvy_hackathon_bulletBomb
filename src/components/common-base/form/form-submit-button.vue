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
import { useFormSubmitButton } from './hooks/use-form-submit-button';
import { normalButtonProps } from '../normal-button/use-normal-button';

defineProps(normalButtonProps());

const { buttonIsDisabled, onButtonClick } = useFormSubmitButton();
</script>
