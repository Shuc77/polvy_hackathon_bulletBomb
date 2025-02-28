/** 微信的回调方法 */
export type WeixinGeneralCallback = (res?: WechatJsSdk.GeneralCallbackResult) => void;

export interface WxCallback {
  /** 成功的回调 */
  successCb?: WeixinGeneralCallback;
  /** 取消的回调 */
  cancelCb?: WeixinGeneralCallback;
}
