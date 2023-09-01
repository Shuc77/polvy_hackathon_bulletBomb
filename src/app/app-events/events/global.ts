export const globalEvents = {
  /**
   * 打开多语言切换
   */
  OpenLanguageSwitch: 'OpenLanguageSwitch',
  /**
   * PC 端侧边菜单栏被切换
   * @param {string} name 菜单栏名
   */
  PcAsideMenuSwitch: 'PcAsideMenuSwitch',
  /**
   * 移动端底部菜单栏切换
   * @param {string} name 菜单栏名
   */
  MobileBottomMenuSwitch: 'MobileBottomMenuSwitch',
  /**
   * 移动端更多弹层打开
   */
  OpenMobileMorePopup: 'OpenMobileMorePopup',
  /**
   * 消息输入框聚焦
   */
  MsgInputFocus: 'MsgInputFocus',
  /**
   * 打开关注弹层
   * @param {boolean} visible 是否显示
   */
  OpenFollowLayer: 'OpenFollowLayer',
  /**
   * 移动端 layout 计算尺寸
   */
  MobileLayoutComputedSize: 'MobileLayoutComputedSize',
  /**
   * 打开手机号实名认证
   */
  OpenRealNameDialog: 'OpenRealNameDialog',
};
