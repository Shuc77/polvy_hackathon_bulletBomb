<!-- @file PC 端协议勾选 -->
<template>
  <div class="c-pc-form-protocol">
    <pc-form-checkbox
      v-bind="attrs"
      :checked="checkboxChecked"
      @change="onCheckboxChange"
    >
      <div
        class="c-pc-form-protocol__content"
        v-html="contentHtml"
      ></div>
    </pc-form-checkbox>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import PcFormCheckbox from '../form-checkbox/pc-form-checkbox.vue';
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
.c-pc-form-protocol {
  .c-pc-form-checkbox__inner {
    margin-top: 3px;
  }
}
.c-pc-form-protocol__content {
  a {
    font-style: normal;
    color: $--color-primary;
    text-decoration: none;
    cursor: pointer;
  }
}
</style>
