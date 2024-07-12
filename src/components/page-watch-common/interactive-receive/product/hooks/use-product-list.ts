import { onMounted, ref } from 'vue';
import { IarProductListInstance } from '../types/product-types';
import { useProductTrack } from './use-product';
import { isMobile, isWeixin } from '@/assets/utils/browser';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

/**
 * @hook 商品列表
 * */
export const useProductList = (opts?: { autoInit: boolean }) => {
  const watchCore = getWatchCore();

  const { autoInit = true } = opts || {};

  const { trackOpenProductList } = useProductTrack();

  /** 互动功能商品列表组件实例 */
  const iarProductListRef = ref<IarProductListInstance>();

  /** 商品总数 */
  const goodTotal = ref(0);

  /** 是否支持使用商品支付&订单 */
  const orderEnabled = watchCore.order.getOrderEnabled();

  /** 是否显示订单中心 */
  const isShowOrderCenter = isMobile && isWeixin && orderEnabled;

  /** 初始化商品列表，并上报打开数据 */
  const initProductList = async () => {
    trackOpenProductList();
  };

  /** 处理商品总数更改事件 */
  const onGoodTotalChange = (total = 0) => {
    goodTotal.value = total;
  };

  /** 进入订单中心 */
  const onEnterOrderCenter = () => {
    eventBus.$emit(appEvents.interaction.OpenOrderCenterPopup);
  };

  onMounted(() => {
    if (autoInit) {
      initProductList();
    }
  });

  return {
    iarProductListRef,
    goodTotal,
    onGoodTotalChange,
    initProductList,
    isShowOrderCenter,
    onEnterOrderCenter,
  };
};
