/**
 * 按钮类型
 */
export enum ButtonType {
  /** 主题按钮 */
  Primary = 'primary',
  /** 信息按钮 */
  Info = 'info',
  /** 取消按钮 */
  Cancel = 'cancel',
  /** 竖屏按钮 */
  Portrait = 'portrait',
  /** 加重按钮 */
  Aggravate = 'aggravate',
  /** 侧边菜单栏 */
  AsideMenu = 'aside-menu',
}

/**
 * 按钮尺寸
 */
export enum ButtonSize {
  /** 大 - 56px */
  Large = 'large',
  /** 中 - 48px */
  Medium = 'medium',
  /** 默认 - 40px */
  Default = 'default',
  /** 小 - 32px */
  Small = 'small',
  /** 超小 - 28px */
  Mini = 'mini',
  /** 超级小 - 24px */
  XMini = 'x-mini',
}

/**
 * 按钮原生类型
 */
export enum ButtonNativeType {
  Button = 'button',
  Submit = 'submit',
  Reset = 'reset',
}
