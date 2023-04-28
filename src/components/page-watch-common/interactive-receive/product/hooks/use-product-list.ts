import { nextTick, onMounted, ref, unref } from 'vue';
import { IarProductListInstance } from '../types/product-types';
import { useProductTrack } from './use-product';

/**
 * @hook 商品列表
 * */
export const useProductList = () => {
  const { trackOpenProductList } = useProductTrack();

  /** 互动功能商品列表组件实例 */
  const iarProductListRef = ref<IarProductListInstance>();
  /** 是否渲染商品列表，仅在打开 tab 或弹层时请求数据 */
  const renderProductList = ref(false);
  /** 商品总数 */
  const goodTotal = ref(0);

  /** 初始化商品列表，并上报打开数据 */
  const initProductList = async () => {
    trackOpenProductList();

    if (!renderProductList.value) {
      renderProductList.value = true;
      return;
    }

    await nextTick();

    const listInstance = unref(iarProductListRef);
    if (!listInstance) {
      console.warn('initProductList error, iarProductListRef is undefined');
      return;
    }

    // 调用组件的初始化方法，重置到首页
    if (listInstance.init) {
      listInstance.init();
    }
  };

  /** 处理商品总数更改事件 */
  const onGoodTotalChange = (total = 0) => {
    goodTotal.value = total;
  };

  onMounted(() => {
    initProductList();
  });

  return {
    iarProductListRef,
    renderProductList,
    goodTotal,
    onGoodTotalChange,
    initProductList,
  };
};
