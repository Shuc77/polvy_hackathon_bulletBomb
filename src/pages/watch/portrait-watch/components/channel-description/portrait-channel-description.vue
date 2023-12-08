<!-- @file 竖屏频道介绍 -->
<template>
  <div class="c-portrait-channel-description">
    <div class="c-portrait-channel-description__title">{{ $lang('menu.tabName.desc') }}</div>
    <div
      v-if="channelDescriptionIsEmpty"
      class="c-portrait-channel-description__empty"
    >
      {{ $lang('channel.descEmpty') }}
    </div>
    <mobile-rich-text-render
      v-else
      class="c-portrait-channel-description__content"
      :html-content="channelDescription"
      :follow-page-skin="false"
    />
  </div>
</template>

<script setup lang="ts">
import MobileRichTextRender from '@/components/common-base/rich-text-render/mobile-rich-text-render.vue';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { channelDescription, channelDescriptionIsEmpty } =
  storeDefinitionToRefs(useChannelInfoStore);
</script>

<style lang="scss">
.c-portrait-channel-description {
  padding: 15px;
  background: rgba(243, 243, 243, 0.9);
  border-radius: 10px;
}
.c-portrait-channel-description__title {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 16px;
  line-height: 16px;
  color: $--font-color-primary;

  &::before {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    content: '';
    background-image: url(./images/icon-desc.png);
    background-repeat: no-repeat;
    background-size: 100%;
  }
}
.c-portrait-channel-description__empty {
  height: 160px;
  font-size: 14px;
  line-height: 160px;
  color: $--font-color-primary;
  text-align: center;
}
.c-portrait-channel-description__content .c-mobile-rich-text-render__content {
  padding: 0;
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: initial;

  th,
  td {
    padding: initial;
  }
}
</style>
