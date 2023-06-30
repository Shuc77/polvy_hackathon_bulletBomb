import { ref } from 'vue';
import { isString } from '@/assets/utils/string';
import { getWatchCore } from '@/core/watch-sdk';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { InitialResponse } from '@just4/virtual-list/types';
import { ChatMsgType } from '@polyv/live-watch-sdk';
import { RequestHistoryCommonResult } from './types';

/**
 * @hook 请求场次历史消息
 */
export const useRequestHistorySession = (): RequestHistoryCommonResult => {
  const playbackStore = usePlaybackStore();
  const chatMsgStore = useChatMsgStore();

  /** 当前页码，默认为 1 */
  const curPageNumber = ref(1);

  /**
   * 请求聊天室历史消息
   */
  async function requestChatHistory(pageNumber: number, start = 0) {
    const watchCore = getWatchCore();

    try {
      let {
        pageNumber: curPage,
        totalPages,
        contents,
      } = await watchCore.chat.getChatHistoryBySessionId({
        sessionId: playbackStore.getPlaybackSessionId(),
        pageNumber,
        pageSize: chatMsgStore.batchCount,
      });

      curPageNumber.value = curPage;
      chatMsgStore.historyEnd =
        totalPages === 0 || curPage === totalPages || contents.length < chatMsgStore.batchCount;

      // 存储数据的下标
      contents.forEach((chatMsg, index) => {
        const realIndex = start + index;
        chatMsgStore.setRealIndexById(chatMsg.id, realIndex);
      });

      // 反转列表
      contents = contents.reverse();

      return {
        data: contents,
        realStartIndex: start,
        realEndIndex: start + contents.length - 1,
      };
    } catch (error) {
      console.error('error', error);
      return {
        data: [],
        realStartIndex: start,
        realEndIndex: start + 0 - 1,
      };
    }
  }

  /**
   * 加载初始数据
   */
  async function loadInitialData(): Promise<InitialResponse<ChatMsgType>> {
    chatMsgStore.resetChatMsgStore();
    curPageNumber.value = 1;

    const result = await requestChatHistory(curPageNumber.value, 0);
    const data = result.data;
    chatMsgStore.resetHistoryData(data);

    if (data.length) {
      chatMsgStore.setRealStartIndex(result.realStartIndex);
      chatMsgStore.setRealEndIndex(result.realEndIndex);
    }

    return {
      data,
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

    const historyLength = chatMsgStore.getHistoryData().length;
    if (historyLength === 0) {
      return [];
    }

    const id = ref;
    let data: ChatMsgType[] = [];

    // ref 对应的 historyData 下标
    const refIndex = chatMsgStore.findHistoryIndex(id);
    if (refIndex === -1) {
      return [];
    }

    // 从 historyData 中截取数据返回
    const sliceStart = refIndex + 1;
    const sliceEnd = refIndex + chatMsgStore.batchCount + 1;
    data = chatMsgStore.getHistoryData().slice(sliceStart, sliceEnd);

    return data;
  }

  /**
   * 加载更旧的数据
   */
  async function loadPreviousData(ref: unknown): Promise<ChatMsgType[]> {
    if (!isString(ref)) {
      throw new Error('loadPreviousData fail, ref is not string');
    }

    const batchCount = chatMsgStore.batchCount;
    const id = ref;
    let data: ChatMsgType[] = [];

    // ref 对应的 historyData 下标
    let refIndex = chatMsgStore.findHistoryIndex(id);

    // ref 下标小于页数，需要请求一批历史消息
    if (refIndex < batchCount) {
      const result = await requestChatHistory(
        curPageNumber.value + 1,
        chatMsgStore.getRealEndIndex() + 1,
      );
      chatMsgStore.concatHistoryData(result.data, 'header');
      chatMsgStore.setRealEndIndex(result.realEndIndex);
      // 数据新增，refIndex 需要重新获取
      refIndex = chatMsgStore.findHistoryIndex(id);
    }

    // 从 historyData 中截取数据返回
    const sliceStart = refIndex - batchCount < 0 ? 0 : refIndex - batchCount;
    const sliceEnd = refIndex;
    data = chatMsgStore.getHistoryData().slice(sliceStart, sliceEnd);

    return data;
  }

  return {
    loadInitialData,
    loadNextData,
    loadPreviousData,
  };
};
