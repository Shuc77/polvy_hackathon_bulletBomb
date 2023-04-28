<!-- @file 移动端表单组件：输入框 -->
<template>
  <div
    class="c-mobile-form-input pws-mobile-form-input"
    :class="inputClassNames"
  >
    <div
      class="c-mobile-form-input__main pws-mobile-form-input-main"
      :class="{
        'c-mobile-form-input__main--has-title': inputTitle,
      }"
    >
      <slot name="prefix"></slot>
      <div
        v-if="inputTitle"
        class="c-mobile-form-input__main__title pws-mobile-form-input-main-title"
        :style="{
          minWidth: `${inputTitleWidth}px`,
        }"
      >
        {{ inputTitle }}
      </div>
      <div class="c-mobile-form-input__main__input">
        <input
          ref="inputRef"
          class="c-mobile-form-input__main__input__inner pws-mobile-form-input-main-input"
          :type="type"
          :value="value"
          :placeholder="placeholder"
          :maxlength="maxlength"
          :disabled="disabled"
          @input="onInputChanged"
          @blur="onInputBlur"
          @focus="onInputFocus"
        />
      </div>
      <slot name="suffix">
        <span
          v-if="suffixText"
          class="c-mobile-form-input__main__input__suffix-text pws-mobile-form-input-suffix"
        >
          {{ suffixText }}
        </span>
        <span
          v-else-if="wordLimitText"
          class="c-mobile-form-input__main__input__suffix-text pws-mobile-form-input-suffix"
        >
          {{ wordLimitText }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils, useProps } from '@/assets/utils/vue-utils/props-utils';
import { formInputEmits, formInputProps, useFormInput } from './hooks/use-form-input';

const emit = defineEmits(formInputEmits());

const props = defineProps({
  ...formInputProps(),
  /** 输入框标题，仅移动端下适用 */
  inputTitle: PropUtils.string.def(''),
  /** 输入框标题宽度 */
  inputTitleWidth: PropUtils.number.def(undefined),
});

const { value, type, placeholder, maxlength, inputTitle } = useProps(props);

const {
  inputRef,
  inputClassNames,
  onInputChanged,
  onInputBlur,
  onInputFocus,
  formInstance,
  wordLimitText,
} = useFormInput({
  props,
  emit,
  classPrefix: 'c-mobile-form-input',
});

defineExpose(formInstance);
</script>

<style lang="scss">
.c-mobile-form-input {
  display: flex;
}

.c-mobile-form-input__main {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  align-items: center;

  height: map.get($--mobile-form-input-sizes, 'default', 'height');
  overflow: hidden;
  background: map.get($--mobile-form-input-themes, 'default', 'background');

  border-color: map.get($--mobile-form-input-themes, 'default', 'border-color');
  border-style: solid;
  border-width: 1px;
  border-radius: map.get($--mobile-form-input-sizes, 'default', 'radius');
}

.c-mobile-form-input__main__title {
  box-sizing: border-box;
  flex-shrink: 0;
  padding-left: 16px;
  font-size: 16px;
  color: map.get($--mobile-form-input-themes, 'default', 'font-color');
}

.c-mobile-form-input__main__input {
  box-sizing: border-box;
  display: block;
  flex: 1;
  height: 100%;

  padding: map.get($--mobile-form-input-sizes, 'default', 'padding');
  font-size: map.get($--mobile-form-input-sizes, 'default', 'font-size');
  color: inherit;
}
.c-mobile-form-input__main__input__inner {
  @include clear-input-style;
  display: block;
  width: 100%;
  height: 100%;
  font-size: inherit;
  color: map.get($--mobile-form-input-themes, 'default', 'font-color');
  background: none;
  border: none;
  outline: none;
}
.c-mobile-form-input__main__input__suffix-text {
  padding-right: 16px;
  font-size: 16px;
  color: #aaa;
}

.c-mobile-form-input--size-medium {
  .c-mobile-form-input__main {
    height: map.get($--mobile-form-input-sizes, 'medium', 'height');
    border-radius: map.get($--mobile-form-input-sizes, 'medium', 'radius');
  }
  .c-mobile-form-input__main__input {
    padding: map.get($--mobile-form-input-sizes, 'medium', 'padding');
    font-size: map.get($--mobile-form-input-sizes, 'medium', 'font-size');
  }
}

.c-mobile-form-input--size-small {
  .c-mobile-form-input__main {
    height: map.get($--mobile-form-input-sizes, 'small', 'height');
    border-radius: map.get($--mobile-form-input-sizes, 'small', 'radius');
  }
  .c-mobile-form-input__main__input {
    padding: map.get($--mobile-form-input-sizes, 'small', 'padding');
    font-size: map.get($--mobile-form-input-sizes, 'small', 'font-size');
  }
}

.c-mobile-form-input--error {
  .c-mobile-form-input__main {
    color: map.get($--mobile-form-input-themes, 'error', 'font-color');
    background: map.get($--mobile-form-input-themes, 'error', 'background');
    border-color: map.get($--mobile-form-input-themes, 'error', 'border-color');
  }
}

.c-mobile-form-input--theme-dark {
  .c-mobile-form-input__main {
    background: map.get($--mobile-form-input-themes, 'dark', 'background');
    border-color: map.get($--mobile-form-input-themes, 'dark', 'border-color');
  }
  .c-mobile-form-input__main__title {
    color: map.get($--mobile-form-input-themes, 'dark', 'font-color');
  }
  .c-mobile-form-input__main__input__inner {
    color: map.get($--mobile-form-input-themes, 'dark', 'font-color');
  }
}

.c-mobile-form-input--theme-simplicity {
  .c-mobile-form-input__main {
    background: none;
    border: none;
    border-bottom: 1px solid rgba($--color-white, 0.1);
    border-radius: 0;
  }
  .c-mobile-form-input__main__input__inner {
    color: $--color-white;
    text-align: center;
  }
}
</style>
