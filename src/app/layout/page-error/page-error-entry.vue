<!-- @file 错误提示入口组件，区分通用提示、定制提示 -->
<template>
  <div class="c-page-error">
    <page-error-work-wechat-friend v-if="isWorkWechatFriendPage" />
    <page-error-identity-info-input v-else-if="isIdentityInfoInfoPage" />
    <page-error-verify-sale-invite v-else-if="isVerifySaleInvitePage" />
    <page-error-pc-default v-else-if="!isMobileErrorPage" />
    <page-error-mobile-default v-else />
  </div>
</template>

<script lang="ts" setup>
import PageErrorVerifySaleInvite from './_components/page-error-verify-sale-invite/page-error-verify-sale-invite.vue';
import PageErrorIdentityInfoInput from './_components/page-error-identity-info-input/page-error-identity-info-input.vue';
import PageErrorWorkWechatFriend from './_components/page-error-work-wechat-friend.vue';

import PageErrorPcDefault from './_components/page-error-pc-default.vue';
import PageErrorMobileDefault from './_components/page-error-mobile-default.vue';

import { isMobile, isMockPc } from '@/assets/utils/browser';
import { usePageErrorHook } from './_hooks/use-page-error';

/** 使用移动端的异常页面 */
const isMobileErrorPage = isMobile || isMockPc;

const { isWorkWechatFriendPage, isVerifySaleInvitePage, isIdentityInfoInfoPage } =
  usePageErrorHook();
</script>

<style>
.c-page-error {
  position: fixed;
  width: 100%;
  height: 100%;
  background: #fff;
}
</style>
