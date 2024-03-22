/** 页面异常状态类型 */
export enum PageErrorType {
  /** 频道号异常 */
  ChannelIdError = 'ChannelIdError',
  /** 频道号被关闭 */
  ChannelClosed = 'ChannelClosed',
  /** 移动端观看被关闭 */
  MobileChannelClosed = 'MobileChannelClosed',
  /** 外部授权失败 */
  ExternalAuthFail = 'ExternalAuthFail',
  /** 独立授权失败 */
  DirectAuthFail = 'DirectAuthFail',
  /** 企微业务错误 */
  WorkWechatBusinessError = 'WorkWechatBusinessError',
  /** 添加企微好友 */
  WorkWechatFriend = 'WorkWechatFriend',
  /** 未知错误 */
  UnknownError = 'UnknownError',
  /** 校验一客一码(销售邀请) */
  VerifySaleInvite = 'VerifySaleInvite',
  /** 用户系统信息输入 */
  IdentityInfoInput = 'IdentityInfoInput',
}

/**
 * 页面异常数据
 */
export interface PageErrorData {
  /** 异常类型 */
  type: PageErrorType;
  /** 标题 */
  title?: string;
  /** 描述 */
  desc?: string;
  /** 是否展示重新加载的按钮 */
  reloadBtnVisible?: true;
  /** 链接 */
  href?: string;
}
