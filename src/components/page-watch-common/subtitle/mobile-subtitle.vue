<template>
  <div
    ref="subtitleScroll"
    class="c-mobile-subtitle"
  >
    <template v-if="liveSubtitlesEnable && subtitleList.length">
      <div
        v-if="subtitleTranslateEnabled"
        class="c-mobile-subtitle__top pws-mobile-subtitle__top-skin"
      >
        <mobile-select
          v-model="subtitleTranslateSelected"
          :options="subtitleTranslateOptions"
        />
      </div>
      <div class="c-mobile-subtitle__content pws-mobile-subtitle__content-skin c-subtitle__scroll">
        <div
          v-for="(item, index) of subtitleList"
          :key="index"
          class="c-mobile-subtitle__content-item"
        >
          <div v-if="subtitleTranslateSelected === 'all' || subtitleTranslateSelected === 'source'">
            {{ item[sourceLanguage] }}
          </div>
          <div
            v-if="subtitleTranslateSelected === 'all' && item[sourceTranslateLanguage]"
            class="c-mobile-subtitle__content-item-line"
          ></div>
          <div
            v-if="
              (subtitleTranslateSelected === 'all' || subtitleTranslateSelected === 'translate') &&
              item[sourceTranslateLanguage]
            "
            class="c-mobile-subtitle__content-item-translate"
            :class="{
              'c-mobile-subtitle__content-item-translate--force':
                subtitleTranslateSelected === 'translate',
            }"
          >
            {{ item[sourceTranslateLanguage] }}
          </div>
        </div>
        <div
          v-show="
            currentSubtitle &&
            (subtitleTranslateSelected === 'all' || subtitleTranslateSelected === 'source')
          "
          class="c-mobile-subtitle__content-item"
        >
          <div>{{ currentSubtitle }}</div>
        </div>
        <div
          v-show="hasNewMessage"
          class="c-mobile-subtitle__new pws-subtitle__new"
          @click="scrollToBottom(false)"
        >
          <span>{{ $lang('subtitle.new') }}</span>
          <mobile-icon-arrow-down />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="c-mobile-subtitle__empty pws-subtitle__empty">{{ $lang('subtitle.empty') }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MobileSelect from '@/components/common-base/select/mobile-select.vue';
import { MobileIconArrowDown } from '@/components/component-icons/mobile/map';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';

import { useSubtitle } from '@/components/page-watch-common/subtitle/use-subtitle';

const { liveSubtitlesEnable, subtitleTranslateEnabled } = storeDefinitionToRefs(useSubtitleStore);

const subtitleScroll = ref<HTMLElement>();
const {
  hasNewMessage,
  scrollToBottom,

  subtitleTranslateSelected,
  subtitleTranslateOptions,

  subtitleList,
  currentSubtitle,
  sourceLanguage,
  sourceTranslateLanguage,
} = useSubtitle(subtitleScroll);
</script>

<style lang="scss">
.c-mobile-subtitle {
  height: 100%;
  padding: 0 12px;
  overflow: auto;
}

.c-mobile-subtitle__top {
  position: sticky;
  top: 0;
  z-index: 1;

  .c-mobile-select__body {
    border: unset;
    border-radius: unset;
  }

  .c-mobile-select__body__input {
    flex: unset;
    width: 60px;
    padding: 0;
    font-size: 14px;
  }
}

.c-mobile-subtitle__new {
  position: absolute;
  bottom: 32px;
  left: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 103px;
  padding: 6px 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 285px;
  transform: translateX(-50%);
}

.c-mobile-subtitle__content-item {
  padding: 12px;
  margin-bottom: 12px;
  line-height: 22px;
  border-radius: 8px;

  .c-mobile-subtitle__content-item-line {
    margin: 8px 0;
    border-top: 1px solid #d8d8d8;
    opacity: 0.1;
  }

  .c-mobile-subtitle__content-item-translate {
    opacity: 0.6;
  }

  .c-mobile-subtitle__content-item-translate--force {
    opacity: 1 !important;
  }
}

.c-mobile-subtitle__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
