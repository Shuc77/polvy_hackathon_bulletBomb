<template>
  <mobile-popup
    class="c-dynamic-popup"
    ref="popupRef"
    v-bind="$attrs"
    v-on="$listeners"
    @body-scroll="handleBodyScroll"
    @after-leave="handleAfterLeave"
    :content-percent-height="contentPercentHeight"
  >
    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '../popup/mobile-popup.vue';
import { computed, ref } from 'vue';

const props = defineProps<{
  /** 初始高度 */
  initHeight?: number;
  /** 最大高度 */
  maxHeight?: number;
}>();

const emits = defineEmits(['body-scroll', 'after-leave']);

const prevScrollHeight = ref(0);

const addScrollHeight = ref(0);

const contentPercentHeight = computed(() => {
  return Math.min((props.initHeight || 0.5) + addScrollHeight.value, props.maxHeight || 0.8);
});

const maxHeight = computed(() => {
  return props.maxHeight || 0.8;
});

const minHeight = computed(() => {
  return props.initHeight || 0.5;
});

const isMaxHeight = computed(() => {
  return addScrollHeight.value + minHeight.value >= maxHeight.value;
});

const popupRef = ref<InstanceType<typeof MobilePopup>>();

// 能滚动的最大高度也受页面滚动距离影响
function handleBodyScroll(event: unknown) {
  if (!popupRef.value) return;
  const body = popupRef.value.$el.querySelector('.c-mobile-popup__body');
  if (!body) return;

  if (!isMaxHeight.value && body.scrollTop > prevScrollHeight.value) {
    const scrollTop = body.scrollTop;
    addScrollHeight.value += (scrollTop - prevScrollHeight.value) / window.innerHeight;
    prevScrollHeight.value = scrollTop;
  }
  emits('body-scroll', event);
}

function handleAfterLeave(event: unknown) {
  addScrollHeight.value = 0;
  prevScrollHeight.value = 0;

  emits('after-leave', event);
}
</script>

<style lang="scss">
.c-dynamic-popup {
  .c-mobile-popup__body {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
}

.c-dynamic-popup__content--overflow {
  overflow: hidden;
}
</style>
