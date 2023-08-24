<!-- @file PC 端文档组件 -->
<template>
  <div class="c-pc-doc">
    <div
      ref="wrapRef"
      class="c-pc-doc__wrap"
    ></div>

    <pc-doc-empty-placeholder v-if="emptyPlaceholderVisible" />

    <!-- 画笔开关 -->
    <pc-doc-paint-switch />

    <pc-message
      ref="confirmRef"
      :title="$lang('base.confirm')"
      :content="$lang('doc.deleteConfirm')"
      :width="360"
      content-center
      :confirm-button-text="$lang('base.confirm')"
      :cancel-button-text="$lang('base.cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import PcMessage from '@/components/common-base/message-box/pc-message-box.vue';
import PcDocEmptyPlaceholder from './pc-doc-empty-placeholder.vue';
import PcDocPaintSwitch from './doc-paint-switch/pc-doc-paint-switch.vue';
import { useDoc } from './use-doc';
import { useDocKeydownControl } from './_hooks/use-keydown-control';
import { collectPlayerKeyboardEffectElements } from '@/components/page-watch-common/player/hooks/use-player-keyboard';

const { wrapRef, emptyPlaceholderVisible, confirmRef } = useDoc();

collectPlayerKeyboardEffectElements(wrapRef);
useDocKeydownControl();
</script>

<style lang="scss">
.c-pc-doc {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.c-pc-doc__wrap {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
}
</style>
