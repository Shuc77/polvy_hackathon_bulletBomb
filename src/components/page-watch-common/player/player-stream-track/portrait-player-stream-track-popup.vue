<template>
  <mobile-popup
    class="c-portrait-player-stream-track-popup"
    :visible.sync="trackVisible"
    :theme="PopupTheme.Portrait"
    :use-transition.sync="useTransition"
    :title="$lang('player.streamTrack')"
    backable
    @click-back="onClickBack"
  >
    <ul
      class="c-portrait-player-control__select-list c-portrait-player-control__select-list--large"
    >
      <li
        class="c-portrait-player-control__select-item"
        :class="{
          'c-portrait-player-control__select-item--active': currentLang === LangType.Chinese,
        }"
        @click="onClickItem(LangType.Chinese)"
      >
        <span>中文音频</span>
      </li>

      <li
        class="c-portrait-player-control__select-item"
        :class="{
          'c-portrait-player-control__select-item--active': currentLang !== LangType.Chinese,
        }"
        @click="onClickItem(LangType.English)"
      >
        <span v-if="!japLangEnabled">英文音频</span>
        <span v-else>日语音频</span>
      </li>
    </ul>
  </mobile-popup>
</template>

<script setup lang="ts">
import { PopupTheme } from '@/components/common-base/popup/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { appEvents } from '@/app/app-events';
import { usePortraitSettingPopup } from '../player-control/portrait-player-control/use-portrait-setting-popup';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';
import { useStreamTrack } from './use-stream-track';

const {
  visible: trackVisible,
  useTransition,
  onClickBack,
  closePopup,
} = usePortraitSettingPopup(appEvents.portrait.OpenLangStreamPopup);

const { currentLang, japLangEnabled } = storeDefinitionToRefs(useLangStore);

const { switchLanguage } = useStreamTrack();

function onClickItem(lang: LangType) {
  switchLanguage(lang);
  closePopup();
}
</script>
