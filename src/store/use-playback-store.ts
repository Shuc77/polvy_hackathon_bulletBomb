/**
 * @file 回放 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { LiveStatus, PlaybackMode, PlaybackTarget } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';
import { useWatchAppStore } from './use-watch-app-store';
import { useChannelStore } from './use-channel-store';
import { appendQueryParam, paramGetter } from '@/hooks/core/use-query-params';
import { updateWeixinShareConfig } from '@/hooks/platform/use-weixin/use-weixin-config';

export interface PlaybackStoreState {
  /** 当前是否正在播放回放 */
  isPlaybacking: Ref<boolean>;
  /** 回放方式 */
  playbackMode: Ref<PlaybackMode | undefined>;
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
  chapterVisible: ComputedRef<boolean>;
  /** 回放列表是否显示 */
  playbackListVisible: ComputedRef<boolean>;
  /** 是否能够聊天重放 */
  chatReplayEnabled: ComputedRef<boolean>;
  /** 是否能够商品库重放 */
  productReplayEnabled: ComputedRef<boolean>;
}

export interface PlaybackStoreActions {
  /** 同步 Store 数据 */
  syncPlaybackStore: () => void;
  /** 更新当前回放对象 */
  updateCurrentPlaybackTarget(target?: PlaybackTarget): void;
  /** 初始化当前回放对象 */
  initCurrentPlaybackTarget(): Promise<void>;
  /** 初始化回放列表 */
  initPlaybackList(): Promise<void>;
  /** 加载下一批回放 */
  loadNextPlaybackList(): Promise<void>;
  /** 监听分页器切换事件 */
  onPageChange(nextPageNumber: number): Promise<void>;
  /** 获取回放的场次Id */
  getPlaybackSessionId(): string;
  /** 生成用于分享回放的 Vid */
  getPlaybackShareId(): string | undefined;
}

export interface PlaybackStore extends PlaybackStoreState, PlaybackStoreActions {}

export const usePlaybackStore = defineStore<'playback', PlaybackStore>('playback', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();

  /** 当前是否正在播放回放 */
  const isPlaybacking = ref(false);

  /** 回放方式 */
  const playbackMode = ref<PlaybackMode>();

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

  /** 已加载的列表映射 */
  const playbackListMap = ref<{ [pageNumber: string]: PlaybackTarget[] }>({ 0: [] });

  /** 当前页的回放列表 */
  const currentPagePlaybackList = computed<PlaybackTarget[]>(() => {
    if (pageNumber.value === 0 || !playbackList.value.length) {
      return [];
    }
    const idx = pageNumber.value <= 0 ? 0 : pageNumber.value;
    return playbackListMap.value[idx];
  });

  /** 当前播放的回放对象 */
  const currentPlaybackTarget = ref<PlaybackTarget>();

  /** 是否可以聊天重放 */
  const chatReplayEnabled = computed(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;
    if (!currentPlaybackTarget.value) return false;
    if (channelStore.liveStatus === LiveStatus.Live) return false;

    return currentPlaybackTarget.value.chatReplayEnabled;
  });

  /** 是否可以商品库重放 */
  const productReplayEnabled = computed(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;
    if (!currentPlaybackTarget.value) return false;
    if (channelStore.liveStatus === LiveStatus.Live) return false;

    return currentPlaybackTarget.value.productReplayEnabled;
  });

  const chapterEnabled = ref(false);

  /** 章节是否显示 */
  const chapterVisible = computed<boolean>(() => {
    return isPlaybacking.value && chapterEnabled.value && channelStore.isPptChannel;
  });

  /** 回放列表是否显示 */
  const playbackListVisible = computed<boolean>(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;

    return unref(isPlaybacking) && playbackMode.value === PlaybackMode.List;
  });

  /**
   * 同步 Store 数据
   */
  function syncPlaybackStore() {
    const watchCore = getWatchCore();

    playbackMode.value = watchCore.playback.getCurrentPlaybackMode();
    chapterEnabled.value = watchCore.playback.getChapterEnabled();
  }

  /**
   * 根据回放列表获取当前回放对象
   */
  function __getCurrentPlaybackTargetByList(): PlaybackTarget | undefined {
    if (!playbackList.value.length) return undefined;

    let result = playbackList.value[0];

    const playBackVid = paramGetter.playBackVid();
    if (playBackVid) {
      const sharedPlaybackTarget = playbackList.value.find(
        playbackTarget => playbackTarget.playbackId === playBackVid,
      );
      result = sharedPlaybackTarget || result;
    }

    return result;
  }

  /**
   * 初始化当前回放对象
   * @warn 副作用：如果为列表回放，会初始化一次回放列表数据
   * */
  async function initCurrentPlaybackTarget() {
    const watchCore = getWatchCore();
    const liveStatus = watchCore.channel.getLiveStatus();

    if (liveStatus !== LiveStatus.Playback) {
      currentPlaybackTarget.value = undefined;
      return;
    }

    // 列表回放时，则先获取一次回放列表并设置回放对象
    if (playbackMode.value === PlaybackMode.List) {
      await initPlaybackList();
      const playbackTarget = __getCurrentPlaybackTargetByList();
      updateCurrentPlaybackTarget(playbackTarget);
      return;
    }

    // 单个回放时使用的回放数据
    if (playbackMode.value === PlaybackMode.Single) {
      const watchCore = getWatchCore();
      const playbackTarget = watchCore.playback.getSinglePlaybackTarget();
      updateCurrentPlaybackTarget(playbackTarget);
    }
  }

  /** 更新当前的回放对象 */
  function updateCurrentPlaybackTarget(target?: PlaybackTarget) {
    currentPlaybackTarget.value = target;

    appendQueryParam({ playBackVid: getPlaybackShareId() });
    updateWeixinShareConfig();

    const watchCore = getWatchCore();
    watchCore.playback.setCurrentPlaybackTarget(target);
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

    await loadPlaybackListByPageNumber(pageNumber.value + 1);
  }

  /** 指定页码加载回放列表 */
  async function loadPlaybackListByPageNumber(pageNo: number) {
    if (pageNo < 0 || playbackListMap.value[pageNo]) {
      return;
    }

    isLoading.value = true;
    try {
      const watchCore = getWatchCore();
      const data = await watchCore.playback.getPlaybackList({
        pageNumber: pageNo,
        pageSize: unref(pageSize),
      });

      pageNumber.value = data.pageNumber;
      isNoMore.value = data.pageNumber >= data.totalPages;
      totalPages.value = data.totalPages;

      playbackList.value.push(...data.contents);
      playbackListMap.value[data.pageNumber] = data.contents;

      isLoading.value = false;
    } catch (e) {
      isLoading.value = false;
    }
  }

  /** 监听分页器切换事件 */
  async function onPageChange(nextPageNumber: number) {
    if (
      nextPageNumber < 0 ||
      nextPageNumber === pageNumber.value ||
      nextPageNumber > totalPages.value
    )
      return;

    if (!playbackListMap.value[nextPageNumber]) {
      await loadPlaybackListByPageNumber(nextPageNumber);
    } else {
      pageNumber.value = nextPageNumber;
    }
  }

  function getPlaybackSessionId(): string {
    return currentPlaybackTarget.value?.playbackOptions.sessionId || '';
  }

  /**
   * 获取用于分享回放的 Vid
   * */
  function getPlaybackShareId() {
    if (watchAppStore.isPlaybackWatchUrl || !currentPlaybackTarget.value) return;

    return currentPlaybackTarget.value.playbackId;
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
    currentPagePlaybackList,
    currentPlaybackTarget,

    chapterVisible,
    playbackListVisible,
    chatReplayEnabled,
    productReplayEnabled,

    syncPlaybackStore,
    updateCurrentPlaybackTarget,
    initCurrentPlaybackTarget,
    initPlaybackList,
    loadNextPlaybackList,
    onPageChange,

    getPlaybackSessionId,
    getPlaybackShareId,
  };
});
