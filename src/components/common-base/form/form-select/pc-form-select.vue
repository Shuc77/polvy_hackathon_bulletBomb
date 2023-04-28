<!-- @file PC 端表单组件：下拉选择 -->
<template>
  <div class="c-pc-form-select">
    <div
      ref="referenceRef"
      class="c-pc-form-select__body"
      :class="{
        'c-pc-form-select__body--open': popperVisible,
        'c-pc-form-select__body--error': formItemIsError,
      }"
    >
      <input
        type="text"
        class="c-pc-form-select__body__input"
        :value="inputValue"
        :placeholder="inputPlaceholder"
        readonly
      />
      <pc-icon-arrow-down class="c-pc-form-select__body__icon" />
    </div>

    <transition name="fade">
      <div
        ref="popperRef"
        v-show="popperVisible"
        class="c-pc-form-select__options"
      >
        <div
          v-for="(option, index) in optionList"
          class="c-pc-form-select__options__item"
          :key="index"
          @click="onClickOption(option)"
        >
          <pc-form-checkbox
            v-if="multiple"
            :checked="isSelectedOption(option.value)"
          />
          <span class="c-pc-form-select__options__item__text">{{ option.label }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PcIconArrowDown } from '@/components/component-icons/pc/map';
import PcFormCheckbox from '../form-checkbox/pc-form-checkbox.vue';
import { formSelectProps, formSelectEmits, useFormSelect } from './use-form-select';
import { usePopper } from '@/hooks/components/use-popper';
import { watch, unref } from 'vue';

const props = defineProps(formSelectProps());

const emit = defineEmits(formSelectEmits());

const { referenceRef, popperRef, popperVisible, hidePopper } = usePopper({
  placement: 'bottom-start',
  followReferenceWidth: true,
});

const {
  multiple,
  inputValue,
  inputPlaceholder,
  optionList,
  onClickOption,
  isSelectedOption,
  formItemIsError,
  blurToValidateItem,
  focusToRemoveError,
} = useFormSelect({
  props,
  emit,
  closeOptions: () => {
    hidePopper();
  },
});

watch(
  () => unref(popperVisible),
  () => {
    if (unref(popperVisible) === false) {
      blurToValidateItem();
    } else {
      focusToRemoveError();
    }
  },
);
</script>

<style lang="scss">
.c-pc-form-select {
  display: flex;
}
.c-pc-form-select__body {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  align-items: center;
  height: $--form-input-height;
  overflow: hidden;
  cursor: pointer;
  background: $--form-input-bg;
  border: 1px solid $--form-input-border-color;
  border-radius: 2px;
}

.c-pc-form-select__body__input {
  @include clear-input-style;
  box-sizing: border-box;
  display: block;
  flex: 1;
  height: 100%;
  padding: $--form-input-padding;
  font-size: $--form-input-font-size;
  color: $--font-color-primary;
  cursor: inherit;
  background: none;
}

.c-pc-form-select__body__icon {
  display: flex;
  margin-right: 8px;
  font-size: 16px !important;
  color: #9e9e9e;
  transition: 0.3s;
}

.c-pc-form-select__body--open {
  .c-pc-form-select__body__icon {
    transform: rotateZ(180deg);
  }
}

.c-pc-form-select__body--error {
  background: #ffe9e9;
  border-color: #ff5722;
}

.c-pc-form-select__options {
  max-height: 200px;
  overflow-y: auto;
  background: $--color-white;
  border: 1px solid $--form-input-border-color;
  border-radius: 2px;
  @include scroll-style;
}

.c-pc-form-select__options__item {
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 40px;
  cursor: pointer;
  user-select: none;
}
.c-pc-form-select__options__item:hover {
  background: $--color-primary-light-8;
}
.c-pc-form-select__options__item__text {
  flex: 1;
  @include singleline-text;
}
</style>
