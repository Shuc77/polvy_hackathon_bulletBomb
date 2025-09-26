<!-- @file 竖屏字幕设置弹窗 -->
<template>
  <mobile-popup
    :visible.sync="isVisible"
    :title="$lang('portrait.subtitle.setting.title')"
    position="bottom"
    @close="handleClose"
    content-background="#f6f7f9"
  >
    <div class="c-portrait-subtitle-setting">
      <!-- 实时字幕总开关 -->
      <div class="c-portrait-subtitle-setting__item">
        <div class="c-portrait-subtitle-setting__label">{{ $lang('player.subtitle.text') }}</div>
        <div class="c-portrait-subtitle-setting__control">
          <plv-switch
            v-model="localSubtitlesEnabled"
            @change="handleToggleSubtitle"
          />
        </div>
      </div>

      <!-- 字幕语言选择 -->
      <div
        v-if="localSubtitlesEnabled && subtitleTranslateEnabled"
        class="c-portrait-subtitle-setting__item c-portrait-subtitle-setting__language-selector"
        @click="handleOpenLanguageSelector"
      >
        <div class="c-portrait-subtitle-setting__label">
          {{ $lang('portrait.subtitle.setting.language') }}
        </div>
        <div class="c-portrait-subtitle-setting__language-value">
          {{ currentLanguageLabel }}
          <mobile-icon-arrow-right />
        </div>
      </div>

      <!-- 双语显示开关 -->
      <div
        v-if="localSubtitlesEnabled && subtitleTranslateEnabled"
        class="c-portrait-subtitle-setting__item"
      >
        <div class="c-portrait-subtitle-setting__label">
          {{ $lang('portrait.subtitle.setting.bilingual') }}
        </div>
        <div class="c-portrait-subtitle-setting__control">
          <plv-switch
            :disabled="subtitleTranslateSelected[0] === 'source'"
            v-model="bilingualEnabled"
            @change="handleToggleBilingual"
          />
        </div>
      </div>
    </div>

    <!-- 字幕语言选择弹窗 -->
    <mobile-popup
      :visible.sync="languageSelectorVisible"
      :title="$lang('portrait.subtitle.setting.language')"
      position="bottom"
      @close="handleCloseLanguageSelector"
    >
      <div class="c-portrait-subtitle-language-selector">
        <!-- 原文选项 -->
        <div class="c-portrait-subtitle-language-selector__list">
          <div
            class="c-portrait-subtitle-language-selector__item"
            :class="{
              'c-portrait-subtitle-language-selector__item--active':
                subtitleTranslateSelected[0] === 'source',
            }"
            @click="handleSelectOriginal"
          >
            <span>{{ $lang('portrait.subtitle.setting.original') }}</span>
            <mobile-icon-check
              v-if="subtitleTranslateSelected[0] === 'source'"
              class="c-portrait-subtitle-language-selector__check"
            />
          </div>
        </div>

        <!-- 语言选项列表 -->
        <div class="c-portrait-subtitle-language-selector__list">
          <div
            v-for="option in liveSubtitleSourceTranslateLanguageOptions"
            :key="option.value"
            class="c-portrait-subtitle-language-selector__item"
            :class="{
              'c-portrait-subtitle-language-selector__item--active':
                subtitleTranslateSelected[0] !== 'source' &&
                option.value === subtitleTranslateSelected[1],
            }"
            @click="handleLanguageChange(option.value)"
          >
            <span>{{ option.label }}</span>
            <mobile-icon-check
              v-if="
                subtitleTranslateSelected[0] !== 'source' &&
                option.value === subtitleTranslateSelected[1]
              "
              class="c-portrait-subtitle-language-selector__check"
            />
          </div>
        </div>
      </div>
    </mobile-popup>
  </mobile-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SubtitleSourceTranslateLanguage } from '@polyv/live-watch-sdk';
import { translate } from '@/assets/lang';

import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PlvSwitch } from '@/plugins/polyv-ui/mobile-import';
import { MobileIconArrowRight, MobileIconCheck } from '@/components/component-icons/mobile/map';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useSubtitleSelected } from '../use-subtitle';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['close', 'update:visible', 'enable-subtitle-float']);

const subtitleStore = useSubtitleStore();
const {
  // subtitleRealTimeEnabled,
  subtitleTranslateEnabled,
  localUerSubtitlesEnable,
  liveSubtitleSourceLanguage,
  liveSubtitleSourceTranslateLanguageOptions,
} = storeDefinitionToRefs(useSubtitleStore);

const { subtitleTranslateSelected } = useSubtitleSelected();

const isVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit('update:visible', value);
  },
});

// 本地字幕开关状态
const localSubtitlesEnabled = ref(localUerSubtitlesEnable.value);
// 双语开关状态（基于显示模式）
const { subtitleDisplayMode } = storeDefinitionToRefs(useSubtitleStore);
// 根据显示模式初始化双语开关状态
const bilingualEnabled = ref(subtitleDisplayMode.value === 'all');

// 语言选择弹窗状态
const languageSelectorVisible = ref(false);

// 当前选中语言的显示文本
const currentLanguageLabel = computed(() => {
  const [type, language] = subtitleTranslateSelected.value;

  if (type === 'source') {
    return translate('portrait.subtitle.setting.original');
  }

  const currentOption = liveSubtitleSourceTranslateLanguageOptions.value.find(
    option => option.value === language,
  );
  return currentOption?.label;
});

// 监听本地开关状态变化
watch(localUerSubtitlesEnable, newVal => {
  localSubtitlesEnabled.value = newVal;
});

function updateSubtitleDisplayMode(mode: 'source' | 'translate' | 'all') {
  subtitleStore.changeSubtitleDisplayMode(mode);
}

const handleClose = () => {
  emit('close');
};

const handleToggleSubtitle = (enabled: boolean) => {
  subtitleStore.changeLocalUerSubtitlesEnable(enabled);
  if (enabled) {
    // 当用户开启字幕时，通知管理器启用浮窗显示
    emit('enable-subtitle-float');
  }
};

const handleToggleBilingual = (enabled: boolean) => {
  const newMode = enabled ? 'all' : 'translate';
  updateSubtitleDisplayMode(newMode);
};

const handleOpenLanguageSelector = () => {
  languageSelectorVisible.value = true;
};

const handleCloseLanguageSelector = () => {
  languageSelectorVisible.value = false;
};

const handleSelectOriginal = () => {
  // 选择原文时更新 subtitleTranslateSelected
  subtitleTranslateSelected.value = ['source', liveSubtitleSourceLanguage.value];

  updateSubtitleDisplayMode('source');

  bilingualEnabled.value = false;
  // 关闭弹窗
  languageSelectorVisible.value = false;
};

const handleLanguageChange = (language: string) => {
  let changeMode = subtitleDisplayMode.value;

  if (changeMode === 'source' || changeMode === 'translate') {
    changeMode = 'translate';
  }

  subtitleTranslateSelected.value = [changeMode, language as SubtitleSourceTranslateLanguage];
  // 选择后关闭弹窗
  languageSelectorVisible.value = false;
};
</script>

<style lang="scss">
.c-portrait-subtitle-setting {
  padding: 12px 16px;
  margin: 12px 16px;
  background: #ffffff;
  border-radius: 12px;
}

.c-portrait-subtitle-setting__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(2) {
    border-top: 1px solid #f0f0f0;
  }
}

.c-portrait-subtitle-setting__label {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.c-portrait-subtitle-setting__control {
  flex-shrink: 0;
}

.c-portrait-subtitle-setting__language-selector {
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
}

.c-portrait-subtitle-setting__language-value {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 16px;
  color: #666666;

  svg {
    width: 16px;
    height: 16px;
    color: #999999;
  }
}

// 语言选择弹窗样式
.c-portrait-subtitle-language-selector {
  padding: 0;
  background: #ffffff;
}

.c-portrait-subtitle-language-selector__section {
  padding: 16px 20px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.c-portrait-subtitle-language-selector__section-title {
  font-size: 14px;
  font-weight: 500;
  color: #999999;
}

.c-portrait-subtitle-language-selector__list {
  padding: 0;
}

.c-portrait-subtitle-language-selector__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-size: 16px;
  color: #333333;
  cursor: pointer;
  border-bottom: 1px solid #f8f8f8;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }

  &.c-portrait-subtitle-language-selector__item--active {
    color: #007aff;
  }
}

.c-portrait-subtitle-language-selector__check {
  width: 20px;
  height: 20px;
  color: #007aff;
}
</style>
