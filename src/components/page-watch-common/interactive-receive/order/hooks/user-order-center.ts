/**
 * @file 订单中心
 */

import { ref, computed, watch } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { MobileMessageBox, MessageBoxInstance } from '@/components/common-base/message-box';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { usePay } from './use-pay';
import { OrderListInstance } from '../types/order-types';
import { CreateOrderResponse } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';

export function useOrderCenter() {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { toast } = useToastManager();

  /** 订单管理sdk */
  const orderSdk = watchCore.interactReceive.getOrder();
  /** 订单中心是否显示 */
  const visible = ref(false);
  /** 当前查看详情的订单号 */
  const currentDetailOrderNo = ref('');
  /** 当前是否展开详情页面 */
  const isShowDetail = ref(false);
  /** 是否支付成功后打开详情页，需要增加首次请求detail接口携带 syncPayStatus:Y 参数 */
  const openDetailFromPaySuccess = ref(false);

  /** 监听展示订单中心事件 */
  useEventBusListener(appEvents.interaction.OpenOrderCenterPopup, (orderNo?: string) => {
    visible.value = true;
    if (orderNo) {
      currentDetailOrderNo.value = orderNo;
      isShowDetail.value = true;
      openDetailFromPaySuccess.value = true;
    }
  });

  /** 订单列表实例 */
  const orderListRef = ref<OrderListInstance>();

  /** 取消预约提示弹层实例 */
  const receiptTipsRef = ref<MessageBoxInstance>();

  /**
   * 确认收货二次确认弹窗
   */
  const onConfirmReceipt = async () => {
    const res = await receiptTipsRef.value?.$confirm();
    if (res) {
      return true;
    }
    return false;
  };

  /** 微信支付相关 */
  const { pay } = usePay();

  const waitWeixinPay = (res: CreateOrderResponse) => {
    return new Promise(resolve => {
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
            // 支付成功
            toast.success(translate('order.paySuccess'));
            resolve('order pay success');
          },
        },
      );
    });
  };

  /**
   * 订单重新发起支付
   */
  const onConfirmPay = async (orderNo: string) => {
    try {
      const res = await watchCore.order.orderPay(orderNo);
      /** 免费商品 */
      if (res.payStatus === 'free') {
        toast.success(translate('order.paySuccess'));
        return true;
      }
      await waitWeixinPay(res);
      return true;
    } catch (error) {
      toast.error((error as Error).message);
      return false;
    }
  };

  /** 打开订单详情 */
  const handleReachDetail = (orderNo: string): void => {
    isShowDetail.value = true;
    openDetailFromPaySuccess.value = false;
    currentDetailOrderNo.value = orderNo;
  };

  /** 弹窗标题 */
  const popupTitle = computed(() => {
    return isShowDetail.value ? '' : translate('order.center');
  });

  /** 返回按钮操作 */
  const onPopupBack = () => {
    if (isShowDetail.value) {
      isShowDetail.value = false;
      return;
    }
    visible.value = false;
  };

  /** 二次确认收货弹窗 */
  const onConfirmReceiptSuccess = (orderNo: string) => {
    toast.success(translate('order.receiptSuccess'));
    orderListRef.value?.updateSomeOrderlDetail(orderNo);
  };

  /** 同步更新列表订单状态 */
  const onPaySuccess = (orderNo: string) => {
    orderListRef.value?.updateSomeOrderlDetail(orderNo);
  };

  watch(
    () => visible.value,
    () => {
      if (visible.value) {
        orderListRef.value?.init(0);
      }
    },
  );

  return {
    visible,
    onConfirmReceipt,
    onConfirmPay,
    MobileMessageBox,
    receiptTipsRef,
    isShowDetail,
    currentDetailOrderNo,
    handleReachDetail,
    popupTitle,
    onPopupBack,
    onConfirmReceiptSuccess,
    orderListRef,
    onPaySuccess,
    openDetailFromPaySuccess,
    orderSdk,
  };
}
