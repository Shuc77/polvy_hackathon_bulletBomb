/**
 * @file 竖屏模块事件
 */
export const portraitEvents = {
  /**
   * 打开菜单栏弹层
   * @param {boolean} visible 显示状态，默认：true
   * @param {boolean} useTransition 是否使用动画
   */
  OpenMenuPopup: 'OpenMenuPopup',
  /**
   * 点击了播放器区域
   * @param {MouseEvent} event 事件对象
   */
  ClickPlayerRegion: 'ClickPlayerRegion',
  /**
   * 打开线路切换弹层
   * @param {boolean} visible 显示状态，默认：true
   * @param {boolean} useTransition 是否使用动画，默认：true
   */
  OpenLineSettingPopup: 'OpenLineSettingPopup',
  /**
   * 打开清晰度切换弹层
   * @param {boolean} visible 显示状态，默认：true
   * @param {boolean} useTransition 是否使用动画，默认：true
   */
  OpenQualitySettingPopup: 'OpenQualitySettingPopup',
  /**
   * 打开倍速设置弹层
   * @param {boolean} visible 显示状态，默认：true
   * @param {boolean} useTransition 是否使用动画，默认：true
   */
  OpenRateSettingPopup: 'OpenRateSettingPopup',
  /**
   * 打开回放+章节弹层
   * @param {boolean} visible 显示状态，默认：true
   */
  OpenPlaybackChapter: 'OpenPlaybackChapter',
  /**
   * 打开延迟模式弹层
   * @param {boolean} visible 显示状态，默认：true
   */
  OpenLatencySwitchPopup: 'OpenLatencySwitchPopup',
};
