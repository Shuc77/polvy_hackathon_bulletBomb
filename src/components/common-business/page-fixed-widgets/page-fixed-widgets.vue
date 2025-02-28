<!-- @file PC 端页面固定挂件 -->
<template>
  <div
    class="c-page-fixed-widgets"
    :class="{
      'c-page-fixed-widgets--absolute': isInjectByExternalApp(),
    }"
  >
    <!-- 回到顶部 -->
    <fixed-back-top />

    <!-- 分享 -->
    <fixed-web-share v-if="!hideWebShare && shareBtnEnabled" />
  </div>
</template>

<script setup lang="ts">
import { PropUtils, useProps } from '@/assets/utils/vue-utils/props-utils';
import FixedWebShare from './fixed-web-share.vue';
import FixedBackTop from './fixed-back-top.vue';
import { useShareStore } from '@/store/use-share-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { isInjectByExternalApp } from '@/assets/utils/utils';

const props = defineProps({
  /** 是否隐藏分享 */
  hideWebShare: PropUtils.bool.def(false),
});

const { hideWebShare } = useProps(props);

const { shareBtnEnabled } = storeDefinitionToRefs(useShareStore);
</script>

<style lang="scss">
.c-page-fixed-widgets {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 200;

  &--absolute {
    position: absolute;
  }
}

.c-fixed-widget-button {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-top: 8px;
  font-size: 14px;
  color: $--font-color-primary;
  cursor: pointer;
  background: $--color-white;
  border: 1px solid $--border-color-primary;
  border-radius: 4px;
  transition: all 0.15s ease-in;

  &:hover {
    background: #ededef;
  }
}

.c-fixed-widget-button__icon {
  display: flex;
  color: #adadc0;
}
</style>
