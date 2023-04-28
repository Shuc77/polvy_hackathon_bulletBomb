/**
 * @file 互动功能接收端 store
 */

import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { defineStore } from 'pinia';

import { useChannelStore } from './use-channel-store';
import { useLayoutStore } from './use-layout-store';

import {
  AnnouncementTipsStatus,
  getStorageTipsStatus,
} from '@/components/page-watch-common/interactive-receive/announcement/hooks/use-announcement-tips';
import { LotteryRecordData } from '@/components/page-watch-common/interactive-receive/lottery/types/lottery-types';
import { LangKey } from '@/assets/lang/types';
import { YN } from '@polyv/live-watch-sdk';

import { ynToBool } from '@utils-ts/boolean';
import { useWatchAppStore } from './use-watch-app-store';

/**
 * 互动功能二次入口数据
 */
export interface InteractiveEntranceData {
  /** 类型 */
  type: string;
  /** 入口名称（多语言 key） */
  name: LangKey;
  /** 入口文本 */
  text?: string;
  /** 图标（常规模板用） */
  icon: string;
  /** 图标（竖屏大图标用） */
  icon2: string;
  /** 点击时的回调事件 */
  onClick: () => void;
}

export interface InteractReceiveStoreState {
  /** 互动功能是否全屏处理 */
  isIarFullScreen: ComputedRef<boolean>;
  /** 互动功能二次入口列表 */
  interactiveEntrance: Ref<InteractiveEntranceData[]>;
  /** 投诉反馈开关 */
  watchFeedbackEnabled: ComputedRef<boolean>;
  /** 公告提示是否显示 */
  announcementTipsVisible: Ref<boolean>;
  /** 公告功能是否显示 */
  announcementFunctionVisible: ComputedRef<boolean>;
  /** 当前中奖记录列表 */
  lotteryWinRecords: Ref<LotteryRecordData[]>;
  /** 是否存在未提交的中奖记录 */
  hasNotReceivedLottery: ComputedRef<boolean>;
  /** 卡片推送入口是否正在显示 */
  pushCardPendantVisible: Ref<boolean>;
  /** 条件抽奖入口是否显示 */
  welfareLotteryPendantVisible: Ref<boolean>;
  /** 报名抽奖挂件是否显示 */
  enrollLotteryPendantVisible: Ref<boolean>;
  /** 红包挂件是否显示 */
  redpackPendantVisible: Ref<boolean>;
  /** 红包雨是否正在显示 */
  isGoOnRedpackRain: Ref<boolean>;
  /** 商品库开关 */
  productEnabled: Ref<boolean>;
  /** 投票活动开关 */
  voteActiveEnabled: ComputedRef<boolean>;
  /** 已投票的 id 列表 */
  votedList: Ref<string[]>;
  /** 是否显示问答的红点提示 */
  qaReminderVisible: Ref<boolean>;
}

export interface InteractReceiveStoreAction {
  /** 设置互动二次入口，如果已存在则不生效 */
  setInteractiveEntrance(entranceData: InteractiveEntranceData): void;
  /** 根据类型移除互动二次入口 */
  removeInteractiveEntrance(type: string): void;
}

export interface InteractReceiveStore
  extends InteractReceiveStoreState,
    InteractReceiveStoreAction {}

export const useInteractReceiveStore = defineStore<'interactReceive', InteractReceiveStore>(
  'interactReceive',
  () => {
    const watchAppStore = useWatchAppStore();
    const channelStore = useChannelStore();
    const layoutStore = useLayoutStore();

    /** 互动功能是否全屏处理 */
    const isIarFullScreen = computed(() => {
      return layoutStore.mobilePlayerIsPageFullscreen && !layoutStore.isHorizontalScreenOrientation;
    });

    /** 互动功能二次入口列表 */
    const interactiveEntrance = ref<InteractiveEntranceData[]>([]);

    /** 设置互动二次入口，如果已存在则不生效 */
    function setInteractiveEntrance(entranceData: InteractiveEntranceData): void {
      const entrance = unref(interactiveEntrance);
      const index = entrance.findIndex(entrance => entrance.type === entranceData.type);
      if (index >= 0) return;
      interactiveEntrance.value.push(entranceData);
    }

    /** 根据类型移除互动二次入口 */
    function removeInteractiveEntrance(type: string): void {
      const entrance = unref(interactiveEntrance);
      const index = entrance.findIndex(entrance => entrance.type === type);
      if (index >= 0) {
        interactiveEntrance.value.splice(index, 1);
      }
    }

    /** 投诉反馈开关 */
    const watchFeedbackEnabled = computed(() => {
      return ynToBool(channelStore.channelDetail?.channelConfig.watchFeedbackEnabled, YN.N);
    });

    /** 公告提示是否显示 */
    const announcementTipsVisible = ref(
      getStorageTipsStatus() === AnnouncementTipsStatus.showing && !watchAppStore.isWatchBackUrl,
    );

    /** 公告功能是否显示 */
    const announcementFunctionVisible = computed(() => {
      if (watchAppStore.isWatchBackUrl) return false;

      return !channelStore.isSeminarChannel;
    });

    /** 当前中奖记录列表 */
    const lotteryWinRecords = ref<LotteryRecordData[]>([]);

    /** 是否存在未提交的中奖记录 */
    const hasNotReceivedLottery = computed<boolean>(() => {
      return unref(lotteryWinRecords).some(item => !item.received);
    });

    /** 卡片推送入口是否正在显示 */
    const pushCardPendantVisible = ref(false);

    /** 条件抽奖入口是否显示 */
    const welfareLotteryPendantVisible = ref(false);

    /** 报名抽奖挂件是否显示 */
    const enrollLotteryPendantVisible = ref(false);

    /** 红包挂件是否显示 */
    const redpackPendantVisible = ref(false);

    /** 红包雨是否正在显示 */
    const isGoOnRedpackRain = ref(false);

    /** 商品库开关 */
    const productEnabled = ref(false);

    /** 投票活动开关 */
    const voteActiveEnabled = computed<boolean>(() => {
      if (watchAppStore.isWatchBackUrl) return false;

      return ynToBool(channelStore.channelDetail?.channelConfig.voteActiveEnabled, YN.N);
    });

    /** 已投票的 id 列表 */
    const votedList = ref<string[]>([]);

    /** 是否显示问答的红点提示 */
    const qaReminderVisible = ref(false);

    return {
      isIarFullScreen,
      interactiveEntrance,
      setInteractiveEntrance,
      removeInteractiveEntrance,
      watchFeedbackEnabled,
      announcementTipsVisible,
      announcementFunctionVisible,
      lotteryWinRecords,
      hasNotReceivedLottery,
      pushCardPendantVisible,
      welfareLotteryPendantVisible,
      enrollLotteryPendantVisible,
      redpackPendantVisible,
      isGoOnRedpackRain,
      productEnabled,
      voteActiveEnabled,
      votedList,
      qaReminderVisible,
    };
  },
);
