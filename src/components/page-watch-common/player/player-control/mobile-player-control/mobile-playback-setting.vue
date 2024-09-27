<!-- @file 竖屏播放设置 -->
<template>
  <mobile-popup
    class="c-mobile-playback-setting"
    :title="$lang('taskActivity.playbackSetting')"
    :visible.sync="visible"
  >
    <div class="c-mobile-playback-setting__content">
      <span>{{ $lang('taskActivity.pictureInPictureTips') }}</span>
      <plv-switch
        :value="autoPictureInPicture"
        @change="setAutoPictureInPicture"
      />
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { PlvSwitch } from '@/plugins/polyv-ui/mobile-import';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { ref } from 'vue';

const { setAutoPictureInPicture } = useWebviewStore();

const { autoPictureInPicture } = storeDefinitionToRefs(useWebviewStore);

const visible = ref(false);

useEventBusListener(appEvents.global.PlaybackSettingPopup, () => {
  visible.value = true;
});
</script>

<style lang="scss">
.c-mobile-playback-setting__content {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px 170px;
  color: #333;
}
</style>
