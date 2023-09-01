/**
 * @file 实时字幕 store
 */
import { getWatchCore } from '@/core/watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';

export interface SubtitleStoreState {
  /** 实时字幕开关 */
  subtitleRealTimeEnabled: Ref<boolean>;
  /** 实时字幕翻译开关 */
  subtitleTranslateEnabled: Ref<boolean>;
  /** 讲师是否打开实时字幕 */
  subtitlesTeacherEnable: Ref<boolean>;
  /** 本地实时字幕是否开启 */
  localUerSubtitlesEnable: Ref<boolean>;
  /** 实时字幕是否可用 */
  subtitlesEnable: ComputedRef<boolean>;
}

export interface SubtitleStoreAction {
  /** 改变讲师实时字幕状态 */
  changeSubtitlesTeacherEnable: (enable: boolean) => void;
  /** 改变本地实时字幕开启状态 */
  changeLocalUerSubtitlesEnable: (enable: boolean) => void;
  /** 同步实时字幕配置 */
  syncSubtitleConfig: () => void;
}

export interface SubtitleStore extends SubtitleStoreState, SubtitleStoreAction {}

export const useSubtitleStore = defineStore<'subtitle', SubtitleStore>('subtitle', () => {
  /** 实时字幕开关 */
  const subtitleRealTimeEnabled = ref(false);

  /** 实时字幕翻译开关 */
  const subtitleTranslateEnabled = ref(true);

  /** 讲师是否打开实时字幕 */
  const subtitlesTeacherEnable = ref(true);

  /** 本地实时字幕是否开启 */
  const localUerSubtitlesEnable = ref(true);

  /** 实时字幕是否可用 */
  const subtitlesEnable = computed(() => {
    return subtitleRealTimeEnabled.value && subtitlesTeacherEnable.value;
  });

  /**
   * 改变讲师实时字幕状态
   */
  function changeSubtitlesTeacherEnable(enable: boolean): void {
    subtitlesTeacherEnable.value = enable;
  }

  /**
   * 改变本地实时字幕开启状态
   */
  function changeLocalUerSubtitlesEnable(enable: boolean): void {
    localUerSubtitlesEnable.value = enable;
  }

  /**
   * 同步实时字幕配置
   * */
  function syncSubtitleConfig() {
    const watchCore = getWatchCore();
    const subTitleConfig = watchCore.subtitles.getSubtitleConfig();

    subtitleRealTimeEnabled.value = subTitleConfig.subtitleRealTimeEnabled;
    subtitleTranslateEnabled.value = subTitleConfig.subtitleTranslateEnabled;
  }

  return {
    subtitleRealTimeEnabled,
    subtitleTranslateEnabled,
    subtitlesTeacherEnable,
    localUerSubtitlesEnable,

    subtitlesEnable,

    changeSubtitlesTeacherEnable,
    changeLocalUerSubtitlesEnable,

    syncSubtitleConfig,
  };
});
