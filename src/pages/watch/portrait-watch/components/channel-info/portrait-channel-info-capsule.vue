<!-- @file 竖屏频道信息胶囊 -->
<template>
  <div class="c-portrait-channel-info-capsule">
    <!-- 频道图标 -->
    <div
      class="c-portrait-channel-info-capsule__cover g-img-cover"
      :style="{
        backgroundImage: `url(${resizeOSSImg(channelCoverImg, 80, 80)})`,
      }"
    ></div>

    <!-- 频道信息 -->
    <div class="c-portrait-channel-info-capsule__info">
      <!-- 主持人 -->
      <div class="c-portrait-channel-info-capsule__info__publisher g-singleline">
        {{ channelPublisher }}
      </div>
      <!-- 在线人数 or 页面浏览数 -->
      <div
        v-if="!isUndefined(channelVisibleCount)"
        class="c-portrait-channel-info-capsule__info__count"
      >
        <span class="c-portrait-channel-info-capsule__info__count__icon g-img-cover"></span>
        <span class="c-portrait-channel-info-capsule__info__count__num">
          {{ shortNumber(channelVisibleCount) }}
        </span>
      </div>
    </div>

    <!-- 关注 -->
    <portrait-follow-btn v-if="followEnabled" />
  </div>
</template>

<script setup lang="ts">
import { resizeOSSImg } from '@/assets/utils/image';
import { shortNumber } from '@/assets/utils/number';
import { isUndefined } from 'lodash-es';
import PortraitFollowBtn from '@/components/page-watch-common/follow/follow-btn/portrait-follow-btn.vue';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChatStore } from '@/store/use-chat-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useFollowSetting } from '@/components/page-watch-common/follow/hooks/use-follow-setting';
import { computed, unref } from 'vue';
import { useThemeStore } from '@/store/use-theme-store';

const { onlineUserCount, chatSetting } = storeDefinitionToRefs(useChatStore);

const { channelPublisher, pvShowEnabled, pageViewCount } =
  storeDefinitionToRefs(useChannelInfoStore);

const { channelCoverImg } = storeDefinitionToRefs(useThemeStore);

const { followEnabled } = useFollowSetting();

/** 页面显示的数量 */
const channelVisibleCount = computed<number | undefined>(() => {
  if (unref(chatSetting).chatOnlineNumberEnable) {
    return unref(onlineUserCount);
  }

  if (unref(pvShowEnabled)) {
    return unref(pageViewCount);
  }

  return undefined;
});
</script>

<style lang="scss">
.c-portrait-channel-info-capsule {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  height: 36px;
  padding: 0 4px;
  color: $--color-white;
  white-space: nowrap;
  background-color: rgba(#000, 0.4);
  border-radius: 18px;
}

.c-portrait-channel-info-capsule__cover {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.c-portrait-channel-info-capsule__info {
  margin: 0 8px;
}

.c-portrait-channel-info-capsule__info__publisher {
  max-width: 70px;
  font-size: 14px;
  line-height: 16px;
}

.c-portrait-channel-info-capsule__info__count {
  display: flex;
  align-items: center;
  margin-top: 2px;
}
.c-portrait-channel-info-capsule__info__count__icon {
  width: 12px;
  height: 12px;
  margin-right: 2px;
  background-image: url(./images/icon-eye.png);
}
.c-portrait-channel-info-capsule__info__count__num {
  font-size: 10px;
  line-height: 12px;
  transform: translateY(1px);
}
</style>
