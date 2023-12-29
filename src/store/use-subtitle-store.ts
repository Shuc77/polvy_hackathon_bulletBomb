/**
 * @file 实时字幕 store
 */
import { getWatchCore } from '@/core/watch-sdk';
import {
  LiveStatus,
  SubtitleSourceLanguage,
  SubtitleSourceTranslateLanguage,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useChannelStore } from './use-channel-store';

export interface SubtitleStoreState {
  /** 字幕模块安装完成 */
  subtitleModuleSetuped: Ref<boolean>;
  /** 实时字幕开关 */
  subtitleRealTimeEnabled: Ref<boolean>;
  /** 实时字幕翻译开关 */
  subtitleTranslateEnabled: Ref<boolean>;
  /** 讲师是否打开实时字幕 */
  subtitlesTeacherEnable: Ref<boolean>;
  /** 本地实时字幕是否开启 */
  localUerSubtitlesEnable: Ref<boolean>;
  /** 回放字幕主字幕（原声字幕）是否显示 */
  mainReplaySubtitleShow: Ref<boolean>;
  /** 回放字幕副字幕（翻译字幕）是否显示 */
  subReplaySubtitleShow: Ref<boolean>;
  /** 实时字幕是否可用 */
  liveSubtitlesEnable: ComputedRef<boolean>;
  /** 原声语言 */
  liveSubtitleSourceLanguage: Ref<SubtitleSourceLanguage>;
  /** 翻译语言 */
  liveSubtitleSourceTranslateLanguage: Ref<SubtitleSourceTranslateLanguage>;
  /** 实时字幕显示数量限制开关 */
  subtitleDisplayNumberLimitEnabled: Ref<boolean>;
  /** 实时字幕最多显示多少条 */
  subtitleDisplayNumber: Ref<number>;
}

export interface SubtitleStoreAction {
  /** 同步实时字幕和回放字幕配置 */
  syncSubtitleConfig: () => void;
  /** 改变讲师实时字幕状态 */
  changeSubtitlesTeacherEnable: (enable: boolean) => void;
  /** 改变本地实时字幕开启状态 */
  changeLocalUerSubtitlesEnable: (enable: boolean) => void;
  /** 改变回放主字幕是否显示 */
  changeMainReplaySubtitleShow: (show: boolean) => void;
  /** 改变回放副字幕是否显示 */
  changeSubReplaySubtitleShow: (show: boolean) => void;
}

export interface SubtitleStore extends SubtitleStoreState, SubtitleStoreAction {}

export const useSubtitleStore = defineStore<'subtitle', SubtitleStore>('subtitle', () => {
  const channelStore = useChannelStore();

  /** 字幕模块安装完成 */
  const subtitleModuleSetuped = ref(false);

  /** 实时字幕开关 */
  const subtitleRealTimeEnabled = ref(false);

  /** 实时字幕翻译开关 */
  const subtitleTranslateEnabled = ref(true);

  /** 讲师是否打开实时字幕 */
  const subtitlesTeacherEnable = ref(true);

  /** 本地实时字幕是否开启 */
  const localUerSubtitlesEnable = ref(true);

  /** 主字幕是否显示 */
  const mainReplaySubtitleShow = ref(true);

  /** 副字幕是否显示 */
  const subReplaySubtitleShow = ref(true);

  /** 直播实时字幕是否可用 */
  const liveSubtitlesEnable = computed(() => {
    return (
      subtitleRealTimeEnabled.value &&
      subtitlesTeacherEnable.value &&
      channelStore.liveStatus === LiveStatus.Live
    );
  });

  /** 原声语言 */
  const liveSubtitleSourceLanguage = ref<SubtitleSourceLanguage>('Chinese');

  /** 翻译语言 */
  const liveSubtitleSourceTranslateLanguage = ref<SubtitleSourceTranslateLanguage>('Chinese');

  /** 实时字幕显示数量限制开关 */
  const subtitleDisplayNumberLimitEnabled = ref(false);

  /** 实时字幕最多显示多少条 */
  const subtitleDisplayNumber = ref(-1);

  /**
   * 同步实时字幕配置
   * */
  function syncSubtitleConfig() {
    const watchCore = getWatchCore();
    const subTitleConfig = watchCore.subtitles.getSubtitleConfig();

    subtitleRealTimeEnabled.value = subTitleConfig.subtitleRealTimeEnabled;
    subtitleTranslateEnabled.value = subTitleConfig.subtitleTranslateEnabled;

    liveSubtitleSourceLanguage.value = subTitleConfig.subtitleSourceLanguage;
    liveSubtitleSourceTranslateLanguage.value = subTitleConfig.subtitleTranslateLanguage;
    subtitleDisplayNumberLimitEnabled.value = subTitleConfig.subtitleDisplayNumberLimitEnabled;
    subtitleDisplayNumber.value = subTitleConfig.subtitleDisplayNumber;
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

  /**
   * 改变回放主字幕（原声字幕）是否显示
   */
  function changeMainReplaySubtitleShow(show: boolean): void {
    mainReplaySubtitleShow.value = show;
  }

  /**
   * 改变回放副字幕(翻译字幕)是否显示
   */
  function changeSubReplaySubtitleShow(show: boolean): void {
    subReplaySubtitleShow.value = show;
  }

  return {
    subtitleModuleSetuped,

    subtitleRealTimeEnabled,
    subtitleTranslateEnabled,
    subtitlesTeacherEnable,
    localUerSubtitlesEnable,
    mainReplaySubtitleShow,
    subReplaySubtitleShow,

    liveSubtitlesEnable,

    liveSubtitleSourceLanguage,
    liveSubtitleSourceTranslateLanguage,
    subtitleDisplayNumberLimitEnabled,
    subtitleDisplayNumber,

    syncSubtitleConfig,

    changeSubtitlesTeacherEnable,
    changeLocalUerSubtitlesEnable,
    changeMainReplaySubtitleShow,
    changeSubReplaySubtitleShow,
  };
});
