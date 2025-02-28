<template>
  <div class="c-channel-splash-img">
    <plv-channel-cover
      :channel-id="channelId"
      :splash-img="renderSplashImg"
      :title="channelTitle"
      :text-cover-bg-id="splashImgBackgroundId"
      :image-props="{
        gradual: false,
      }"
    />
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
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

const props = defineProps({
  /** 封面地址，不传则使用引导页封面图 */
  coverImg: PropUtils.string.def(''),
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
  width: 100%;
  height: 100%;
}
</style>
