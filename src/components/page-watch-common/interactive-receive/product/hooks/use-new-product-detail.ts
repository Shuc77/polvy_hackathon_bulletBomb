/**
 * 商品详情hooks
 */
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLangStore } from '@/store/use-lang-store';
import { IarProductType } from '@polyv/live-watch-sdk';
import { computed } from 'vue';
import { ProductGoodData } from '../types/product-types';

export const useNewProductDetail = () => {
  const { currentLang } = storeDefinitionToRefs(useLangStore);
  const { currentProduct, productDetailVisible } = storeDefinitionToRefs(useInteractReceiveStore);

  const { getWatchCore, getEmitter } = useGlobalInject();
  const { toPlay, toPause } = usePlayerAction();

  const watchCore = getWatchCore();
  /** 商品库 SDK 实例 */
  const productSdk = watchCore.interactReceive.getProduct();

  const openProductDetail = async (good: ProductGoodData) => {
    if (good.productType === IarProductType.Normal) {
      const parseGood = await watchCore.interactReceive.parseProductDetail(good);

      currentProduct.value = parseGood;
      productDetailVisible.value = true;

      getEmitter().emit(appEvents.interaction.OpenProductDetail);
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
      customPrice: currentProduct.value?.customPrice || '',
      priceType: currentProduct.value?.priceType || '',
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
    productSdk,
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
