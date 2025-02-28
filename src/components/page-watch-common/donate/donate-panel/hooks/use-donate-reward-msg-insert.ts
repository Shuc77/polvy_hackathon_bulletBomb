import { useGlobalInject } from '@/app/use-global-inject';
import { DonateGoodInfo, useDonateStore } from '@/store/use-donate-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { DonateType } from '@polyv/live-watch-sdk';
import type { DonatePayOptions } from './use-donate-pay';

export const useDonateRewardMsgInsertHook = () => {
  const { getWatchCore } = useGlobalInject();

  const donateStore = useDonateStore();
  const playbackStore = usePlaybackStore();
  const watchCore = getWatchCore();

  function __enableInsertLocalRewardMsg() {
    if (playbackStore.chatMsgReplayEnabled) {
      return false;
    }

    return true;
  }

  function insertRewardMsgForPayDonate(
    options: DonatePayOptions & {
      /** 是否免费，默认 false */
      isFree?: boolean;
    },
  ): void {
    if (!__enableInsertLocalRewardMsg()) return;

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

  function insertRewardMsgForDonateGoodPoint(good: DonateGoodInfo, count: number): void {
    if (!__enableInsertLocalRewardMsg()) return;

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
