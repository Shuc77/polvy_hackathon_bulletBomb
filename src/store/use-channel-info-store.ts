/**
 * @file 频道信息 store
 */
import { DATE_FORMAT_SLASH } from '@/assets/constants/date-format';
import { DEFAULT_CHANNEL_LOGO, DEFAULT_SPLASH_IMG } from '@/assets/constants/defaults';
import { LangType } from '@/assets/lang/lang-enum';
import { translate } from '@/assets/lang';
import {
  isAndroid,
  isBaiduApp,
  isIOS,
  isQQBrowser,
  isUCBrowser,
  isWeixin,
  isWorkWeixin,
} from '@/assets/utils/browser';
import { resizeOSSImg } from '@/assets/utils/image';
import { htmlStr2Text } from '@/assets/utils/string';
import { getWatchCore } from '@/core/watch-sdk';
import { ChannelBasicInfo, LiveStatus, PageViewShowLocation, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { formatDate } from '@utils-ts/date';
import { defineStore } from 'pinia';
import { computed, ComputedRef, Ref, ref, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { useLangStore } from './use-lang-store';

export interface ChannelInfoStoreState {
  /** 频道信息（中文） */
  cnChannelBasicInfo: Ref<ChannelBasicInfo>;
  /** 频道信息（英文） */
  enChannelBasicInfo: Ref<ChannelBasicInfo>;
  /** 频道信息（根据多语言返回） */
  channelInfo: ComputedRef<ChannelBasicInfo>;
  /** 频道标题（根据多语言返回） */
  channelTitle: ComputedRef<string>;
  /** 频道主持人（根据多语言返回） */
  channelPublisher: ComputedRef<string>;
  /** 频道描述（根据多语言返回） */
  channelDescription: ComputedRef<string>;
  /** 频道描述是否为空 */
  channelDescriptionIsEmpty: ComputedRef<boolean>;
  /** 频道图标 */
  channelCoverImg: ComputedRef<string>;
  /** 频道引导页封面图 */
  channelSplashImg: ComputedRef<string>;
  /** PC 端观看页背景图 */
  pcWatchBackgroundImage: ComputedRef<string | undefined>;
  /** 观看浏览次数显示开关 */
  pvShowEnabled: ComputedRef<boolean>;
  /** 页面浏览次数 */
  pageViewCount: Ref<number>;
  /** 页面浏览次数显示位置 */
  pageViewCountLocation: ComputedRef<PageViewShowLocation>;
  /** 当前频道的点赞数 */
  likeCount: Ref<number>;
  /** 直播开始时间 */
  liveStartTime: ComputedRef<number | undefined>;
  /** 是否直播开始时间倒计时结束 */
  isLiveStartCountDownEnd: Ref<boolean>;
  /** 直播开始时间显示文案 */
  liveStartTimeText: ComputedRef<string>;
  /** 是否显示直播倒计时 */
  showLiveCountDown: ComputedRef<boolean>;
}

export interface ChannelInfoStoreAction {
  /** 刷新频道信息 */
  syncChannelInfo: () => void;
}

/** 频道信息 store */
export interface ChannelInfoStore extends ChannelInfoStoreState, ChannelInfoStoreAction {}

export const useChannelInfoStore = defineStore<'channelInfo', ChannelInfoStore>(
  'channelInfo',
  () => {
    const langStore = useLangStore();
    const channelStore = useChannelStore();

    /** 频道信息（中文） */
    const cnChannelBasicInfo = ref<ChannelBasicInfo>({
      title: '',
      publisher: '',
      description: '',
    });

    /** 频道信息（英文） */
    const enChannelBasicInfo = ref<ChannelBasicInfo>({
      title: '',
      publisher: '',
      description: '',
    });

    /** 频道信息（根据多语言返回） */
    const channelInfo = computed(() => {
      let info: ChannelBasicInfo = unref(cnChannelBasicInfo);

      if (langStore.englishSettingEnabled && langStore.currentLang !== LangType.Chinese) {
        info = unref(enChannelBasicInfo);
      }

      return info;
    });

    /** 频道标题（根据多语言返回） */
    const channelTitle = computed(() => unref(channelInfo).title);

    /** 频道主持人（根据多语言返回） */
    const channelPublisher = computed(() => {
      let publisher = unref(channelInfo).publisher;

      if (!publisher && channelStore.isSeminarChannel) {
        publisher = translate('seminar.host');
      }

      return publisher;
    });

    /** 频道描述（根据多语言返回） */
    const channelDescription = computed(() => unref(channelInfo).description);

    /** 频道描述是否为空 */
    const channelDescriptionIsEmpty = computed<boolean>(() => {
      const htmlContent = unref(channelDescription);
      if (!htmlContent) {
        return true;
      }
      // 具有以下标签的则不为空
      const labelName = ['img'];
      for (let i = 0; i <= labelName.length; i++) {
        if (htmlContent.indexOf(labelName[i]) !== -1) {
          return false;
        }
      }
      // 纯文本为空
      const htmlText = htmlStr2Text(htmlContent);
      if (!htmlText) {
        return true;
      }
      return false;
    });

    /** 频道图标 */
    const channelCoverImg = computed(
      () => channelStore.channelDetail?.channelInfo?.coverImg ?? DEFAULT_CHANNEL_LOGO,
    );

    /** 频道引导页封面图 */
    const channelSplashImg = computed<string>(() => {
      let splashImg = channelStore.channelDetail?.channelInfo?.splashImg;

      // 由于引导页图片默认是竖状图，这里针对该默认图替换成横屏的
      if (
        !splashImg ||
        splashImg.replace(/^([a-z]+:)?\/\//, '') ===
          'livestatic.videocc.net/assets/wimages/default_guide.png'
      ) {
        splashImg = DEFAULT_SPLASH_IMG;
      }

      return resizeOSSImg(splashImg, 1280, 720);
    });

    /** PC 端观看页背景图 */
    const pcWatchBackgroundImage = computed<string | undefined>(() => {
      return channelStore.channelDetail?.theme.customPCWatchBackgroundImage ?? undefined;
    });

    /** 观看浏览次数显示开关 */
    const pvShowEnabled = computed<boolean>(() =>
      ynToBool(channelStore.channelDetail?.channelConfig.pvShowEnabled || YN.N),
    );

    /** 页面浏览次数 */
    const pageViewCount = ref(0);

    /** 页面浏览次数显示位置，默认显示在频道介绍中 */
    const pageViewCountLocation = computed<PageViewShowLocation>(() => {
      const mobilePvShowLocation = channelStore.channelDetail?.channelConfig.mobilePvShowLocation;

      // 显示在频道介绍中
      if (mobilePvShowLocation === PageViewShowLocation.Desc) {
        return PageViewShowLocation.Desc;
      }

      // 显示在播放器
      if (
        mobilePvShowLocation === PageViewShowLocation.Player &&
        channelStore.liveStatus === LiveStatus.Live &&
        ((isAndroid && (isWeixin || isWorkWeixin)) ||
          (isIOS && !isQQBrowser && !isUCBrowser && !isBaiduApp))
      ) {
        return PageViewShowLocation.Player;
      }

      return PageViewShowLocation.Desc;
    });

    /** 当前频道的点赞数 */
    const likeCount = ref<number>(0);

    /** 直播开始时间 */
    const liveStartTime = computed<number | undefined>(() => {
      return channelStore.channelDetail?.channelInfo.startTime ?? undefined;
    });

    /** 是否直播开始时间倒计时结束 */
    const isLiveStartCountDownEnd = ref(false);

    /** 直播开始时间显示文案 */
    const liveStartTimeText = computed<string>(() => {
      const time = unref(liveStartTime);
      if (!time) {
        return '- -';
      }

      return formatDate(time, DATE_FORMAT_SLASH);
    });

    /** 直播倒计时是否显示 */
    const showLiveCountDown = computed(() => {
      const liveStartTimeVal = unref(liveStartTime);
      // 后台开关
      if (!ynToBool(channelStore.channelDetail?.channelConfig.countEnabled, YN.N)) {
        return false;
      }

      // 没有返回开始时间
      if (!liveStartTimeVal) {
        return false;
      }

      // 直播中和已结束直播
      if ([LiveStatus.Live, LiveStatus.End].includes(channelStore.liveStatus)) {
        return false;
      }

      // 倒计时结束
      if (isLiveStartCountDownEnd.value) {
        return false;
      }

      return Date.now() < liveStartTimeVal;
    });

    /** 刷新频道信息 */
    function syncChannelInfo(): void {
      const watchCore = getWatchCore();
      const channelDetail = watchCore.channel.getChannelDetail();
      const channelBasicInfo = watchCore.channel.getChannelBasicInfo('zh_CN');

      cnChannelBasicInfo.value = {
        title: channelBasicInfo.title,
        publisher: channelBasicInfo.publisher,
        description: channelBasicInfo.description,
      };

      const channelBasicEnInfo = watchCore.channel.getChannelBasicInfo('en');
      enChannelBasicInfo.value = {
        title: channelBasicEnInfo.title,
        publisher: channelBasicEnInfo.publisher,
        description: channelBasicEnInfo.description,
      };

      pageViewCount.value = watchCore.channel.getPageViewCount();
      if (channelDetail.watchData.likes > likeCount.value) {
        likeCount.value = channelDetail.watchData.likes;
      }
    }

    return {
      cnChannelBasicInfo,
      enChannelBasicInfo,
      channelInfo,

      channelTitle,
      channelPublisher,
      channelDescription,
      channelDescriptionIsEmpty,
      channelCoverImg,
      channelSplashImg,
      pcWatchBackgroundImage,

      pvShowEnabled,
      pageViewCount,
      pageViewCountLocation,

      likeCount,

      liveStartTime,
      isLiveStartCountDownEnd,
      liveStartTimeText,
      showLiveCountDown,

      syncChannelInfo,
    };
  },
);
