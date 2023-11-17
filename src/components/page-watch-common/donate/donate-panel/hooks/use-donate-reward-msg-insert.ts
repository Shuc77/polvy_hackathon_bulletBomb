import { getWatchCore } from '@/core/watch-sdk';
import { DonateGoodInfo, useDonateStore } from '@/store/use-donate-store';
import { DonateType } from '@polyv/live-watch-sdk';
import type { DonatePayOptions } from './use-donate-pay';

export const useDonateRewardMsgInsertHook = () => {
  const donateStore = useDonateStore();
  const watchCore = getWatchCore();

  function insertRewardMsgForPayDonate(
    options: DonatePayOptions & {
      /** 是否免费，默认 false */
      isFree?: boolean;
    },
  ) {
    const { donateType, amount, goodId, isFree = false } = options;

    if (donateType === DonateType.Good) {
      const goodInfo = donateStore.findDonateGoodById(goodId);
      if (goodInfo) {
        watchCore.chat.insertLocalRewardChatMsg({
          donateType: DonateType.Good,
          goodImage: goodInfo.goodImage,
          goodName: goodInfo.goodName,
          isFree,
        });
      }
    } else if (donateType === DonateType.Cash) {
      watchCore.chat.insertLocalRewardChatMsg({
        donateType: DonateType.Cash,
        amount,
      });
    }
  }

  function insertRewardMsgForDonateGoodPoint(good: DonateGoodInfo, count: number) {
    watchCore.chat.insertLocalRewardChatMsg({
      goodImage: good.goodImage,
      goodName: good.goodName,
      goodCount: count,
      isFree: true,
      donateType: good.donateType,
    });
  }

  return {
    insertRewardMsgForPayDonate,
    insertRewardMsgForDonateGoodPoint,
  };
};
