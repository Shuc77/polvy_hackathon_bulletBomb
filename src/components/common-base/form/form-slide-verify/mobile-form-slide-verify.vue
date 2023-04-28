<!-- @file 移动端表单组件：滑块验证码 -->
<template>
  <div class="c-mobile-form-slide-verify">
    <div :id="id"></div>
  </div>
</template>

<script setup lang="ts">
import { formSlideVerifyProps, formSlideVerifyEmits, useSlideVerify } from './use-slide-verify';

const props = defineProps(formSlideVerifyProps());

const emit = defineEmits(formSlideVerifyEmits());

const { id } = useSlideVerify({ emit, props });
</script>

<style lang="scss">
$--slide-verify-height: 48px !default;

.c-mobile-form-slide-verify {
  .sm-pop-inner {
    position: relative;
    overflow: hidden;
    border-radius: calc($--slide-verify-height / 2);
  }

  .nc_wrapper {
    width: 100% !important;
    height: $--slide-verify-height !important;
  }

  .nc_scale {
    height: $--slide-verify-height !important;
  }

  .nc-lang-cnt {
    line-height: $--slide-verify-height !important;
  }

  .btn_slide,
  .btn_ok {
    box-sizing: border-box;
    width: $--slide-verify-height !important;
    height: $--slide-verify-height !important;
    font-size: 24px;
    line-height: $--slide-verify-height !important;
    border: none !important;
    border-radius: 50%;
  }

  .btn_ok {
    color: #366bee !important;
  }

  .nc_ok,
  .nc-container .nc_scale .nc_bg {
    background: rgba(#366bee, 0.6) !important;
  }
}
</style>
