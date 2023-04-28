<!-- @file 移动端页脚 -->
<template>
  <div
    v-if="footerVisible"
    class="c-mobile-page-footer pws-mobile-page-footer"
  >
    <a
      :href="footerLink"
      target="_blank"
      rel="noopener"
    >
      - {{ footerText }} -
    </a>
  </div>
</template>

<script setup lang="ts">
import { usePageFooter } from './use-page-footer';

const { footerVisible, footerLink, footerText } = usePageFooter();
</script>

<style lang="scss">
.c-mobile-page-footer {
  margin-top: 24px;
  font-size: 12px;
  line-height: 1;
  text-align: center;
  @include iphone-x-pb(24px);
  a {
    color: inherit;
    text-decoration: none;
  }
}
</style>
