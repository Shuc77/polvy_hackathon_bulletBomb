<!-- @file 错误提示入口组件，区分通用提示、定制提示 -->
<template>
  <div class="c-page-error">
    <page-error-work-wechat v-if="isWorkWechatError" />
    <page-error-pc-default v-else-if="!isMobileErrorPage" />
    <page-error-mobile-default v-else />
  </div>
</template>

<script lang="ts" setup>
import PageErrorWorkWechat from './_components/page-error-work-wechat.vue';
import PageErrorPcDefault from './_components/page-error-pc-default.vue';
import PageErrorMobileDefault from './_components/page-error-mobile-default.vue';

import { isMobile, isMockPc } from '@/assets/utils/browser';
import { usePageErrorHook } from './_hooks/use-page-error';

/** 使用移动端的异常页面 */
const isMobileErrorPage = isMobile || isMockPc;

const { isWorkWechatError } = usePageErrorHook();
</script>
