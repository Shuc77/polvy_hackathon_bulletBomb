<!-- @file PC端实时字幕列表 -->
<template>
  <div
    ref="subtitleScroll"
    class="c-pc-subtitle pws-main-tab-body-scrollbar"
  >
    <template v-if="liveSubtitlesEnable">
      <div
        v-if="subtitleTranslateEnabled"
        class="c-pc-subtitle__top pws-pc-subtitle__top-skin"
      >
        <plv-cascader-select
          class="c-subtitle-custom__cascader-select"
          v-model="subtitleTranslateSelected"
          :options="subtitleTranslateOptions"
          :placeholder="$lang('subtitle.change')"
        />
      </div>
      <div
        v-if="subtitleDisplayNumberLimitEnabled && subtitleDisplayNumber > 0"
        class="c-pc-subtitle__limit"
      >
        {{ $lang('subtitle.limit', { limit: String(subtitleDisplayNumber) }) }}
      </div>
      <div class="c-pc-subtitle__content pws-pc-subtitle__content-skin c-subtitle__scroll">
        <div
          v-for="(item, index) of subtitleList"
          :key="index"
          class="c-pc-subtitle__content-item pws-pc-subtitle__content-item"
        >
          <div
            v-if="
              subtitleTranslateSelected.includes('all') ||
              subtitleTranslateSelected.includes('source')
            "
          >
            {{ item[liveSubtitleSourceLanguage] }}
          </div>
          <div
            v-if="
              subtitleTranslateSelected.includes('all') && item[liveSubtitleSourceTranslateLanguage]
            "
            class="c-pc-subtitle__content-item-line pws-pc-subtitle__content-item-line"
          ></div>
          <div
            v-if="
              (subtitleTranslateSelected.includes('all') ||
                subtitleTranslateSelected.includes('translate')) &&
              item[liveSubtitleSourceTranslateLanguage]
            "
            class="c-pc-subtitle__content-item-translate"
            :class="{
              'c-pc-subtitle__content-item-translate--force':
                subtitleTranslateSelected.includes('translate'),
            }"
          >
            {{ item[liveSubtitleSourceTranslateLanguage] }}
          </div>
        </div>
        <div
          v-show="
            currentSubtitle &&
            (subtitleTranslateSelected.includes('all') ||
              subtitleTranslateSelected.includes('source'))
          "
          class="c-pc-subtitle__content-item pws-pc-subtitle__content-item"
        >
          <div>{{ currentSubtitle }}</div>
        </div>
      </div>
      <div class="c-pc-subtitle__footer-tips pws-pc-subtitle__footer-tips">
        <span>{{ $lang('subtitle.footer.tips') }}</span>
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
import { PlvCascaderSelect } from '@/plugins/polyv-ui/admin-import';
import { ref } from 'vue';
import { PcIconArrowDown } from '@/components/component-icons/pc/map';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';

import { useSubtitle } from '@/components/page-watch-common/subtitle/use-subtitle';

const subtitleScroll = ref<HTMLElement>();

const {
  liveSubtitlesEnable,
  subtitleTranslateEnabled,

  liveSubtitleSourceLanguage,
  liveSubtitleSourceTranslateLanguage,
  subtitleDisplayNumberLimitEnabled,
  subtitleDisplayNumber,
} = storeDefinitionToRefs(useSubtitleStore);

const {
  hasNewMessage,
  scrollToBottom,

  subtitleTranslateSelected,
  subtitleTranslateOptions,

  subtitleList,
  currentSubtitle,
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

.c-pc-subtitle__limit {
  margin-top: 16px;
  font-size: 12px;
  color: #adadc0;
  text-align: center;
}

.c-pc-subtitle__top {
  position: sticky;
  top: 0;
  z-index: 1;
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

.c-pc-subtitle__footer-tips {
  font-size: 12px;
  text-align: center;
}

.c-pc-subtitle__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.c-subtitle-custom__cascader-select {
  .plv-cascader__body {
    background: none;
    border: none;
  }

  .plv-cascader__body__suffix {
    background: none;
  }

  .plv-cascader__body__input {
    color: inherit;
  }
  .plv-cascader__body__suffix .plv-icon {
    color: inherit;
  }
}
</style>
