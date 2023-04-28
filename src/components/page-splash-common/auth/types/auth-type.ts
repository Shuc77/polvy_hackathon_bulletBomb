import { AuthSettingItem } from '@polyv/live-watch-sdk';

export interface AuthButtonInject<ItemType extends AuthSettingItem = AuthSettingItem> {
  /** 观看条件数据 */
  authItem: ItemType;
  /** 监听点击事件 */
  listenClickAuthButton: (callback: AnyFunc) => void;
  /** 取消监听点击事件 */
  unlistenClickAuthButton: (callback: AnyFunc) => void;
}
