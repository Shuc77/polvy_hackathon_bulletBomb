import { ChatUserTypes } from '@polyv/live-watch-sdk';

/**
 * 特殊用户身份类型列表
 */
export const specialUserTypes = [
  ChatUserTypes.Teacher,
  ChatUserTypes.Manager,
  ChatUserTypes.Guest,
  ChatUserTypes.Assistant,
  ChatUserTypes.Attendee,
  ChatUserTypes.Dummy,
];

/**
 * 判断是否为特殊的用户类型
 * @param userType 用户类型
 */
export function isSpecialUserType(userType: ChatUserTypes): boolean {
  return specialUserTypes.includes(userType);
}
