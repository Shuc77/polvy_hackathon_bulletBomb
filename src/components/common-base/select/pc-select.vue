<!-- @file PC 端表单组件：下拉选择 -->
<template>
  <div class="c-pc-select">
    <div
      ref="referenceRef"
      class="c-pc-select__body"
      :class="{
        'c-pc-select__body--open': popperVisible,
      }"
    >
      <input
        type="text"
        class="c-pc-select__body__input"
        :value="inputValue"
        :placeholder="inputPlaceholder"
        readonly
      />
      <pc-icon-arrow-down class="c-pc-select__body__icon" />
    </div>

    <transition name="fade">
      <div
        ref="popperRef"
        v-show="popperVisible"
        class="c-pc-select__options"
      >
        <div
          v-if="optionList.length === 0"
          class="c-pc-select__options__empty"
        >
          {{ $lang('base.emptyOptions') }}
        </div>

        <div
          v-for="(option, index) in optionList"
          class="c-pc-select__options__item"
          :key="index"
          @click="onClickOption(option)"
        >
          <span class="c-pc-select__options__item__text">{{ option.label }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PcIconArrowDown } from '@/components/component-icons/pc/map';
import { selectProps, selectEmits, useSelect } from './use-select';
import { usePopper } from '@/hooks/components/use-popper';

const props = defineProps(selectProps());

const emit = defineEmits(selectEmits());

const { referenceRef, popperRef, popperVisible, hidePopper } = usePopper({
  placement: 'bottom-start',
  followReferenceWidth: true,
});

const { inputValue, inputPlaceholder, optionList, onClickOption } = useSelect({
  props,
  emit,
  closeOptions: () => {
    hidePopper();
  },
});
</script>

<style lang="scss" scoped>
.c-pc-select {
  display: flex;
}
.c-pc-select__body {
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

.c-pc-select__body__input {
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

.c-pc-select__body__icon {
  display: flex;
  margin-right: 8px;
  font-size: 16px !important;
  color: #9e9e9e;
  transition: 0.3s;
}

.c-pc-select__body--open {
  .c-pc-select__body__icon {
    transform: rotateZ(180deg);
  }
}

.c-pc-select__body--error {
  background: #ffe9e9;
  border-color: #ff5722;
}

.c-pc-select__options__empty {
  font-size: 14px;
  line-height: 40px;
  color: #757575;
  text-align: center;
}

.c-pc-select__options {
  max-height: 200px;
  overflow-y: auto;
  background: $--color-white;
  border: 1px solid $--form-input-border-color;
  border-radius: 2px;
  @include scroll-style;
}

.c-pc-select__options__item {
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
.c-pc-select__options__item:hover {
  background: $--color-primary-light-8;
}
.c-pc-select__options__item__text {
  flex: 1;
  @include singleline-text;
}
</style>
