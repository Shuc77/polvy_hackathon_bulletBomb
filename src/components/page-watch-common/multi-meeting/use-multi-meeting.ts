import { DEFAULT_SPLASH_IMG } from '@/assets/constants/defaults';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import {
  LiveStatus,
  ChannelMultiMeetingItem,
  MultiMeetingLiveStatusData,
  YN,
} from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { computed, ComputedRef, onBeforeUnmount, ref, unref, watch } from 'vue';

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

export const useMultiMeeting = () => {
  const channelStore = useChannelStore();

  /** 分会场开关 */
  const multiMeetingEnabled = computed(() =>
    ynToBool(channelStore.channelDetail?.multiMeetingSetting?.multiMeetingEnabled, YN.N),
  );

  /** 分会场频道状态 */
  const multiMeetingLiveStatus = ref<MultiMeetingLiveStatusData[]>([]);

  /** 根据频道号获取频道的直播状态 */
  function findLiveStatus(channelId: string): LiveStatus {
    const statusList = unref(multiMeetingLiveStatus);
    const index = statusList.findIndex(item => item.channelId === channelId);
    return index === -1 ? LiveStatus.End : statusList[index].liveStatus;
  }

  /** 分会场列表 */
  const multiMeetingList = computed<MultiMeetingData[]>(() => {
    const watchCore = getWatchCore();
    const multiMeetings = channelStore.channelDetail?.multiMeetingSetting?.multiMeetings || [];

    return multiMeetings.map<MultiMeetingData>(item => {
      const splashImg = item.splashImg || DEFAULT_SPLASH_IMG;
      const meetingChannelId = item.channelId.toString();
      const liveStatus = findLiveStatus(meetingChannelId);
      const isCurrent = meetingChannelId === channelStore.channelId;
      const showIcon = isCurrent && [LiveStatus.Live, LiveStatus.Playback].includes(liveStatus);
      const watchUrl = watchCore.multiMeeting.generateMultiMeetingWatchUrl(meetingChannelId);

      return {
        ...item,
        splashImg,
        isCurrent,
        liveStatus,
        showIcon,
        watchUrl,
      };
    });
  });

  /** 会场总数 */
  const multiMeetingTotal = computed(() => unref(multiMeetingList).length);

  /** 当前频道位置 */
  const currentMultiMeetingSeat = computed(() => {
    const index = unref(multiMeetingList).findIndex(item => item.isCurrent);

    return index + 1;
  });

  /**
   * 获取分会场的直播状态
   */
  async function getMultiMeetingLiveStatus(): Promise<void> {
    const watchCore = getWatchCore();
    const data = await watchCore.multiMeeting.getMultiMeetingLiveStatus();
    multiMeetingLiveStatus.value = data;
  }

  let pollingTimer: number | undefined;
  /** 开始直播状态轮询 */
  function startLiveStatusPolling(): void {
    closeLiveStatusPolling();

    pollingTimer = window.setInterval(() => getMultiMeetingLiveStatus(), 60 * 1000);
    getMultiMeetingLiveStatus();
  }

  /** 关闭直播状态轮询 */
  function closeLiveStatusPolling(): void {
    if (pollingTimer) {
      window.clearInterval(pollingTimer);
      pollingTimer = undefined;
    }
  }

  watch(
    () => unref(multiMeetingTotal),
    () => {
      if (unref(multiMeetingTotal)) {
        startLiveStatusPolling();
      } else {
        closeLiveStatusPolling();
      }
    },
    {
      immediate: true,
    },
  );

  onBeforeUnmount(() => {
    closeLiveStatusPolling();
  });

  return {
    multiMeetingEnabled,
    multiMeetingList,
    multiMeetingTotal,
    currentMultiMeetingSeat,
  };
};

/**
 * 分会场分页 hook
 */
export const useMultiMeetingPage = (options: {
  pageSize?: number;
  multiMeetingList: ComputedRef<MultiMeetingData[]>;
  currentMultiMeetingSeat: ComputedRef<number>;
}) => {
  const { pageSize = 5, multiMeetingList, currentMultiMeetingSeat } = options;

  const wrapLeftPercent = ref(0);

  /** 列表外层百分比 */
  const wrapWidthPercent = computed(() => {
    const total = unref(multiMeetingList).length;
    return Math.ceil(total / pageSize) * 100;
  });

  const wrapStyle = computed(() => {
    return {
      width: `${unref(wrapWidthPercent)}%`,
      left: `-${unref(wrapLeftPercent)}%`,
    };
  });

  const itemWidPercent = computed(() => {
    const total = unref(multiMeetingList).length;
    return 100 / (pageSize * Math.ceil(total / pageSize));
  });

  const itemStyle = computed(() => {
    return {
      width: `${unref(itemWidPercent)}%`,
    };
  });

  /** 是否禁用上一页按钮 */
  const disabledPrev = ref(false);
  /** 是否禁用下一个按钮 */
  const disabledNext = ref(false);

  function handlePageChange(toNextGroup = true): void {
    if (toNextGroup) {
      wrapLeftPercent.value += 100;
    } else {
      wrapLeftPercent.value -= 100;
    }
    checkDisabled();
  }

  function checkDisabled() {
    disabledPrev.value = unref(wrapLeftPercent) <= 0;
    disabledNext.value = unref(wrapLeftPercent) >= unref(wrapWidthPercent) - 100;
  }

  watch(
    () => unref(currentMultiMeetingSeat),
    () => {
      // 保持当前会场信息在会场列表中可见

      checkDisabled();
      const currentSeat = unref(currentMultiMeetingSeat) - 1;
      if (currentSeat < pageSize) return;

      const count = Math.floor(currentSeat / pageSize);
      for (let i = 0; i < count; i++) {
        handlePageChange(true);
      }
    },
    {
      immediate: true,
    },
  );

  return {
    pageSize,
    wrapWidthPercent,
    wrapStyle,
    itemWidPercent,
    itemStyle,
    disabledPrev,
    disabledNext,
    handlePageChange,
  };
};
