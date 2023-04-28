/**
 * @file 回放 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import {
  LiveStatus,
  PlaybackMode,
  PlaybackOrigin,
  PlaybackTarget,
  YN,
} from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from './use-channel-store';
import { ynToBool } from '@utils-ts/boolean';
import { useWatchAppStore } from './use-watch-app-store';
import { paramGetter } from '@/hooks/core/use-query-params';

export interface PlaybackStoreState {
  /** 当前是否正在播放回放 */
  isPlaybacking: Ref<boolean>;
  /** 回放方式 */
  playbackMode: ComputedRef<PlaybackMode | undefined>;
  /** 当前已加载的回放页数，默认：0 */
  pageNumber: Ref<number>;
  /** 每页数量 */
  pageSize: Ref<number>;
  /** 总页数 */
  totalPages: Ref<number>;
  /** 是否正在加载中 */
  isLoading: Ref<boolean>;
  /** 是否已加载完毕 */
  isNoMore: Ref<boolean>;
  /** 已加载的列表 */
  playbackList: Ref<PlaybackTarget[]>;
  /** 当前页的回放列表 */
  currentPagePlaybackList: ComputedRef<PlaybackTarget[]>;
  /** 当前播放的回放对象 */
  currentPlaybackTarget: Ref<PlaybackTarget | undefined>;
  /** 章节是否显示 */
  chapterEnabled: ComputedRef<boolean>;
  /** 回放列表是否显示 */
  playbackListVisible: ComputedRef<boolean>;
}

export interface PlaybackStoreActions {
  /** 初始化当前回放对象 */
  initCurrentPlaybackTarget(): Promise<void>;
  /** 初始化回放列表 */
  initPlaybackList(): Promise<void>;
  /** 加载下一批回放 */
  loadNextPlaybackList(): Promise<void>;
  /** 监听分页器切换事件 */
  onPageChange(nextPageNumber: number): Promise<void>;
}

export interface PlaybackStore extends PlaybackStoreState, PlaybackStoreActions {}

export const usePlaybackStore = defineStore<'playback', PlaybackStore>('playback', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();

  const isPlaybacking = ref(false);

  /** 回放方式 */
  const playbackMode = computed<PlaybackMode | undefined>(() => {
    if (watchAppStore.isWatchBackUrl) return PlaybackMode.Single;

    const channelDetail = channelStore.channelDetail;
    return channelDetail?.playbackInfo?.type;
  });

  /** 当前已加载的回放页数，默认：0 */
  const pageNumber = ref(0);

  /** 每页数量 */
  const pageSize = ref(12);

  /** 总页数 */
  const totalPages = ref(1);

  /** 是否正在加载中 */
  const isLoading = ref(false);

  /** 是否已加载完毕 */
  const isNoMore = ref(false);

  /** 已加载的列表 */
  const playbackList = ref<PlaybackTarget[]>([]);

  /** 当前页的回放列表 */
  const currentPagePlaybackList = computed<PlaybackTarget[]>(() => {
    if (pageNumber.value === 0) {
      return [];
    }
    const pageNumberVal = unref(pageNumber);
    const pageSizeVal = unref(pageSize);
    const start = (pageNumberVal - 1) * pageSizeVal;
    const end = start + pageSizeVal;
    return playbackList.value.slice(start, end);
  });

  /** 当前播放的回放对象 */
  const currentPlaybackTarget = ref<PlaybackTarget>();

  /** 章节是否显示 */
  const chapterEnabled = computed<boolean>(() => {
    const channelDetail = channelStore.channelDetail;
    const sectionEnabled = channelDetail?.playbackInfo?.sectionEnabled;
    return isPlaybacking.value && ynToBool(sectionEnabled, YN.N);
  });

  /** 回放列表是否显示 */
  const playbackListVisible = computed<boolean>(() => {
    if (watchAppStore.isWatchBackUrl) return false;

    return unref(isPlaybacking) && playbackMode.value === PlaybackMode.List;
  });

  /**
   * 初始化当前回放对象
   * @warn 副作用：如果为列表回放，会初始化一次回放列表数据
   * */
  async function initCurrentPlaybackTarget() {
    if (channelStore.liveStatus !== LiveStatus.Playback) {
      currentPlaybackTarget.value = undefined;
      return;
    }

    // 列表回放时，则先获取一次回放列表并设置回放对象
    if (playbackMode.value === PlaybackMode.List) {
      await initPlaybackList();
      if (playbackList.value.length) {
        currentPlaybackTarget.value = playbackList.value[0];
      }
      return;
    }

    // 单个回放时使用 detail 中的回放数据
    if (playbackMode.value === PlaybackMode.Single) {
      const watchCore = getWatchCore();
      const playbackTarget = watchCore.playback.getTargetPlaybackOption({
        playbackOrigin: watchAppStore.isWatchBackUrl
          ? paramGetter.playbackType() || PlaybackOrigin.Playback // 回放地址的回放来源只有“回放列表”和“点播列表”
          : undefined,
      });
      currentPlaybackTarget.value = playbackTarget;
    }
  }

  /** 初始化回放列表 */
  async function initPlaybackList() {
    pageNumber.value = 0;
    isLoading.value = false;
    isNoMore.value = false;
    playbackList.value = [];
    await loadNextPlaybackList();
  }

  /** 加载下一批回放 */
  async function loadNextPlaybackList() {
    if (isNoMore.value || isLoading.value) {
      return;
    }

    isLoading.value = true;
    try {
      const watchCore = getWatchCore();
      const data = await watchCore.playback.getPlaybackList({
        pageNumber: unref(pageNumber) + 1,
        pageSize: unref(pageSize),
      });

      pageNumber.value = data.pageNumber;
      isNoMore.value = data.pageNumber >= data.totalPages;
      totalPages.value = data.totalPages;
      playbackList.value.push(...data.contents);
      isLoading.value = false;
    } catch (e) {
      isLoading.value = false;
    }
  }

  /** 监听分页器切换事件 */
  async function onPageChange(nextPageNumber: number) {
    if (nextPageNumber === pageNumber.value) return;

    if (nextPageNumber < pageNumber.value) {
      pageNumber.value = pageNumber.value - 1;
      return;
    }

    if (isNoMore.value) {
      pageNumber.value = pageNumber.value + 1;
    } else {
      await loadNextPlaybackList();
    }
  }

  return {
    isPlaybacking,
    playbackMode,
    pageNumber,
    pageSize,
    totalPages,
    isLoading,
    isNoMore,
    playbackList,
    playbackListVisible,
    currentPagePlaybackList,
    currentPlaybackTarget,
    chapterEnabled,

    initCurrentPlaybackTarget,
    initPlaybackList,
    loadNextPlaybackList,
    onPageChange,
  };
});
