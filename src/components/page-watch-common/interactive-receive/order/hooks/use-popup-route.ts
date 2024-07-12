import { ref } from 'vue';

export const enum OrderPopupRoute {
  /** 订单 */
  Order = 'order',
  /** 地址列表 */
  AddressList = 'addressList',
  /** 地址设置 */
  AddressEdit = 'addressEdit',
}

/** 弹窗路由管理 */
export function usePopupRoute() {
  /** 弹窗显隐 */
  const visible = ref(false);
  const routeHistory = ref<OrderPopupRoute[]>([]);
  /** 当前路由 */
  const currentPopupRoute = ref<OrderPopupRoute>(OrderPopupRoute.Order);

  /**
   * @description: 返回
   */
  function popPopupRoute() {
    const prevRoute = routeHistory.value.pop();
    if (prevRoute) {
      currentPopupRoute.value = prevRoute;
    } else {
      visible.value = false;
    }
  }

  /**
   * @description: 设置下一个路由
   */
  function pushPopupRoute(nextRoute: OrderPopupRoute) {
    routeHistory.value.push(currentPopupRoute.value);
    currentPopupRoute.value = nextRoute;
  }

  /**
   * @description: 重置路由
   */
  function resetPopupRoute() {
    routeHistory.value = [];
    currentPopupRoute.value = OrderPopupRoute.Order;
  }

  return {
    visible,
    currentPopupRoute,
    popPopupRoute,
    pushPopupRoute,
    resetPopupRoute,
  };
}
