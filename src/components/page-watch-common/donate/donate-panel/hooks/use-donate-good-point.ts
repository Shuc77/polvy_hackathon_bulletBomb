/**
 * @file 礼物打赏（积分）hook
 */
import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';
import { getWatchCore } from '@/core/watch-sdk';
import { DonateGoodInfo, useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { onMounted, ref, unref } from 'vue';

/** 礼物打赏（积分）hook */
export const useDonateGoodPoint = () => {
  const { donatePointEnabled } = storeDefinitionToRefs(useDonateStore);

  /** 当前用户剩余的积分总数 */
  const surplusPoint = ref(0);
  /** 获取当前用户剩余的积分 */
  async function getSurplusPoint() {
    const watchCore = getWatchCore();
    try {
      const points = await watchCore.donate.getDonateSurplusPoint();
      surplusPoint.value = points;
    } catch (e) {
      toast.error(translate('donate.point.getFail'));
    }
  }

  /** 处理打赏积分礼物 */
  async function donatePointGood(good: DonateGoodInfo, count: number): Promise<void> {
    const watchCore = getWatchCore();
    try {
      const points = await watchCore.donate.payDonatePoint({
        goodId: good.goodId,
        goodCount: count,
      });
      surplusPoint.value = points;
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || translate('donate.error.unknown'));
    }
  }

  onMounted(() => {
    if (unref(donatePointEnabled)) {
      getSurplusPoint();
    }
  });

  return {
    /** 当前剩余积分 */
    surplusPoint,
    /** 进行积分礼物打赏 */
    donatePointGood,
  };
};
