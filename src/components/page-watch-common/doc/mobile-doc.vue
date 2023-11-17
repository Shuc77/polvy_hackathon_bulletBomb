<!-- @file 移动端文档组件 -->
<template>
  <div class="c-mobile-doc">
    <div
      ref="wrapRef"
      class="c-mobile-doc__wrap"
    ></div>

    <mobile-message-box
      class="c-mobile-doc__message-box"
      ref="confirmRef"
      :title="$lang('base.confirm')"
      :content="$lang('doc.deleteConfirm')"
      :confirm-button-text="$lang('base.confirm')"
      :cancel-button-text="$lang('base.cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import { MobileMessageBox } from '@/components/common-base/message-box';
import { useDoc } from './use-doc';

const { wrapRef, confirmRef } = useDoc();
</script>

<style lang="scss">
.c-mobile-doc {
  position: relative;
  z-index: 250;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.c-mobile-doc__wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-mobile-doc__message-box {
  z-index: $--zIndex-max-top;
}
</style>
