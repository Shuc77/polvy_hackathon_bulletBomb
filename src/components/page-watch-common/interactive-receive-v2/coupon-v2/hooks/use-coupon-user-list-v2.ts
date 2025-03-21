import { computed, ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useCoupon } from './use-coupon';
import type { NormalCouponUserListInstance } from '@polyv/iar-coupon-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { translate } from '@/assets/lang';

export const useCouponUserList = () => {
  const { targetInited, getIarTarget } = useCoupon();

  const couponUserListRef = ref<NormalCouponUserListInstance>();

  /** 优惠券是否显示 */
  const { couponUserListVisible } = storeDefinitionToRefs(useInteractReceiveStore);

  /** 优惠券标题 */
  const couponUserListTitle = computed(() => {
    return translate('interact.coupon.title.user');
  });

  /** 设置优惠券是否显示 */
  const setCouponVisible = (visible = true) => {
    couponUserListVisible.value = visible;

    if (visible) {
      couponUserListRef.value?.refreshList();
    }
  };

  useEventBusListener(appEvents.interaction.OpenCouponUserList, setCouponVisible);

  return {
    couponUserListRef,
    targetInited,
    getIarTarget,
    couponUserListVisible,
    couponUserListTitle,
  };
};
