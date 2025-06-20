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
        {{ getLiveStatusText(liveStatus) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { translate } from '@/assets/lang';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { LiveStatus } from '@polyv/live-watch-sdk';

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const { liveStatus } = storeDefinitionToRefs(useChannelStore);

/**
 * 获取直播状态文本
 * @param status 直播状态
 */
function getLiveStatusText(status: LiveStatus): string {
  const tagTexts: Record<LiveStatus, string> = {
    [LiveStatus.Waiting]: translate('liveStatus.waitingText'),
    [LiveStatus.Stop]: translate('liveStatus.waitingText'),

    [LiveStatus.End]: translate('channel.noLive'),
    [LiveStatus.UnStart]: translate('channel.noLive'),

    // 该组件实际不会用到这两个状态
    [LiveStatus.Live]: '',
    [LiveStatus.Playback]: '',
  };

  return tagTexts[status];
}
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
