/**
 * 商品数据
 */
export interface ProductGoodData {
  /** 商品名称 */
  name: string;
  /** 商品 id */
  productId: string;
  /** 商品原价 */
  realPrice: number;
  /** 商品价格 */
  price: number;
  /** 商品类型 */
  productType: string;
  /** 商品提示 */
  productDesc: string;
  /** 推送Id */
  logId?: string;
}

/**
 * 互动接收端商品列表实例类型
 */
export interface IarProductListInstance {
  /** 重置列表 */
  init?: () => unknown;
}
