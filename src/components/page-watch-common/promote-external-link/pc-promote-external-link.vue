<!-- @file PC端-菜单-推广链接 -->

<template>
  <pc-iframe-render
    v-if="isOpenInMenu"
    :src="props.src"
  />
  <div
    v-else
    class="c-pc-promote-external-link__tips-wrapper"
  >
    <p class="c-pc-promote-external-link__tips">{{ tips }}</p>
  </div>
</template>

<script lang="ts" setup>
import PcIframeRender from '@/components/common-base/iframe-render/pc-iframe-render.vue';
import { promoteExternalLinkProps, usePromoteExternalLinkHook } from './use-promote-external-link';

const props = defineProps(promoteExternalLinkProps());

const { isOpenInMenu, tips } = usePromoteExternalLinkHook({ props });
</script>

<style lang="scss">
.c-pc-promote-external-link__tips-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 200px;
  color: #adadc0;
}

.c-pc-promote-external-link__tips {
  padding: 0 40px;
  line-height: 20px;
  color: #adadc0;
  text-align: center;
}
</style>
