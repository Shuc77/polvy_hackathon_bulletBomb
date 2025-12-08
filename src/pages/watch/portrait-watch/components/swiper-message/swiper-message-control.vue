<template>
  <div class="c-portrait-swiper-message-control">
    <swiper-section-control />
  </div>
</template>

<script setup lang="ts">
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';

const PolyvChatUI = getChatUIV2Pkg();

const { SwiperSectionControl } = PolyvChatUI;
</script>

<style lang="scss">
.c-portrait-swiper-message-control {
  flex: 1;
  max-width: 150px;
  overflow: hidden;
}
</style>
