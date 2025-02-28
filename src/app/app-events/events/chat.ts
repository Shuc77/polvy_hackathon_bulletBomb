/**
 * @file 组件通信-聊天室消息控制事件
 */

export const chatEvents = {
  /** 重建聊天列表 */
  ResetUpChatMsgList: 'ResetUpChatMsgList',
  /**
   * 滚动到最新的消息
   */
  ScrollToNew: 'ScrollToNew',
  /**
   * 发送消息到聊天室
   * @param {string} content 消息文本
   */
  SendMessageToChat: 'SendMessageToChat',
  /**
   * 打开设置昵称
   * @param {boolean} visible 显示状态
   */
  OpenSetNick: 'OpenSetNick',
  /**
   * 将聊天室输入框聚焦
   */
  FocusToChatInput: 'FocusToChatInput',
  /**
   * 显示完整消息
   * @param {string} content 完整的消息内容
   */
  ShowFullMessage: 'ShowFullMessage',
  /**
   * 触发发送图片
   */
  ToSendImage: 'ToSendImage',
  /**
   * 显示移动端固定输入框
   */
  ShowMobileFixedChatInput: 'ShowMobileFixedChatInput',
  /**
   * 替换聊天消息
   */
  ReplaceChatMessage: 'ReplaceChatMessage',
  /**
   * 插入到聊天消息队列
   */
  JoinMsgQueue: 'JoinMsgQueue',
};
