<!-- @file 移动端协议勾选 -->
<template>
  <div class="c-mobile-form-protocol">
    <mobile-form-checkbox
      v-bind="attrs"
      :checked="checkboxChecked"
      @change="onCheckboxChange"
    >
      <div
        class="c-mobile-form-protocol__content"
        v-html="contentHtml"
      ></div>
    </mobile-form-checkbox>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import MobileFormCheckbox from '../form-checkbox/mobile-form-checkbox.vue';
import { formProtocolProps, formProtocolEmits, useFormProtocol } from './use-form-protocol';

const props = defineProps(formProtocolProps());

const emit = defineEmits(formProtocolEmits());

const attrs = useAttrs();

const { checkboxChecked, contentHtml, onCheckboxChange } = useFormProtocol({
  props,
  emit,
});
</script>

<style lang="scss">
.c-mobile-form-protocol__content {
  font-size: 14px;
  a {
    font-style: normal;
    color: $--color-primary;
    text-decoration: none;
    cursor: pointer;
  }
}
</style>
