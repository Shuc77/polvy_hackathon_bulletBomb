<!-- @file PC 端页脚 -->
<template>
  <div
    v-if="footerVisible"
    class="c-pc-page-footer"
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
.c-pc-page-footer {
  padding: 24px 0;
  font-size: 14px;
  line-height: 1;
  text-align: center;
  a {
    color: $--color-white;
    text-decoration: none;
    text-shadow: 0 0 2px rgb(0 0 0 / 50%);
  }
}
</style>
