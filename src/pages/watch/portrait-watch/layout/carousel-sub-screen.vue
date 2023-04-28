<!-- @file 轮播屏：副屏 -->
<template>
  <div class="c-portrait-carousel-sub-screen">
    <boundary-wrap>
      <div class="c-portrait-carousel-sub-screen__top-left">
        <div
          v-if="channelInfoSeat === 0"
          class="c-portrait-carousel-sub-screen__top-left__item"
        >
          <!-- 频道信息 -->
          <portrait-channel-info-capsule />
        </div>
      </div>
    </boundary-wrap>
    <div class="c-portrait-carousel-sub-screen__main">
      <!-- 直播介绍 -->
      <portrait-channel-description />
    </div>
  </div>
</template>

<script setup lang="ts">
import BoundaryWrap from './boundary-wrap.vue';
import PortraitChannelInfoCapsule from '@/pages/watch/portrait-watch/components/channel-info/portrait-channel-info-capsule.vue';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PortraitChannelDescription from '@/pages/watch/portrait-watch/components/channel-description/portrait-channel-description.vue';

const { channelInfoSeat } = storeDefinitionToRefs(usePortraitLayoutStore);
</script>

<style lang="scss">
.c-portrait-carousel-sub-screen__main {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  max-height: 446px;
  padding: 0 15px 15px;
  overflow-y: auto;
  @include iphone-x-pb(15px);
}

.c-portrait-carousel-sub-screen__top-left {
  position: absolute;
  top: 15px;
  left: 15px;
}
</style>
