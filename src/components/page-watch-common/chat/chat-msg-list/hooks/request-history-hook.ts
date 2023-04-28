/**
 * @file 用于请求历史消息 hook
 */

import { isString } from '@/assets/utils/string';
import { getWatchCore } from '@/core/watch-sdk';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { InitialResponse } from '@just4/virtual-list/types';
import { ChatMsgType } from '@polyv/live-watch-sdk';
import { useContractHistory } from './contract-history-hook';
import { ChatMsgListHookOptions, RequestHistoryCommonResult } from './types';

export const useRequestHistory = (
  hookOptions: ChatMsgListHookOptions,
): RequestHistoryCommonResult => {
  const chatStore = useChatStore();
  const chatMsgStore = useChatMsgStore();
  const { contractHistoryData } = useContractHistory(hookOptions);

  /**
   * 请求聊天室历史消息
   */
  async function requestChatHistory(start = 0, end?: number) {
    const reqStart = start;
    const reqEnd = end ?? start + chatMsgStore.batchCount - 1;
    const watchCore = getWatchCore();

    let data = await watchCore.chat.getChatHistory({
      start: reqStart,
      end: reqEnd,
      getSpecialMessage: chatStore.onlySpecialMsg ? 1 : 0,
    });

    chatMsgStore.historyEnd = data.length < chatMsgStore.batchCount;

    // 存储数据的下标
    data.forEach((chatMsg, index) => {
      const realIndex = start + index;
      chatMsgStore.setRealIndexById(chatMsg.id, realIndex);
    });

    // 反转列表
    data = data.reverse();

    return {
      data,
      realStartIndex: start,
      realEndIndex: start + data.length - 1,
    };
  }

  /**
   * 加载初始数据
   */
  async function loadInitialData(): Promise<InitialResponse<ChatMsgType>> {
    chatMsgStore.resetChatMsgStore();
    const result = await requestChatHistory();
    const data = result.data;
    chatMsgStore.resetHistoryData(data);

    if (data.length) {
      chatMsgStore.setRealStartIndex(result.realStartIndex);
      chatMsgStore.setRealEndIndex(result.realEndIndex);
    }

    return {
      data: data,
      reachedFootBoundary: true,
      reachedHeadBoundary: false,
    };
  }

  /**
   * 加载最新的数据
   */
  async function loadNextData(ref: unknown): Promise<ChatMsgType[]> {
    if (!isString(ref)) {
      throw new Error('loadNextData fail, ref is not string');
    }
    console.log('loadNextData', ref);

    const historyLength = chatMsgStore.getHistoryData().length;
    if (historyLength === 0) {
      return [];
    }

    const id = ref;
    let data: ChatMsgType[] = [];

    // ref 对应的 historyData 下标
    let refIndex = chatMsgStore.findHistoryIndex(id);
    if (refIndex === -1) {
      return [];
    }

    // 从 historyData 中截取数据返回
    let sliceStart = refIndex + 1;
    if (sliceStart > historyLength - 1) {
      sliceStart = historyLength - 1;
    }

    let sliceEnd = refIndex + chatMsgStore.batchCount + 1;
    if (sliceEnd > historyLength - 1) {
      sliceEnd = historyLength - 1;
    }

    let needRequest = false;
    // 此时如果是数组尾部的一批，且 realStartIndex 非 0，则请求接口获取
    if (sliceEnd - sliceStart < chatMsgStore.batchCount && chatMsgStore.getRealStartIndex() !== 0) {
      needRequest = true;
    }

    if (needRequest && chatMsgStore.getRealStartIndex() !== 0) {
      const reqEnd = chatMsgStore.getRealStartIndex() - 1;
      let reqStart = reqEnd - chatMsgStore.batchCount;
      reqStart = reqStart < 0 ? 0 : reqStart;
      const result = await requestChatHistory(reqStart, reqEnd);
      chatMsgStore.concatHistoryData(result.data, 'tail');
      chatMsgStore.setRealStartIndex(result.realStartIndex);
      // 数据新增，refIndex 需要重新获取
      refIndex = chatMsgStore.findHistoryIndex(id);
    }

    sliceStart = refIndex + 1;
    sliceEnd = refIndex + chatMsgStore.batchCount + 1;

    data = chatMsgStore.getHistoryData().slice(sliceStart, sliceEnd);

    setTimeout(() => {
      contractHistoryData();
    }, 50);

    return data;
  }

  /**
   * 加载更旧的数据
   */
  async function loadPreviousData(ref: unknown): Promise<ChatMsgType[]> {
    if (!isString(ref)) {
      throw new Error('loadPreviousData fail, ref is not string');
    }
    console.log('loadPreviousData', ref);

    const batchCount = chatMsgStore.batchCount;
    const id = ref;
    let data: ChatMsgType[] = [];

    // ref 对应的 historyData 下标
    let refIndex = chatMsgStore.findHistoryIndex(id);

    // ref 下标小于页数，需要请求一批历史消息
    if (refIndex < batchCount) {
      const result = await requestChatHistory(chatMsgStore.getRealEndIndex() + 1);
      chatMsgStore.concatHistoryData(result.data, 'header');
      chatMsgStore.setRealEndIndex(result.realEndIndex);
      // 数据新增，refIndex 需要重新获取
      refIndex = chatMsgStore.findHistoryIndex(id);
    }

    // 从 historyData 中截取数据返回
    const sliceStart = refIndex - batchCount < 0 ? 0 : refIndex - batchCount;
    const sliceEnd = refIndex;
    data = chatMsgStore.getHistoryData().slice(sliceStart, sliceEnd);

    setTimeout(() => {
      contractHistoryData();
    }, 50);

    return data;
  }

  return {
    loadInitialData,
    loadNextData,
    loadPreviousData,
  };
};
