import { onMounted, ref } from 'vue';
import { IarProductListInstance, ProductGoodData } from '../types/product-types';
import { useProductTrack } from './use-product';
import { isMobile, isWeixin } from '@/assets/utils/browser';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * @hook 商品列表
 * */
export const useProductList = (opts?: { autoInit: boolean }) => {
  const { getWatchCore, getEmitter } = useGlobalInject();

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
    getEmitter().emit(appEvents.interaction.OpenOrderCenterPopup);
  };

  /** 打开商品讲解回放页 */
  const openProductExplain = (good: ProductGoodData) => {
    const url = watchCore.utils.generateProductExplainPageUrl({
      productId: good.productId,
    });
    if (url) {
      window.open(url, '_blank');
    }
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
    openProductExplain,
  };
};
