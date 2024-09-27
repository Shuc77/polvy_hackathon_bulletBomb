<!-- @file 移动端表单组件：地区选择 -->
<template>
  <div
    class="c-mobile-form-area-picker"
    :class="{
      'c-mobile-form-area-picker--error': formItemIsError,
    }"
  >
    <div
      class="c-mobile-form-area-picker__body"
      @click="openPicker"
    >
      <input
        type="text"
        class="c-mobile-form-area-picker__body__input"
        readonly
        :placeholder="inputPlaceholder"
        :value="inputValue"
      />
      <mobile-icon-arrow-down class="c-mobile-form-area-picker__body__icon" />
    </div>

    <mobile-popup
      :visible.sync="pickerVisible"
      fill-body-section
      @close="onHiddenPicker"
    >
      <template #header>
        <div class="c-mobile-form-area-picker__header">
          <div
            class="c-mobile-form-area-picker__header__cancel"
            @click="closePicker"
          >
            {{ $lang('base.cancel') }}
          </div>
          <div class="c-mobile-form-area-picker__header__placeholder">{{ inputPlaceholder }}</div>
          <div
            class="c-mobile-form-area-picker__header__confirm"
            :class="{
              'c-mobile-form-area-picker__header__confirm--disabled': !innerIsFinish,
            }"
            @click="onClickConfirm"
          >
            {{ $lang('base.confirm') }}
          </div>
        </div>
      </template>

      <plv-area-picker
        v-model="innerValue"
        :key="refreshKey"
      />
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { MobileIconArrowDown } from '@/components/component-icons/mobile/map';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PlvAreaPicker } from '@/plugins/polyv-ui/mobile-import';
import type { AreaPickerComponent } from '@/plugins/polyv-ui/types';
import { formAreaPickerEmit, formAreaPickerProps, useFormAreaPicker } from './use-form-area-picker';

const props = defineProps(formAreaPickerProps());

const emit = defineEmits(formAreaPickerEmit());

const {
  innerValue,
  pickerVisible,
  openPicker,
  closePicker,
  inputValue,
  inputPlaceholder,
  instance,
  formItemIsError,
  onClickConfirm,
  innerIsFinish,
  refreshKey,
  onHiddenPicker,
} = useFormAreaPicker({
  props,
  emit,
  AreaPicker: PlvAreaPicker as AreaPickerComponent,
});

defineExpose(instance);
</script>

<style lang="scss">
.c-mobile-form-area-picker__body {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;

  height: map.get($--mobile-form-input-sizes, 'default', 'height');
  color: map.get($--mobile-form-input-themes, 'default', 'font-color');
  background: map.get($--mobile-form-input-themes, 'default', 'background');
  border-color: map.get($--mobile-form-input-themes, 'default', 'border-color');
  border-style: solid;

  border-width: 1px;
  border-radius: map.get($--mobile-form-input-sizes, 'default', 'radius');
}

.c-mobile-form-area-picker__body__input {
  @include clear-input-style;
  box-sizing: border-box;
  display: block;
  flex: 1;
  height: 100%;

  padding: map.get($--mobile-form-input-sizes, 'default', 'padding');
  font-size: map.get($--mobile-form-input-sizes, 'default', 'font-size');
  color: inherit;
}

.c-mobile-form-area-picker__body__icon {
  display: flex;
  margin-right: 16px;
  font-size: 20px !important;
  color: #9e9e9e;
}

.c-mobile-form-area-picker__header {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  width: 100%;
  height: 50px;
  padding: 0 16px;
  font-size: 16px;
  line-height: 50px;
  border-bottom: 1px solid $--border-color-primary;
}

.c-mobile-form-area-picker__header__cancel {
  color: #9195a1;
}
.c-mobile-form-area-picker__header__confirm {
  color: #3082fe;

  &.c-mobile-form-area-picker__header__confirm--disabled {
    color: #9e9e9e;
  }
}

.c-mobile-form-area-picker__header__placeholder {
  flex: 1;
  overflow: hidden;
  font-size: 16px;
  color: $--font-color-primary;
  text-align: center;
}

.c-mobile-form-area-picker--error {
  .c-mobile-form-area-picker__body {
    border-color: map.get($--mobile-form-input-themes, 'error', 'border-color');
  }
}
</style>
