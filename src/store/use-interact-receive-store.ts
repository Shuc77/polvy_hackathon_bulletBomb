/**
 * @file 互动功能接收端 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';

import { useChannelStore } from './use-channel-store';
import { useLayoutStore } from './use-layout-store';

import { LangKey } from '@/assets/lang/types';
import {
  AnnouncementTipsStatus,
  getStorageTipsStatus,
} from '@/components/page-watch-common/interactive-receive/announcement/hooks/use-announcement-tips';
import { LotteryRecordData } from '@/components/page-watch-common/interactive-receive/lottery/types/lottery-types';
import { InteractSetting } from '@polyv/live-watch-sdk';

import { getWatchCore } from '@/core/watch-sdk';
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
  /** 互动设置信息 */
  interactSetting: Ref<InteractSetting>;
  /** 互动功能是否全屏处理 */
  isIarFullScreen: ComputedRef<boolean>;
  /** 互动功能二次入口列表 */
  interactiveEntrance: Ref<InteractiveEntranceData[]>;
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
  /** 抢答入口是否显示 */
  rushAnswerPendantVisible: Ref<boolean>;
  /** 报名抽奖挂件是否显示 */
  enrollLotteryPendantVisible: Ref<boolean>;
  /** 红包挂件是否显示 */
  redpackPendantVisible: Ref<boolean>;
  /** 红包雨是否正在显示 */
  isGoOnRedpackRain: Ref<boolean>;
  /** 是否显示问答的红点提示 */
  qaReminderVisible: Ref<boolean>;
}

export interface InteractReceiveStoreAction {
  /** 同步互动 store */
  syncInteractStore(): void;
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

    /** 互动设置信息 */
    const interactSetting = ref<InteractSetting>({
      enrollLotteryEnabled: false,
      recruitmentEnabled: false,
      productEnabled: false,
      productTrackEnabled: false,
      productLinkJumpTipEnabled: false,
      redpackEnabled: false,
      conditionLotteryAutoPopperEnabled: false,
      watchFeedbackEnabled: false,
      voteActiveEnabled: false,
      redpackImage: '',
      redpackRainBottomImage: '',
      redpackRainImages: [],
    });

    function syncInteractStore() {
      const watchCore = getWatchCore();
      interactSetting.value = watchCore.interactReceive.getInteractSetting();
    }

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

    /** 公告提示是否显示 */
    const announcementTipsVisible = ref(
      getStorageTipsStatus() === AnnouncementTipsStatus.showing &&
        !watchAppStore.isPlaybackWatchUrl,
    );

    /** 公告功能是否显示 */
    const announcementFunctionVisible = computed(() => {
      if (watchAppStore.isPlaybackWatchUrl) return false;
      if (channelStore.isSeminarChannel) return false;

      return true;
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

    /** 抢答入口是否显示 */
    const rushAnswerPendantVisible = ref(false);

    /** 报名抽奖挂件是否显示 */
    const enrollLotteryPendantVisible = ref(false);

    /** 红包挂件是否显示 */
    const redpackPendantVisible = ref(false);

    /** 红包雨是否正在显示 */
    const isGoOnRedpackRain = ref(false);

    /** 是否显示问答的红点提示 */
    const qaReminderVisible = ref(false);

    return {
      interactSetting,
      syncInteractStore,

      isIarFullScreen,
      interactiveEntrance,
      setInteractiveEntrance,
      removeInteractiveEntrance,

      announcementTipsVisible,
      announcementFunctionVisible,
      lotteryWinRecords,
      hasNotReceivedLottery,
      pushCardPendantVisible,
      welfareLotteryPendantVisible,
      rushAnswerPendantVisible,
      enrollLotteryPendantVisible,
      redpackPendantVisible,
      isGoOnRedpackRain,
      qaReminderVisible,
    };
  },
);
