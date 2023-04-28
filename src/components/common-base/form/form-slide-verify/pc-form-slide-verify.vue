<!-- @file PC 端表单组件：滑块验证码 -->
<template>
  <div class="c-pc-form-slide-verify">
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
.c-pc-form-slide-verify {
  .sm-pop-inner {
    position: relative;
  }

  .nc_wrapper {
    width: 100% !important;
    height: 40px !important;
  }

  .nc_scale {
    height: 40px !important;
  }

  .nc-lang-cnt {
    line-height: 40px !important;
  }

  .btn_slide,
  .btn_ok {
    box-sizing: border-box;
    height: 40px !important;
    font-size: 18px;
    line-height: 38px !important;
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
