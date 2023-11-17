<!-- @file 表单节点 -->
<template>
  <div
    class="c-form-item"
    :class="{
      'c-form-item--header': labelModel === 'header',
      'c-form-item--mobile': isMobile,
    }"
  >
    <div
      v-if="formItemIsError"
      class="c-form-item__anchor"
      data-form-item-error
    ></div>
    <div
      v-if="labelText"
      class="c-form-item__label"
      :style="labelStyle"
    >
      <span
        v-if="required"
        class="c-form-item__label__required"
      >
        *
      </span>
      {{ labelText }}
    </div>

    <div
      class="c-form-item__content"
      :class="{
        'c-form-item__content--has-width': !!contentWidthStyle,
      }"
      :style="{
        width: contentWidthStyle,
      }"
    >
      <slot></slot>
      <div
        v-if="itemErrorMessage"
        class="c-form-item__content__error"
      >
        {{ itemErrorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formItemProps, useFormItem } from './hooks/use-form-item';

const props = defineProps(formItemProps());

const {
  required,
  labelText,
  labelModel,
  labelStyle,
  itemErrorMessage,
  contentWidthStyle,
  formItemIsError,
  formItemInstance,
  isMobile,
} = useFormItem({
  props,
});

defineExpose(formItemInstance);
</script>

<style lang="scss">
.c-form-item {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.c-form-item__anchor {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.c-form-item__label__required {
  color: #ff3636;
}
.c-form-item__label {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  padding-right: 16px;
  font-size: 14px;
}

.c-form-item__content {
  // min-height: 40px;
  position: relative;
  flex-shrink: 0;

  &:not(.c-form-item__content--has-width) {
    flex: 1;
  }
}

.c-form-item--header {
  flex-direction: column;
  .c-form-item__label {
    justify-content: flex-start;
    width: 100%;
    padding-right: 0;
    margin-bottom: 8px;
    line-height: 1.5;
    color: $--font-color-primary;
  }
  .c-form-item__content {
    width: 100%;
  }

  &.c-form-item--mobile {
    .c-form-item__label {
      padding: 0 16px;
    }
  }
}

.c-form-item__content__error {
  position: absolute;
  top: 100%;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  padding-top: 5px;
  font-size: 12px;
  color: $--font-color-error;
}

.c-form-item--mobile {
  .c-form-item__content__error {
    padding-right: 16px;
    padding-left: 16px;
  }
}
</style>
