import { ref, nextTick, computed } from 'vue';
import { isEmpty } from 'lodash-es';
import { appEvents } from '@/app/app-events';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePopupRoute, OrderPopupRoute } from './use-popup-route';
import { useAddress } from './use-address';
import { usePay } from './use-pay';
import type { AddressDetail, OrderInfo } from '../types/order-types';
import type { ProductGoodData } from '../../product/types/product-types';
import { isAndroid, isWeixin } from '@/assets/utils/browser';
import { useGlobalInject } from '@/app/use-global-inject';
import { PayProvider } from '@polyv/live-watch-sdk';
import { useAliPay } from '@/hooks/platform/use-ali/use-ali-pay';

export function useOrder() {
  const { getWatchCore, getEmitter } = useGlobalInject();

  const watchCore = getWatchCore();

  const { toast } = useToastManager();

  const { visible, currentPopupRoute, pushPopupRoute } = usePopupRoute();
  const { address, addressManagementSdk } = useAddress();
  const { pay } = usePay();
  const interactReceiveStore = useInteractReceiveStore();
  const { pay: payAli } = useAliPay();
  /** 订单管理sdk */
  const orderSdk = watchCore.interactReceive.getOrder();

  /** 提交中 */
  const submitting = ref(false);

  const areaPickVisible = ref(false);
  /** 商品 */
  const products = ref<ProductGoodData[]>([]);

  /** 地址保存类型 */
  const addressSaveType = ref<'add' | 'edit' | ''>('add');
  /** 地址编辑表单 */
  const addressEditRef = ref();
  /** 地址编辑页进入来源是订单页 */
  let isEditOriginFromOrder = false;
  /** 支持的支付方式 */
  const supportPayProvider = computed(() => {
    return interactReceiveStore.supportPayProvider;
  });
  /** 是否显示支付方式 */
  const showPaymentMethod = computed(() => {
    return interactReceiveStore.showPayMethod;
  });

  /** 是否显示loading */
  const loadingVisible = ref(false);

  /** 选中的支付方式 */
  const selectedPayment = ref<PayProvider>(PayProvider.Wechat);

  /** 是否只使用支付宝 */
  const onlyUseAliPay = computed(() => {
    return (
      !isWeixin &&
      supportPayProvider.value.length === 1 &&
      supportPayProvider.value[0] === PayProvider.Alipay
    );
  });

  /** 弹窗标题 */
  const orderPopupTitle = computed(() => {
    switch (currentPopupRoute.value) {
      case OrderPopupRoute.Order:
        return translate('order.title.confirmOrder');
      case OrderPopupRoute.AddressList:
        return translate('order.title.shippingAddress');
      case OrderPopupRoute.AddressEdit:
        return translate(
          addressSaveType.value === 'add' ? 'order.title.addAddress' : 'order.title.editAddress',
        );
      default:
        return '';
    }
  });

  /**
   * 弹窗高度是否填满除播放器外其余高度
   */
  const isFillBodySection = ref(true);

  /**
   * @description: 跳转到地址列表
   */
  function navigateToAddressList(info: AddressDetail) {
    if (info && !isEmpty(info)) {
      pushPopupRoute(OrderPopupRoute.AddressList);
    } else {
      isEditOriginFromOrder = true;
      pushPopupRoute(OrderPopupRoute.AddressEdit);
    }
  }

  /**
   * @description: 跳转到地址编辑
   */
  function navigateToAddressEdit(info: AddressDetail) {
    pushPopupRoute(OrderPopupRoute.AddressEdit);
    nextTick(() => {
      if (info) {
        addressSaveType.value = 'edit';
        // 设置表单
        addressEditRef.value.setFieldsValue(info);
      } else {
        addressSaveType.value = 'add';
        // 重置表单
        addressEditRef.value.resetFields();
      }
    });
  }

  /**
   * @description: 因为目前没有设置默认地址接口，因此需要回调，如果后续新增默认地址接口后可移除
   */
  function onSelectAddress(info: AddressDetail) {
    address.value = {
      ...info,
    };

    if (isEmpty(info)) return;

    onPopupBack();
  }

  /**
   * @description: 地址编辑-区域点击
   */
  function onAreaSelectorClick() {
    areaPickVisible.value = true;
  }

  /**
   * @description: 地区切换
   */
  function onAreaChange(areaInfo: string[]) {
    addressEditRef.value.setAddressArea(areaInfo.join('/'));
  }

  /**
   * @description: 保存地址回调
   */
  function saveAddressCb(info: AddressDetail) {
    // 编辑地址
    if (info.id === address.value.id) {
      address.value = info;
    }

    // 新建地址
    if (addressSaveType.value === 'add') {
      address.value = info;
      pushPopupRoute(OrderPopupRoute.Order);
      return;
    }

    navigateToAddressList(info);
  }

  /**
   * 点击左上角返回按钮
   */
  function onPopupBack() {
    if (currentPopupRoute.value === OrderPopupRoute.Order) {
      visible.value = false;
    }

    if (currentPopupRoute.value === OrderPopupRoute.AddressList) {
      pushPopupRoute(OrderPopupRoute.Order);
    }

    if (currentPopupRoute.value === OrderPopupRoute.AddressEdit) {
      if (isEditOriginFromOrder) {
        pushPopupRoute(OrderPopupRoute.Order);
      } else {
        pushPopupRoute(OrderPopupRoute.AddressList);
      }
    }

    isEditOriginFromOrder = false;
  }

  /**
   * @description: 下订单
   */
  async function onSubmitOrder(payload: OrderInfo) {
    if (submitting.value) return;
    submitting.value = true;

    loadingVisible.value = true;

    payload.payProvider = selectedPayment.value;

    // 非微信环境如果只支持支付宝，则强制设置为支付宝
    if (onlyUseAliPay.value) {
      payload.payProvider = PayProvider.Alipay;
    }

    try {
      const res = await watchCore.order.createOrder(payload);

      loadingVisible.value = false;

      const showOrderDetail = () => {
        nextTick(() => {
          getEmitter().emit(appEvents.interaction.OpenOrderCenterPopup, res.payId);
        });
      };

      /** 免费商品 */
      if (res.payStatus === 'free') {
        visible.value = false;
        showOrderDetail();
        toast.success(translate('order.paySuccess'));
        return;
      }

      if (res.payProvider === PayProvider.Alipay) {
        payAli(res.codeUrl);

        await new Promise(resolve => setTimeout(resolve, 2000));
        visible.value = false;
        showOrderDetail();
      } else if (res.payProvider === PayProvider.Wechat) {
        pay(
          {
            timestamp: Number(res.timeStamp),
            nonceStr: res.nonceStr,
            package: res.prepayId,
            signType: res.signType,
            paySign: res.paySign,
          },
          {
            successCb: () => {
              visible.value = false;
              showOrderDetail();
            },
            cancelCb: () => {
              visible.value = false;
              showOrderDetail();
            },
          },
        );
      } else {
        toast.error('未知的支付方式');
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      submitting.value = false;
      loadingVisible.value = false;
    }
  }

  function onChangePaymentMethod(payProvider: PayProvider) {
    selectedPayment.value = payProvider;
  }

  /** 兼容商品订单输入框安卓下显示不全问题 */
  let originHeight = document.documentElement.clientHeight || document.body.clientHeight;

  window.addEventListener('resize', function () {
    if (!isAndroid) return;

    const resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
    if (originHeight < resizeHeight) {
      // Android 键盘收起后操作
      isFillBodySection.value = true;
    } else {
      // Android 键盘弹起后操作
      isFillBodySection.value = false;
    }

    originHeight = resizeHeight;
  });

  return {
    submitting,
    visible,
    products,
    addressManagementSdk,
    areaPickVisible,
    orderPopupTitle,
    currentPopupRoute,
    address,
    addressSaveType,
    addressEditRef,
    onPopupBack,
    navigateToAddressList,
    navigateToAddressEdit,
    onSelectAddress,
    onAreaSelectorClick,
    onAreaChange,
    saveAddressCb,
    onSubmitOrder,
    orderSdk,
    isFillBodySection,
    selectedPayment,
    showPaymentMethod,
    onChangePaymentMethod,
    loadingVisible,
    onlyUseAliPay,
  };
}
