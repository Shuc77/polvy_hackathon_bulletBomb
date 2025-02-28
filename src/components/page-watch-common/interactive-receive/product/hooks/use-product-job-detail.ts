import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { ref } from 'vue';
import { ProductGoodData } from '../types/product-types';

export const useProductJobDetailEvent = () => {
  const { getEmitter } = useGlobalInject();

  /** 处理显示职位详情事件 */
  function onJobDetailEvent(jobDetail: ProductGoodData) {
    getEmitter().emit(appEvents.interaction.OpenProductJobDetail, jobDetail);
  }

  return {
    onJobDetailEvent,
  };
};

/**
 * @hook 商品库职位详情
 */
export const useProductJobDetail = () => {
  /** 弹层显示状态 */
  const visible = ref(false);

  /** 职位数据 */
  const jobDetail = ref<ProductGoodData>();

  function onOpenJobDetail(detail: ProductGoodData) {
    jobDetail.value = detail;
    visible.value = true;
  }

  useEventBusListener(appEvents.interaction.OpenProductJobDetail, onOpenJobDetail);

  return {
    visible,
    jobDetail,
  };
};
