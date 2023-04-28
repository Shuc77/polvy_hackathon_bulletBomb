import { appEvents, eventBus, useEventBusListener } from '@/app/app-events';
import { ref } from 'vue';
import { ProductGoodData } from '../types/product-types';

/** 处理显示职位详情事件 */
export function onJobDetailEvent(jobDetail: ProductGoodData) {
  eventBus.$emit(appEvents.interaction.OpenProductJobDetail, jobDetail);
}

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
