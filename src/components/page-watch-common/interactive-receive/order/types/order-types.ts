/** 地址详情 */
export interface AddressDetail {
  id: string | number;
  name: string;
  mobile: string;
  area: string;
  address: string;
}

/** 订单信息 */
export interface OrderInfo {
  products: Array<{
    productId: number;
    quantity: number;
  }>;
  address: {
    address?: string;
    area?: string;
    mobile: string;
    name?: string;
  };
}

export interface OrderListInstance {
  /**
   * 重新初始化
   * @param forceActiveIndex tab选项下标，例如全部为0
   */
  init(forceActiveIndex?: number): void;
  /**
   * 更新某个订单状态信息
   * @param orderNo 订单号
   */
  updateSomeOrderlDetail(orderNo: string): void;
}
