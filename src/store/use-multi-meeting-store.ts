import { getWatchCore } from '@/core/watch-sdk';
import {
  ChannelMultiMeetingItem,
  LiveStatus,
  MultiMeetingItem,
  MultiMeetingListLayout,
  MultiMeetingLiveStatusData,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ref, Ref, unref } from 'vue';

export interface MultiMeetingData extends Required<ChannelMultiMeetingItem> {
  /** 是否为当前频道 */
  isCurrent: boolean;
  /** 直播状态 */
  liveStatus: LiveStatus;
  /** 显示图标 */
  showIcon: boolean;
  /** 跳转地址 */
  watchUrl: string;
}

export interface MultiMeetingStoreState {
  /** 分会场开关 */
  multiMeetingEnabled: Ref<boolean>;
  /** 分会场最大数量 */
  multiMeetingMaxCount: Ref<number>;
  /** 分会场模板 */
  multiMeetingListLayout: Ref<MultiMeetingListLayout>;
  /** 分会场频道状态 */
  multiMeetingLiveStatus: Ref<MultiMeetingLiveStatusData[]>;
  /** 分会场列表 */
  multiMeetingList: Ref<MultiMeetingItem[]>;
  /** 会场总数 */
  multiMeetingTotal: Ref<number>;
  /** 当前频道位置，非索引 */
  currentMultiMeetingSeat: Ref<number>;
}

export interface MultiMeetingStoreAction {
  /** 根据频道号获取频道的直播状态 */
  findLiveStatus(channelId: string): LiveStatus;
  /** 刷新分会场直播状态 */
  refreshMultiMeetingLiveStatus(): Promise<void>;
  /** 同步分会场 store */
  syncMultiMeetingStore(): void;
}

export interface MultiMeetingStore extends MultiMeetingStoreState, MultiMeetingStoreAction {}

export const useMultiMeetingStore = defineStore<'multiMeeting', MultiMeetingStore>(
  'multiMeeting',
  () => {
    /** 分会场开关 */
    const multiMeetingEnabled = ref(false);

    /** 分会场最大数量 */
    const multiMeetingMaxCount = ref(0);

    /** 分会场模板 */
    const multiMeetingListLayout = ref(MultiMeetingListLayout.Horizontal);

    /** 分会场频道状态 */
    const multiMeetingLiveStatus = ref<MultiMeetingLiveStatusData[]>([]);

    /** 根据频道号获取频道的直播状态 */
    function findLiveStatus(channelId: string): LiveStatus {
      const statusList = unref(multiMeetingLiveStatus);
      const index = statusList.findIndex(item => item.channelId === channelId);
      return index === -1 ? LiveStatus.End : statusList[index].liveStatus;
    }

    /** 分会场列表 */
    const multiMeetingList = ref<MultiMeetingItem[]>([]);

    /** 会场总数 */
    const multiMeetingTotal = computed(() => unref(multiMeetingList).length);

    /** 当前频道位置 */
    const currentMultiMeetingSeat = computed(() => {
      const index = unref(multiMeetingList).findIndex(item => item.isCurrentChannel);
      return index + 1;
    });

    /** 刷新分会场直播状态 */
    async function refreshMultiMeetingLiveStatus(): Promise<void> {
      const watchCore = getWatchCore();
      const statusResult = await watchCore.multiMeeting.getMultiMeetingLiveStatus();
      const newList = unref(multiMeetingList).map<MultiMeetingItem>(item => {
        const statusItem = statusResult.find(statusItem => statusItem.channelId === item.channelId);
        const data = { ...item };
        if (statusItem) {
          data.liveStatus = statusItem.liveStatus;
        }
        return data;
      });
      multiMeetingList.value = newList;
    }

    function syncMultiMeetingStore() {
      const watchCore = getWatchCore();
      const multiSetting = watchCore.multiMeeting.getMultiMeetingSetting();

      multiMeetingEnabled.value = multiSetting.multiMeetingEnabled;
      multiMeetingMaxCount.value = multiSetting.multiMeetingMaxCount;
      multiMeetingListLayout.value = multiSetting.multiMeetingListLayout;
    }

    return {
      multiMeetingEnabled,
      multiMeetingMaxCount,
      multiMeetingListLayout,
      multiMeetingLiveStatus,
      multiMeetingList,
      multiMeetingTotal,
      currentMultiMeetingSeat,
      findLiveStatus,
      refreshMultiMeetingLiveStatus,
      syncMultiMeetingStore,
    };
  },
);
