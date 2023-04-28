import { ref } from 'vue';
import { ProductGoodData } from '../types/product-types';

/**
 * @hook 商品详情
 * */
export const useProductDetail = () => {
  /** 正在显示的商品详情 */
  const goodDetail = ref<ProductGoodData>();
  /** 商品详情弹层是否可见 */
  const goodDetailVisible = ref(false);

  /** 打开商品详情 */
  const openGoodDetail = (good: ProductGoodData) => {
    goodDetail.value = good;
    goodDetailVisible.value = true;
  };

  /** 关闭商品详情 */
  const closeGoodDetail = () => {
    goodDetailVisible.value = false;
  };

  return {
    goodDetail,
    goodDetailVisible,
    openGoodDetail,
    closeGoodDetail,
  };
};
