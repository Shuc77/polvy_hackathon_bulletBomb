<!-- @file PC 端表单组件：输入框 -->
<template>
  <div
    class="c-pc-form-input"
    :class="inputClassNames"
  >
    <div class="c-pc-form-input__main">
      <slot name="prefix"></slot>
      <div class="c-pc-form-input__main__inner">
        <input
          ref="inputRef"
          class="c-pc-form-input__main__input"
          :type="type"
          :value="value"
          :placeholder="placeholder"
          :maxlength="maxlength"
          @input="onInputChanged"
          @blur="onInputBlur"
          @focus="onInputFocus"
          @keydown.enter="onInputEnter"
        />
      </div>
      <template v-if="clearabled && value">
        <div
          class="c-pc-form-input__main__input__clearabled"
          @click="clearValue"
        >
          <pc-icon-close-round-fill />
        </div>
      </template>
      <slot
        v-else
        name="suffix"
      >
        <span
          v-if="suffixText"
          class="c-pc-form-input__main__input__suffix-text"
        >
          {{ suffixText }}
        </span>
        <span
          v-else-if="wordLimitText"
          class="c-pc-form-input__main__input__suffix-text"
        >
          {{ wordLimitText }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconCloseRoundFill } from '@/components/component-icons/pc/map';
import { useProps } from '@/assets/utils/vue-utils/props-utils';
import { formInputEmits, formInputProps, useFormInput } from './hooks/use-form-input';

const emit = defineEmits(formInputEmits());

const props = defineProps(formInputProps());

const { value, type, placeholder, maxlength } = useProps(props);

const {
  inputRef,
  inputClassNames,
  onInputChanged,
  onInputBlur,
  onInputFocus,
  onInputEnter,
  clearValue,
  formInstance,
  wordLimitText,
} = useFormInput({
  props,
  emit,
  classPrefix: 'c-pc-form-input',
});

defineExpose(formInstance);
</script>

<style lang="scss">
.c-pc-form-input {
  display: flex;
}

.c-pc-form-input__main {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  align-items: center;
  height: $--form-input-height;
  overflow: hidden;
  background: $--form-input-bg;
  border: 1px solid $--form-input-border-color;
  border-radius: 2px;
}

.c-pc-form-input__main__input__clearabled {
  margin-right: 8px;
  font-size: 12px;
  color: #757575;
  cursor: pointer;
}

.c-pc-form-input__main__inner {
  flex: 1;
  height: 100%;
}

.c-pc-form-input__main__input {
  @include clear-input-style;
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 100%;
  padding: $--form-input-padding;
  font-size: $--form-input-font-size;
  color: $--font-color-primary;
  background: none;
}

.c-pc-form-input__main__input__suffix-text {
  padding-right: 8px;
  font-size: 12px;
  color: #9e9e9e;
  white-space: nowrap;
}

.c-pc-form-input--error {
  .c-pc-form-input__main {
    background: $--form-input-bg-error;
    border-color: $--form-input-border-color-error;
  }
}

.c-pc-form-input--size-small {
  .c-pc-form-input__main {
    height: $--form-input-height-small;
  }
  .c-pc-form-input__main__input {
    padding: $--form-input-padding-small;
    font-size: $--form-input-font-size-small;
  }
}
</style>
