/**
 * @file 实时字幕 store
 */
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export interface SubtitleStoreState {
  /** 是否支持实时字幕 */
  subtitlesEnable: Ref<boolean>;
  /** 讲师是否打开实时字幕 */
  subtitlesTeacherEnable: Ref<boolean>;
  /** 本地实时字幕是否开启 */
  localUerSubtitlesEnable: Ref<boolean>;
}

export interface SubtitleStoreAction {
  /** 改变实时字幕状态 */
  changeSubtitlesEnable: (enable: boolean) => void;
  /** 改变讲师实时字幕状态 */
  changeSubtitlesTeacherEnable: (enable: boolean) => void;
  /** 改变本地实时字幕开启状态 */
  changeLocalUerSubtitlesEnable: (enable: boolean) => void;
}

export interface SubtitleStore extends SubtitleStoreState, SubtitleStoreAction {}

export const useSubtitleStore = defineStore<'subtitle', SubtitleStore>('subtitle', () => {
  /** 是否支持实时字幕 */
  const subtitlesEnable = ref(false);

  /** 讲师是否打开实时字幕 */
  const subtitlesTeacherEnable = ref(true);

  /** 本地实时字幕是否开启 */
  const localUerSubtitlesEnable = ref(true);

  /**
   * 改变实时字幕状态
   */
  function changeSubtitlesEnable(enable: boolean): void {
    subtitlesEnable.value = enable;
  }

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

  return {
    subtitlesEnable,
    subtitlesTeacherEnable,
    localUerSubtitlesEnable,

    changeSubtitlesTeacherEnable,
    changeSubtitlesEnable,
    changeLocalUerSubtitlesEnable,
  };
});
