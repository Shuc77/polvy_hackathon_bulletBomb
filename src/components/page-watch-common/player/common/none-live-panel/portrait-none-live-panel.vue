<!-- @file 竖屏暂无直播占位 -->
<template>
  <div
    class="c-portrait-none-live-panel c-portrait-placeholder-panel"
    :class="{
      'c-portrait-placeholder-panel--small-window': isSmallWindow,
    }"
  >
    <div class="c-portrait-placeholder-panel__content">
      <div class="c-portrait-none-live-panel__image g-img-cover"></div>
      <p class="c-portrait-none-live-panel__text">
        {{
          [LiveStatus.Waiting, LiveStatus.Stop].includes(liveStatus)
            ? $lang('liveStatus.waitingText')
            : $lang('liveStatus.end')
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { LiveStatus } from '@polyv/live-watch-sdk';

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const { liveStatus } = storeDefinitionToRefs(useChannelStore);
</script>

<style lang="scss">
.c-portrait-none-live-panel .c-portrait-placeholder-panel__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.c-portrait-none-live-panel__image {
  width: 154px;
  height: 120px;
  margin-bottom: 12px;
  background-image: url(./imgs/portrait-end-placeholder.png);
}
.c-portrait-none-live-panel__text {
  font-size: 14px;
  color: $--color-white;
}

.c-portrait-placeholder-panel--small-window {
  .c-portrait-none-live-panel__image {
    width: 60px;
    height: 46px;
  }
  .c-portrait-none-live-panel__text {
    font-size: 12px;
  }
}
</style>
