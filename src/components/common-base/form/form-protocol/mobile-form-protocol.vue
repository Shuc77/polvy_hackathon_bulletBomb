<!-- @file 移动端协议勾选 -->
<template>
  <div class="c-mobile-form-protocol">
    <mobile-form-checkbox
      v-bind="attrs"
      :checked="checkboxChecked"
      @change="onCheckboxChange"
    >
      <div
        ref="protocolContentRef"
        class="c-mobile-form-protocol__content"
        v-html="contentHtml"
      ></div>
    </mobile-form-checkbox>

    <!-- 移动端使用弹窗来展示隐私协议的内容 -->
    <mobile-popup
      :title="popupTitle"
      :visible.sync="popupVisible"
      :close-on-click-mask="false"
      :content-percent-height="0.7"
    >
      <div class="c-mobile-form-protocol-popup">
        <iframe
          class="c-mobile-form-protocol-popup__iframe"
          :src="popupIframeUrl"
        ></iframe>
      </div>
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileFormCheckbox from '../form-checkbox/mobile-form-checkbox.vue';
import { formProtocolProps, formProtocolEmits, useFormProtocol } from './use-form-protocol';

const props = defineProps(formProtocolProps());
const emit = defineEmits(formProtocolEmits());
const attrs = useAttrs();

const popupVisible = ref(false);
const popupTitle = ref('');
const popupIframeUrl = ref('');

const {
  checkboxChecked,
  onCheckboxChange,

  protocolContentRef,
  contentHtml,
} = useFormProtocol({
  props,
  emit,
  onProtocolClick: el => {
    popupIframeUrl.value = el.href;
    popupTitle.value = el.getAttribute('title') || el.innerText;
    popupVisible.value = true;
  },
});
</script>

<style lang="scss">
.c-mobile-form-protocol__content {
  font-size: 14px;
  a {
    font-style: normal;
    color: $--color-primary;
    text-decoration: none;
    cursor: pointer;
  }
}

.c-mobile-form-protocol-popup {
  height: 100%;
  -webkit-overflow-scrolling: touch;
}
.c-mobile-form-protocol-popup__iframe {
  z-index: 10019;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  border: none;
}
</style>
