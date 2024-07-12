import { ref, nextTick, computed } from 'vue';
import { isEmpty } from 'lodash-es';
import { getWatchCore } from '@/core/watch-sdk';
import { appEvents, useEventBusListener, eventBus } from '@/app/app-events';
import { toast } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';

import { usePopupRoute, OrderPopupRoute } from './use-popup-route';
import { useAddress } from './use-address';
import { usePay } from './use-pay';
import type { AddressDetail, OrderInfo } from '../types/order-types';
import type { ProductGoodData } from '../../product/types/product-types';

export function useOrder() {
  const watchCore = getWatchCore();
  const { visible, currentPopupRoute, pushPopupRoute } = usePopupRoute();
  const { address, addressManagementSdk } = useAddress();
  const { pay } = usePay();

  /** 订单管理sdk */
  const orderSdk = watchCore.interactReceive.getOrder();

  /** 提交中 */
  const submitting = ref(false);
  useEventBusListener(appEvents.interaction.OpenOrderPopup, showPopup);

  const areaPickVisible = ref(false);
  /** 商品 */
  const products = ref<ProductGoodData[]>([]);

  /** 地址保存类型 */
  const addressSaveType = ref<'add' | 'edit' | ''>('add');
  /** 地址编辑表单 */
  const addressEditRef = ref();
  /** 地址编辑页进入来源是订单页 */
  let isEditOriginFromOrder = false;

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
   * @description: 显示弹窗
   */
  function showPopup(values: ProductGoodData[]) {
    products.value = values;
    visible.value = true;
  }

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
    if (!address.value.id || info.id === address.value.id) {
      address.value = info;
    }
    navigateToAddressList(info);
    isEditOriginFromOrder = false;
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

    try {
      const res = await watchCore.order.createOrder(payload);

      const showOrderDetail = () => {
        nextTick(() => {
          eventBus.$emit(appEvents.interaction.OpenOrderCenterPopup, res.payId);
        });
      };

      /** 免费商品 */
      if (res.payStatus === 'free') {
        visible.value = false;
        showOrderDetail();
        toast.success(translate('order.paySuccess'));
        return;
      }
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
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      submitting.value = false;
    }
  }

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
  };
}
