/**
 * 商品详情hooks
 */
import { ProductGoodData } from '../types/product-types';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { IarProductType } from '@polyv/live-watch-sdk';
import { computed } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';
import { useLangStore } from '@/store/use-lang-store';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';

export const useNewProductDetail = () => {
  const { currentLang } = storeDefinitionToRefs(useLangStore);
  const watchCore = getWatchCore();
  const { currentProduct, productDetailVisible } = storeDefinitionToRefs(useInteractReceiveStore);

  const { toPlay, toPause } = usePlayerAction();

  const openProductDetail = async (good: ProductGoodData) => {
    if (good.productType === IarProductType.Normal) {
      const parseGood = await watchCore.interactReceive.parseProductDetail(good);

      currentProduct.value = parseGood;
      productDetailVisible.value = true;
    }
  };

  /**
   * 组装ira-product-detail 组件需要的数据
   */
  const productDetailInfo = computed(() => {
    return {
      name: currentProduct.value?.name,
      price: currentProduct.value?.realPrice,
      originalPrice: currentProduct.value?.price,
      productDesc: currentProduct.value?.productDesc,
      productDetail: currentProduct.value?.productDetail || '',
      tags: currentProduct.value?.features || [],
    };
  });

  /**
   * 组装ira-product-detail 组件需要的数据
   */
  const productDetailCoverConfig = computed(() => {
    return {
      imgs: Array.isArray(currentProduct.value?.coverList)
        ? currentProduct.value?.coverList
        : [currentProduct.value?.cover],
      materialId: currentProduct.value?.materialId,
      videoType: 'material',
      showVideo: !!currentProduct.value?.materialId,
    };
  });

  const handleProductDetailVideoPlay = () => {
    // 详情视频播放时暂停直播或回放
    toPause();
  };

  const handleProductDetailVideoPause = () => {
    // 详情视频暂停时恢复直播或回放
    toPlay();
  };

  const closeProductDetail = () => {
    productDetailVisible.value = false;
  };

  return {
    openProductDetail,
    currentProduct,
    productDetailVisible,

    productDetailInfo,
    productDetailCoverConfig,
    closeProductDetail,

    handleProductDetailVideoPlay,
    handleProductDetailVideoPause,
    currentLang,
  };
};
