<template>
  <div
    ref="subtitleScroll"
    class="c-pc-subtitle pws-main-tab-body-scrollbar"
  >
    <template v-if="subtitlesEnable && subtitleList.length">
      <div
        v-if="subtitleTranslateEnabled"
        class="c-pc-subtitle__top pws-pc-subtitle__top-skin"
      >
        <pc-select
          v-model="subtitleTranslateSelected"
          :options="subtitleTranslateOptions"
        />
      </div>
      <div class="c-pc-subtitle__content pws-pc-subtitle__content-skin c-subtitle__scroll">
        <div
          v-for="(item, index) of subtitleList"
          :key="index"
          class="c-pc-subtitle__content-item"
        >
          <div v-if="subtitleTranslateSelected === 'all' || subtitleTranslateSelected === 'source'">
            {{ item[sourceLanguage] }}
          </div>
          <div
            v-if="subtitleTranslateSelected === 'all' && item[sourceTranslateLanguage]"
            class="c-pc-subtitle__content-item-line"
          ></div>
          <div
            v-if="
              (subtitleTranslateSelected === 'all' || subtitleTranslateSelected === 'translate') &&
              item[sourceTranslateLanguage]
            "
            class="c-pc-subtitle__content-item-translate"
            :class="{
              'c-pc-subtitle__content-item-translate--force':
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
          class="c-pc-subtitle__content-item"
        >
          <div>{{ currentSubtitle }}</div>
        </div>
      </div>
      <div
        v-show="hasNewMessage"
        class="c-pc-subtitle__new pws-subtitle__new"
        @click="scrollToBottom(false)"
      >
        <span>{{ $lang('subtitle.new') }}</span>
        <pc-icon-arrow-down />
      </div>
    </template>
    <template v-else>
      <div class="c-pc-subtitle__empty pws-subtitle__empty">{{ $lang('subtitle.empty') }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PcSelect from '@/components/common-base/select/pc-select.vue';
import { PcIconArrowDown } from '@/components/component-icons/pc/map';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';

import { useSubtitle } from '@/components/page-watch-common/subtitle/use-subtitle';

const subtitleScroll = ref<HTMLElement>();

const { subtitlesEnable, subtitleTranslateEnabled } = storeDefinitionToRefs(useSubtitleStore);

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
.c-pc-subtitle {
  box-sizing: border-box;
  height: 100%;
  padding: 0 16px 16px 16px;
  overflow: auto;
  @include scrollbar;
}

.c-pc-subtitle__top {
  position: sticky;
  top: 0;
  z-index: 1;

  .c-pc-select__body {
    border: unset;
    border-radius: unset;
  }

  .c-pc-select__body__input {
    flex: unset;
    width: 60px;
    padding: 0;
  }
}

.c-pc-subtitle__new {
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

.c-pc-subtitle__content {
  margin-top: 8px;
}

.c-pc-subtitle__content-item {
  padding: 12px;
  margin-bottom: 12px;
  line-height: 22px;
  border-radius: 8px;

  .c-pc-subtitle__content-item-line {
    margin: 8px 0;
    border-top: 1px solid #d8d8d8;
    opacity: 0.1;
  }

  .c-pc-subtitle__content-item-translate {
    opacity: 0.6;
  }

  .c-pc-subtitle__content-item-translate--force {
    opacity: 1 !important;
  }
}
.c-pc-subtitle__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
