<!-- @file 移动端动作面板 -->
<template>
  <mobile-popup
    ref="popupRef"
    class="c-mobile-action-sheet"
    v-bind="attrs"
    v-on="listeners"
    :show-header="false"
    :visible.sync="actionVisible"
  >
    <div class="c-mobile-action-sheet__content">
      <div
        v-for="(option, index) in actions"
        :key="index"
        class="c-mobile-action-sheet__content__item"
        @click="onClickOption(option)"
      >
        {{ option.name }}
      </div>

      <div
        class="c-mobile-action-sheet__content__cancel"
        @click="onClickCancel"
      >
        {{ $lang('base.cancel') }}
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useAttrs, useListeners } from 'vue';
import { actionSheetProps, actionSheetEmits, useActionSheet } from './use-action-sheet';

const props = defineProps(actionSheetProps());

const emit = defineEmits(actionSheetEmits());

const attrs = useAttrs();

const listeners = useListeners();

const { actionVisible, popupRef, onClickOption, onClickCancel } = useActionSheet({
  props,
  emit,
});
</script>

<style lang="scss">
.c-mobile-action-sheet .c-mobile-popup__content {
  border-radius: 16px 16px 0 0 !important;
}

.c-mobile-action-sheet__content__item,
.c-mobile-action-sheet__content__cancel {
  height: 56px;
  font-size: 16px;
  line-height: 56px;
  text-align: center;
}

.c-mobile-action-sheet__content__item {
  border-bottom: 1px solid #f2f2f2;
  &:last-of-type {
    border-bottom: none;
  }
}

.c-mobile-action-sheet__content__cancel {
  border-top: 8px solid #f2f2f2;
}
</style>
