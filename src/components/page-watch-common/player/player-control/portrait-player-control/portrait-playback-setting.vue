<!-- @file 竖屏播放设置 -->
<template>
  <mobile-popup
    class="c-portrait-playback-setting"
    :title="$lang('taskActivity.playbackSetting')"
    :visible.sync="playbackSettingVisible"
    :theme="PopupTheme.Portrait"
    :use-transition.sync="useTransition"
    backable
    @click-back="onClickBack"
  >
    <div class="c-portrait-playback-setting__content">
      <span>{{ $lang('taskActivity.pictureInPictureTips') }}</span>
      <plv-switch
        :value="autoPictureInPicture"
        @change="setAutoPictureInPicture"
      />
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { PopupTheme } from '@/components/common-base/popup/types';
import { PlvSwitch } from '@/plugins/polyv-ui/mobile-import';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { usePortraitSettingPopup } from './use-portrait-setting-popup';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const {
  visible: playbackSettingVisible,
  useTransition,
  onClickBack,
} = usePortraitSettingPopup(appEvents.global.PlaybackSettingPopup);

const { setAutoPictureInPicture } = useWebviewStore();

const { autoPictureInPicture } = storeDefinitionToRefs(useWebviewStore);
</script>

<style lang="scss">
.c-portrait-playback-setting__content {
  display: flex;
  justify-content: space-between;
  padding: 35px 24px;
  color: #fff;
}
</style>
