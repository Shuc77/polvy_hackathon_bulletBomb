<!-- @file 移动端表单组件：下拉选择 -->
<template>
  <div class="c-mobile-form-select">
    <div
      class="c-mobile-form-select__body"
      @click="openOption"
    >
      <input
        type="text"
        class="c-mobile-form-select__body__input"
        readonly
        :placeholder="inputPlaceholder"
        :value="inputValue"
      />
      <mobile-icon-arrow-down class="c-mobile-form-select__body__icon" />
    </div>

    <mobile-popup :visible.sync="optionVisible">
      <template #header>
        <div class="c-mobile-form-select__header">
          <div
            class="c-mobile-form-select__header__cancel"
            @click="closeOption"
          >
            {{ $lang('base.cancel') }}
          </div>
          <div
            class="c-mobile-form-select__header__confirm"
            @click="onClickConfirm"
          >
            {{ $lang('base.confirm') }}
          </div>
        </div>
      </template>

      <div class="c-mobile-form-select__options">
        <div
          v-if="title"
          class="c-mobile-form-select__options__title"
        >
          {{ title }}
        </div>
        <div
          v-for="(item, index) in optionList"
          :key="index"
          class="c-mobile-form-select__options__item"
          :class="{
            'c-mobile-form-select__options__item--active': isSelectedOption(item.value),
          }"
          @click="onClickOption(item)"
        >
          {{ item.label }}
        </div>
      </div>
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { MobileIconArrowDown } from '@/components/component-icons/mobile/map';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import {
  formSelectProps,
  formSelectEmits,
  useFormSelect,
  useFormSelectMobile,
} from './use-form-select';

const props = defineProps(formSelectProps());

const emit = defineEmits(formSelectEmits());

const { title, inputValue, inputPlaceholder, optionList } = useFormSelect({
  props,
  emit,
});

const { optionVisible, openOption, closeOption, onClickOption, onClickConfirm, isSelectedOption } =
  useFormSelectMobile({
    props,
    emit,
  });
</script>

<style lang="scss">
.c-mobile-form-select__body {
  display: flex;
  align-items: center;

  height: map.get($--mobile-form-input-sizes, 'default', 'height');
  color: map.get($--mobile-form-input-themes, 'default', 'font-color');
  background: map.get($--mobile-form-input-themes, 'default', 'background');

  border-color: map.get($--mobile-form-input-themes, 'default', 'border-color');
  border-radius: map.get($--mobile-form-input-sizes, 'default', 'radius');
}

.c-mobile-form-select__body__input {
  @include clear-input-style;
  box-sizing: border-box;
  display: block;
  flex: 1;
  height: 100%;

  padding: map.get($--mobile-form-input-sizes, 'default', 'padding');
  font-size: map.get($--mobile-form-input-sizes, 'default', 'font-size');
  color: inherit;
}

.c-mobile-form-select__body__icon {
  display: flex;
  margin-right: 16px;
  font-size: 20px !important;
  color: #9e9e9e;
}

.c-mobile-form-select__header {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  width: 100%;
  height: 50px;
  padding: 0 16px;
  font-size: 16px;
  line-height: 50px;
  border-bottom: 1px solid $--border-color-primary;
}

.c-mobile-form-select__header__cancel {
  color: #9195a1;
}
.c-mobile-form-select__header__confirm {
  color: #3082fe;
}

.c-mobile-form-select__options {
  padding: 20px 24px;
}

.c-mobile-form-select__options__title {
  margin-bottom: 18px;
  font-size: 14px;
  color: #666;
}

.c-mobile-form-select__options__item {
  height: 40px;
  padding: 0 16px;
  margin-bottom: 20px;
  line-height: 40px;
  color: #333;
  background: #f6f6f6;
  border-radius: 20px;

  &:last-of-type {
    margin-bottom: 0;
  }
}
.c-mobile-form-select__options__item--active {
  color: #3082fe;
  background: #e0ecfe;
}
</style>
