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
import {
  ChannelWatchPageSkin,
  InteractSetting,
  PlvInteractReceiveModule,
  SeatTableTemplate,
} from '@polyv/live-watch-sdk';

import { getWatchCore } from '@/core/watch-sdk';
import { useWatchAppStore } from './use-watch-app-store';
import { useViewerStore } from './use-viewer-store';
import { useThemeStore } from './use-theme-store';

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
  /** 互动 SDK 加载完成，注意不一定加载成功 */
  iarSdkLoaded: Ref<boolean>;
  /** 互动设置信息 */
  interactSetting: Ref<InteractSetting>;
  /** 互动功能是否全屏处理 */
  isIarFullScreen: ComputedRef<boolean>;
  /** 互动功能二次入口列表 */
  interactiveEntrance: Ref<InteractiveEntranceData[]>;
  /** 公告提示是否显示 */
  announcementTipsVisible: Ref<boolean>;
  /** 当前是否存在公告 */
  hasBulletin: Ref<boolean>;
  /** 公告功能是否显示 */
  announcementFunctionVisible: ComputedRef<boolean>;
  /** 当前中奖记录列表 */
  lotteryWinRecords: Ref<LotteryRecordData[]>;
  /** 是否存在未提交的中奖记录 */
  hasNotReceivedLottery: ComputedRef<boolean>;
  /** 卡片推送入口是否正在显示 */
  pushCardPendantVisible: Ref<boolean>;
  /** 抽奖入口是否显示 */
  lotteryPendantVisible: Ref<boolean>;
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
  /** 云席 SDK 是否初始化完成 */
  seatTableSdkInited: Ref<boolean>;
  /** 云席是否可见 */
  seatTableVisible: ComputedRef<boolean>;
  /** 是否为"模拟会场"云席模板 */
  isMeetingSeatTableTemplate: ComputedRef<boolean>;
  /** 当前观众的座位位置 */
  seatPosition: ComputedRef<{ row: number; column: number } | undefined>;
  /** 当前是否存在签到 */
  hasCheckIn: Ref<boolean>;
  /** 商品库气泡是否显示 */
  productBubbleVisible: Ref<boolean>;
  /** 问卷是否显示返回按钮 */
  questionnaireBackBtnVisible: Ref<boolean>;
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
    const themeStore = useThemeStore();
    const viewerStore = useViewerStore();

    /** 互动 SDK 加载完成，注意不一定加载成功 */
    const iarSdkLoaded = ref(false);

    /** 互动设置信息 */
    const interactSetting = ref<InteractSetting>(
      PlvInteractReceiveModule.generateDefaultInteractSetting(),
    );

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

    /** 当前是否存在公告 */
    const hasBulletin = ref(false);

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

    /** 抽奖入口是否显示 */
    const lotteryPendantVisible = ref(false);

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

    /** 云席 SDK 是否初始化完成 */
    const seatTableSdkInited = ref(false);

    /** 是否为"模拟会场"云席模板 */
    const isMeetingSeatTableTemplate = computed(() => {
      return interactSetting.value.seatTableTemplate === SeatTableTemplate.Meeting;
    });

    /** 云席是否可见 */
    const seatTableVisible = computed(() => {
      const seatEnabled = interactSetting.value.seatTableEnabled;

      let isAvailableSkinForSeat = true;

      // 由于多皮肤暂未补齐，“模拟会场”模板才需要限制指定皮肤才能启用云席
      if (isMeetingSeatTableTemplate.value && themeStore.pageSkin) {
        isAvailableSkinForSeat = [ChannelWatchPageSkin.Red, ChannelWatchPageSkin.White].includes(
          themeStore.pageSkin,
        );
      }

      return seatEnabled && isAvailableSkinForSeat;
    });

    /** 当前观众的座位位置 */
    const seatPosition = computed(() => {
      const seatInfo = viewerStore.seatInfo;
      if (!seatInfo) {
        return;
      }
      const { seatMaxNumber, seatVipMaxNumber } = unref(interactSetting);
      const seatNumber = seatInfo.seatNumber || 0;
      // 普通观众，顺序超过普通座位数
      const overNormalViewer = !seatInfo.isVip && seatNumber > seatMaxNumber;
      // vip 观众，但顺序超过 vip 座位数
      const overVipNumber = seatInfo.isVip && seatNumber > seatVipMaxNumber;
      if (!seatNumber || overVipNumber || overNormalViewer) {
        // 已无座位
        return;
      }

      // 每行座位数
      const columnCount = 6;
      const mod = seatNumber % columnCount;
      // VIP 总行数
      const vipTotalRows = Math.ceil(seatVipMaxNumber / columnCount);
      // 观众当前行数
      let viewerRow = Math.ceil(seatNumber / columnCount);
      if (!seatInfo.isVip) {
        viewerRow = vipTotalRows + viewerRow;
      }
      return {
        // 几行
        row: viewerRow,
        // 几座
        column: mod === 0 ? columnCount : mod,
      };
    });

    /** 是否存在签到 */
    const hasCheckIn = ref(false);

    const productBubbleVisible = ref(false);

    /** 问卷是否显示返回按钮 */
    const questionnaireBackBtnVisible = ref(true);

    return {
      iarSdkLoaded,

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
      lotteryPendantVisible,
      welfareLotteryPendantVisible,
      rushAnswerPendantVisible,
      enrollLotteryPendantVisible,
      redpackPendantVisible,
      isGoOnRedpackRain,
      qaReminderVisible,
      seatTableSdkInited,
      seatTableVisible,
      isMeetingSeatTableTemplate,
      seatPosition,
      hasBulletin,
      hasCheckIn,
      productBubbleVisible,
      questionnaireBackBtnVisible,
    };
  },
);
