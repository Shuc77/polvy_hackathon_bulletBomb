/**
 * 商品数据
 */
import { IarProductType } from '@polyv/live-watch-sdk';

export enum ProductGoodExtVideoSource {
  Material = 'MATERIAL_LIBRARY',
}
export interface ProductGoodData {
  /** 商品名称 */
  name: string;
  /** 商品 id */
  productId: string;
  /** 商品原价 */
  realPrice: string;
  /** 商品价格 */
  price: string;
  /** 商品类型 */
  productType: IarProductType;
  /** 自定义价格 */
  customPrice: string;
  /** 价格类型 */
  priceType: string;
  /** 商品提示 */
  productDesc: string;
  /** 推送Id */
  logId?: string;
  /** 购买方式 */
  buyType?: string;
  /** 履约方式 */
  deliveryType?: string;
  /** 推送规则 */
  productPushRule?: string;
  /** 特色标签 */
  features?: string[];
  /** 商品详情 */
  productDetail?: string;
  /** 封面图 */
  cover: string;
  /** 封面图列表 */
  coverList: string[];
  /** 是否开价 */
  openPriceEnable?: string;
  /** 原价类型 */
  originalPriceType?: string;
  /** 自定义原价 */
  customOriginalPrice?: string;

  /** 扩展信息 */
  ext?: string;

  materialId?: string;
}

export interface NormalProductGoodData
  extends Omit<ProductGoodData, 'productId' | 'realPrice' | 'features'> {
  /** 商品 id */
  productId: number;
  /** 商品原价 */
  realPrice: number;
  /** 特色标签 */
  features: string | string[];
  /** 客户联系二维码 */
  customerServiceContact?: string;
  /** 客服方式 */
  customerServiceType?: string;
}

/**
 * 互动接收端商品列表实例类型
 */
export interface IarProductListInstance {
  /** 重置列表 */
  init?: () => unknown;
}

/**
 * 互动接收端商品详情UI数据
 */
export interface IarProductDetailInfo {
  name: string;
  price: string;
  originalPrice: string;
  productTags: string[];
  productDesc: string;
  productDetail: string;
}

export interface IarProductDetailCoverConfig {
  imgs: string[];
  videoSrc?: string;
  materialId?: string;
  videoType?: string;
  type?: string;
  customText?: string;
}
