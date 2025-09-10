<template>
  <div class="c-channel-splash-img">
    <plv-channel-cover
      class="c-channel-splash-img__blur-content"
      :channel-id="channelId"
      :splash-img="renderSplashImg"
      :title="showTitle ? channelTitle : ''"
      :text-cover-bg-id="splashImgBackgroundId"
      :image-props="{
        gradual: false,
        'blur-background-enabled': blurBackgroundEnabled,
      }"
    />
    <div
      class="c-channel-splash-img__base-info g-singleline"
      v-if="props.baseInfoVisible"
    >
      <div class="c-channel-splash-img__base-info__title g-singleline">
        {{ channelTitle }}
      </div>
      <div class="c-channel-splash-img__base-info__id">
        {{ $lang('base.channelId') }} : {{ channelId }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useThemeStore } from '@/store/use-theme-store';
import { PlvChannelCover } from '@/plugins/polyv-ui/admin-import';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { computed } from 'vue';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { PropUtils } from '@polyv/vue-components';

const props = defineProps({
  /** 封面地址，不传则使用引导页封面图 */
  coverImg: PropUtils.string.def(''),
  showTitle: PropUtils.bool.def(true),
  /** 是否展示基础信息 */
  baseInfoVisible: PropUtils.bool.def(false),
  /** 是否背景虚拟化 */
  blurBackgroundEnabled: PropUtils.bool.def(false),
});

const { resizeOSSImg } = useResizeOssImage();

const { splashImg, splashImgBackgroundId } = storeDefinitionToRefs(useThemeStore);

const { channelTitle } = storeDefinitionToRefs(useChannelInfoStore);

const { channelId } = storeDefinitionToRefs(useChannelStore);

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const renderSplashImg = computed(() => {
  const defaultSource = watchCore.utils.getDefaultResource();

  const coverUrl = props.coverImg || splashImg.value;

  if (splashImgBackgroundId.value && coverUrl === defaultSource.defaultSplashImg) {
    return '';
  }

  return resizeOSSImg(coverUrl, 1280, 720);
});
</script>

<style lang="scss">
.c-channel-splash-img {
  position: relative;
  width: 100%;
  height: 100%;

  .c-channel-splash-img__base-info {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 70px;
    padding: 14px 12px;
    color: #ffffff;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
  }

  .c-channel-splash-img__base-info__title {
    font-size: 14px;
  }
  .c-channel-splash-img__base-info__id {
    font-size: 12px;
  }
}

.c-channel-splash-img__blur-background {
  filter: blur(10px);
}

.c-channel-splash-img__blur-content {
  position: absolute;
  top: 0;
  left: 0;
  object-fit: contain;
}
</style>
