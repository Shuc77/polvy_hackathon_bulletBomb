<!-- @file PC 端播放器右侧弹出层 -->
<template>
  <div
    v-show="visible"
    class="c-pc-side-popup"
    :style="sidePopupStyle"
  >
    <!-- 关闭按钮 -->
    <div
      class="c-pc-side-popup__btn__close"
      @click="closePopup"
    >
      <plv-admin-icon icon="close" />
    </div>

    <transition
      name="slide"
      @after-enter="afterEnter"
      @after-leave="afterLeave"
    >
      <div class="c-pc-side-popup__body">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PlvAdminIcon } from '@/plugins/polyv-ui/admin-import';

import { sidePcPopupProps, sidePcPopupEmits, useSidePcPopup } from './use-pc-side-popup';

const props = defineProps(sidePcPopupProps());

const emits = defineEmits(sidePcPopupEmits());

const { sidePopupStyle, afterEnter, afterLeave, closePopup, couponSidePopupInstance } =
  useSidePcPopup({
    props,
    emits,
  });

defineExpose(couponSidePopupInstance);
</script>

<style lang="scss">
.c-pc-side-popup {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-pc-side-popup__btn__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 24px;
  line-height: 18px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  background: rgba(#000, 0.2);
  border-radius: 50%;
}

.c-pc-side-popup__body {
  position: relative;
  z-index: 0;
  height: 100%;
}
</style>
