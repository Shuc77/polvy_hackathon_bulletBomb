import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { TAB_NAME_PRODUCT } from '@/assets/constants/tab-name';
import { isMobile } from '@/assets/utils/browser';
import { useNewProductDetail } from '@/components/page-watch-common/interactive-receive/product/hooks/use-new-product-detail';
import {
  MessageEffectData,
  MessageEffectType,
} from '@/components/page-watch-common/message-effect/type';
import { useLayoutStore } from '@/store/use-layout-store';
import { ChatMsgEffectType, IarProductType, ProductGoodData } from '@polyv/live-watch-sdk';
import { computed } from 'vue';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export const useEffectMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgEffectType>();

  const { getWatchCore, getEmitter } = useGlobalInject();
  const watchCore = getWatchCore();

  const layoutStore = useLayoutStore();

  const { openProductDetail } = useNewProductDetail();

  /** 商品库 SDK 实例 */
  const productSdk = watchCore.interactReceive.getProduct();

  /** 特效数据 */
  const effectData = computed(() => {
    return chatMsg.value.data as MessageEffectData;
  });

  async function onClickMsg() {
    const { effectType, targetId } = effectData.value;

    // 仅商品点击、商品购买才有点击交互
    if (
      [MessageEffectType.ProductBuy, MessageEffectType.ProductClick].includes(effectType) &&
      targetId
    ) {
      const productDetail = await productSdk.getProductById(targetId as string);
      const productType = productDetail.productType as unknown as IarProductType;

      if (productType === IarProductType.Normal) {
        // 普通商品则打开商品详情
        openProductDetail(productDetail as unknown as ProductGoodData);
        return;
      }

      if (productType === IarProductType.Job) {
        // 职位商品则打开职位详情
        getEmitter().emit(appEvents.interaction.OpenProductJobDetail, productDetail);
        return;
      }

      // 非普通商品则显示商品列表
      if (!isMobile) {
        // PC 端，切换到商品列表的 tab
        layoutStore.$patch({
          pcAsideTabCurrentName: TAB_NAME_PRODUCT,
        });
      } else {
        // 横/竖屏观看页，打开商品库弹层
        getEmitter().emit(appEvents.interaction.OpenPortraitProductList);
      }
    }
  }

  return {
    chatMsg,
    effectData,
    onClickMsg,
  };
};
