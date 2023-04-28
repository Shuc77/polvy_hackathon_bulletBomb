import { VirtualList } from '@just4/virtual-list';
import { InitialResponse } from '@just4/virtual-list/types';
import { ChatMsgType } from '@polyv/live-watch-sdk';

export type GetVirtualListFn = () => VirtualList<ChatMsgType>;

export interface ChatMsgListHookOptions {
  /** 获取列表容器节点 */
  getContainerElem: () => HTMLDivElement;
  /** 获取虚拟列表实例 */
  getVirtualList: GetVirtualListFn;
}

export interface RequestHistoryCommonResult {
  loadInitialData(): Promise<InitialResponse<ChatMsgType>>;
  loadNextData(ref: unknown): Promise<ChatMsgType[]>;
  loadPreviousData(ref: unknown): Promise<ChatMsgType[]>;
}
