/**
 * @file 打赏 store
 */
import { translate } from '@/assets/lang';
import {
  DonateSetting,
  YN,
  DonateType,
  DonateGoodData,
  PayDonateData,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useChannelStore } from '@/store/use-channel-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { ynToBool } from '@utils-ts/boolean';
import { changeProtocol } from '@utils-ts/net';
import { getWatchCore } from '@/core/watch-sdk';
import { toast } from '@/hooks/components/use-toast';
import { useWatchAppStore } from './use-watch-app-store';

export interface DonateGoodInfo extends DonateGoodData {
  /** 翻译后的礼物名称 */
  goodTranslateName: string;
  /** 礼物价格文案 */
  goodPriceText: string;
  /** 礼物类型 */
  donateType: DonateType.Good;
}

type DonatePageItem =
  | DonateGoodInfo
  | {
      donateType: DonateType.Cash;
    };

export interface DonateStoreState {
  /** 打赏设置 */
  donateSetting: ComputedRef<DonateSetting | undefined>;
  /** 现金打赏开关 */
  donateCashEnabled: ComputedRef<boolean>;
  /** 现金打赏最低的打赏金额 */
  donateCashMin: ComputedRef<number>;
  /** 现金打赏快捷选项 */
  donateCashQuickOptions: ComputedRef<number[]>;
  /** 现金打赏道具开关 */
  donateGoodEnabled: ComputedRef<boolean>;
  /** 积分打赏道具开关 */
  donatePointEnabled: ComputedRef<boolean>;
  /** 是否显示现金打赏 */
  showDonateCash: ComputedRef<boolean>;
  /** 是否显示现金道具打赏 */
  showDonateGood: ComputedRef<boolean>;
  /** 是否显示积分道具打赏 */
  showDonatePoint: ComputedRef<boolean>;
  /** 是否显示道具打赏 */
  showDonateGifts: ComputedRef<boolean>;
  /** 是否显示打赏功能 */
  showDonateFunction: ComputedRef<boolean>;
  /** 积分打赏礼物单位 */
  donatePointUnit: ComputedRef<string | undefined>;
  /** 所有打赏道具列表 */
  donateItemAll: ComputedRef<DonateGoodInfo[]>;
  /** 可以显示的打赏道具列表 */
  donateItemList: ComputedRef<DonateGoodInfo[]>;
  /** 将道具、现金打赏进行分页 */
  donateContentPages: ComputedRef<DonatePageItem[][]>;
  /** 付费礼物列表 */
  payDonateGoods: ComputedRef<DonateGoodInfo[]>;
  /** PC 端下当前待支付的打赏数据 */
  waitPayDonateData: Ref<PayDonateData | undefined>;
  /** 是否显示其他人的打赏特效 */
  donateAnimationVisible: Ref<boolean>;
}

export interface DonateStoreAction {
  /** 切换打赏动画显示状态 */
  toggleDonateAnimationVisible: () => void;
  /** 翻译打赏道具的道具名 */
  translateGoodName: (goodName: string) => string;
  /** 获取打赏道具的价格文案 */
  getGoodPriceText: (goodPrice: string) => string;
  /** 根据道具图片获取打赏道具信息 */
  findDonateGoodByImg: (targetGoodImg: string) => DonateGoodInfo | undefined;
}

export interface DonateStore extends DonateStoreState, DonateStoreAction {}

export const useDonateStore = defineStore<'donate', DonateStore>('donate', () => {
  const watchAppStore = useWatchAppStore();
  const { channelDetail, isSeminarChannel } = storeDefinitionToRefs(useChannelStore);
  const { weixinAccountFunctionEnabled, weixinPayEnabled } = storeDefinitionToRefs(useWeixinStore);

  /** 道具礼物中英文 */
  const goodNamesConfig = computed<UniversalParams<string>>(() => {
    return {
      666: translate('donate.name.six'),
      小熊: translate('donate.name.bear'),
      麦克风: translate('donate.name.microphone'),
      别墅: translate('donate.name.villa'),
      咖啡: translate('donate.name.coffee'),
      奖杯: translate('donate.name.trophy'),
      小星星: translate('donate.name.star'),
      掌声: translate('donate.name.applause'),
      游艇: translate('donate.name.yacht'),
      火箭: translate('donate.name.rocket'),
      点赞: translate('donate.name.like'),
      烟火: translate('donate.name.fireworks'),
      皇冠: translate('donate.name.crown'),
      跑车: translate('donate.name.cars'),
      金蛋: translate('donate.name.goldenEggs'),
      钻石: translate('donate.name.diamonds'),
      飞机: translate('donate.name.plane'),
      鲜花: translate('donate.name.flower'),
    };
  });

  /** 打赏设置 */
  const donateSetting = computed(() => unref(channelDetail)?.donateSetting ?? undefined);

  /** 现金打赏开关 */
  const donateCashEnabled = computed(() =>
    ynToBool(unref(donateSetting)?.donateCashEnabled || YN.N),
  );

  /** 现金打赏最低的打赏金额 */
  const donateCashMin = computed(() => unref(donateSetting)?.cashMin || 0);

  /** 现金打赏快捷选项 */
  const donateCashQuickOptions = computed(() => unref(donateSetting)?.cashes || []);

  /** 现金打赏道具开关 */
  const donateGoodEnabled = computed(() => {
    return ynToBool(unref(donateSetting)?.donateGoodEnabled || YN.N);
  });

  /** 积分打赏道具开关 */
  const donatePointEnabled = computed(() => {
    return ynToBool(unref(donateSetting)?.donatePointEnabled || YN.N);
  });

  /** 是否显示现金打赏 */
  const showDonateCash = computed(() => {
    return (
      unref(donateCashEnabled) && unref(weixinAccountFunctionEnabled) && unref(weixinPayEnabled)
    );
  });

  /** 是否显示现金道具打赏 */
  const showDonateGood = computed(() => {
    return (
      unref(donateGoodEnabled) && unref(weixinAccountFunctionEnabled) && unref(weixinPayEnabled)
    );
  });

  /** 是否显示积分道具打赏 */
  const showDonatePoint = computed(() => {
    return unref(donatePointEnabled);
  });

  /** 是否显示道具打赏 */
  const showDonateGifts = computed(() => {
    return unref(showDonateGood) || unref(showDonatePoint);
  });

  /** 是否显示打赏功能 */
  const showDonateFunction = computed(() => {
    if (watchAppStore.isWatchBackUrl) return false;

    return (unref(showDonateCash) || unref(showDonateGifts)) && !unref(isSeminarChannel);
  });

  /** 积分打赏礼物单位 */
  const donatePointUnit = computed(() => unref(donateSetting)?.pointUnit);

  /** 所有打赏道具列表 */
  const donateItemAll = computed<DonateGoodInfo[]>(() => {
    const watchCore = getWatchCore();
    let goods: DonateGoodData[] = [];
    const goodData = watchCore.donate.getDonateGoods();

    if (unref(donatePointEnabled)) {
      goods = goodData.pointGoods;
    } else {
      goods = goodData.goods;
    }

    return goods.map<DonateGoodInfo>(good => {
      return {
        ...good,
        goodTranslateName: translateGoodName(good.goodName),
        goodPriceText: getGoodPriceText(good.goodPrice),
        donateType: DonateType.Good,
      };
    });
  });

  /** 可以显示的打赏道具列表 */
  const donateItemList = computed<DonateGoodInfo[]>(() => {
    const goods = unref(donateItemAll);

    return goods.filter(good => {
      // 道具的开关
      if (ynToBool(good.goodEnabled || YN.N) === false) {
        return false;
      }

      // 现金道具 + 付费道具 + 没开启超管后台支付开关和微信公众号功能
      if (
        unref(donateGoodEnabled) &&
        good.goodPrice !== 0 &&
        (!unref(weixinPayEnabled) || !unref(weixinAccountFunctionEnabled))
      ) {
        return false;
      }

      return true;
    });
  });

  /** 将道具、现金打赏进行分页 */
  const donateContentPages = computed<DonatePageItem[][]>(() => {
    // 所有打赏种类，道具+现金
    const donateList: DonatePageItem[] = [];

    // 插入礼物打赏节点（含现金、积分礼物）
    if (unref(showDonateGifts)) {
      donateList.push(...unref(donateItemList));
    }

    // 插入现金打赏节点
    if (unref(showDonateCash)) {
      donateList.push({
        donateType: DonateType.Cash,
      });
    }

    const pages: DonatePageItem[][] = [];
    const totalPages = Math.ceil(donateList.length / 10);
    for (let i = 0; i < totalPages; i++) {
      pages.push(donateList.slice(i * 10, i * 10 + 10));
    }

    return pages;
  });

  /** 付费礼物列表 */
  const payDonateGoods = computed<DonateGoodInfo[]>(() => {
    const goods = unref(donateItemAll);
    return goods.filter(good => good.goodPrice > 0);
  });

  /** PC 端下当前待支付的打赏数据 */
  const waitPayDonateData = ref<PayDonateData>();

  /** 是否显示其他人的打赏特效 */
  const donateAnimationVisible = ref(true);

  /** 切换打赏动画显示状态 */
  function toggleDonateAnimationVisible() {
    donateAnimationVisible.value = !unref(donateAnimationVisible);

    if (donateAnimationVisible.value) {
      toast.success(translate('donate.showAnimation.tips'));
    } else {
      toast.success(translate('donate.hideAnimation.tips'));
    }
  }

  /** 翻译打赏道具的道具名 */
  function translateGoodName(goodName: string): string {
    const translateName = unref(goodNamesConfig)[goodName];

    if (translateName) {
      return translateName;
    }

    return goodName;
  }

  /** 获取打赏道具的价格文案 */
  function getGoodPriceText(goodPrice: string | number): string {
    if (!goodPrice) return translate('donate.free');

    if (unref(donateGoodEnabled)) {
      return `￥${goodPrice}`;
    }

    return `${goodPrice} ${unref(donatePointUnit) || translate('donate.spot')}`;
  }

  /**
   * 根据道具图片获取打赏道具信息
   * @param targetGoodImg 道具图片
   */
  function findDonateGoodByImg(targetGoodImg: string): DonateGoodInfo | undefined {
    let goodInfo: DonateGoodInfo | undefined;
    const list = unref(donateItemAll);

    for (let i = 0; i < list.length; i++) {
      const good = list[i];
      const goodImg = changeProtocol(good.goodImg, 'https');
      const dynamicImg = changeProtocol(good.dynamicImg ?? '', 'https');
      const _targetGoodImg = changeProtocol(targetGoodImg, 'https');
      if (_targetGoodImg === goodImg || _targetGoodImg === dynamicImg) {
        goodInfo = good;
        break;
      }
    }

    return goodInfo;
  }

  return {
    donateSetting,
    donateCashEnabled,
    donateCashMin,
    donateCashQuickOptions,
    donateGoodEnabled,
    donatePointEnabled,
    showDonateCash,
    showDonateGood,
    showDonatePoint,
    showDonateGifts,
    showDonateFunction,
    donatePointUnit,
    donateItemAll,
    donateItemList,
    donateContentPages,
    payDonateGoods,

    waitPayDonateData,
    donateAnimationVisible,

    toggleDonateAnimationVisible,
    translateGoodName,
    getGoodPriceText,
    findDonateGoodByImg,
  };
});
