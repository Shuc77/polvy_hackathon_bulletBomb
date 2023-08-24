/**
 * @file 播放器模块事件
 */
export const playerEvents = {
  /**
   * 重新创建播放器
   */
  ResetUpPlayer: 'ResetUpPlayer',
  /**
   * 点击了移动端播放器容器
   */
  ClickMobilePlayerContainer: 'ClickMobilePlayerContainer',
  /**
   * 显示历史播放提示
   * @param {number} duration 播放进度
   */
  ShowHistoryTips: 'ShowHistoryTips',
  /**
   * 试看播放开始
   */
  TrialPlayEnd: 'TrialPlayEnd',
  /**
   * 试看播放结束
   */
  TrialPlayStart: 'TrialPlayStart',
  /**
   * 实时字幕
   */
  SubtitleRealTimeCC: 'SubtitleRealTimeCC',
};
