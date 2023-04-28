/**
 * @file 聊天室消息渲染 hook
 */
import Vue, { ComponentOptions } from 'vue';
import { ChatMsgItemPropsType } from '../msg-items/use-chat-msg-item';
import { ChatMsgType } from '@polyv/live-watch-sdk';
import { RenderPosition } from '@just4/virtual-list/types';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { translate } from '@/assets/lang';
import { ChatMsgListHookOptions } from './types';
import { isUndefined } from '@/assets/utils/types';
import { pinia } from '@/plugins/pinia';
import { useChannelStore } from '@/store/use-channel-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

export type ChatMsgItemComponentOptions = ComponentOptions<Vue>;

export const useMsgRender = (
  ChatMsgItemComponent: ChatMsgItemComponentOptions,
  hookOptions: ChatMsgListHookOptions,
) => {
  const watchAppStore = useWatchAppStore();
  const chatMsgStore = useChatMsgStore();
  const channelStore = useChannelStore();

  /**
   * 渲染消息列表
   * @param data 消息列表
   */
  function renderItems(data: ChatMsgType[]): HTMLElement[] {
    const domList: HTMLElement[] = [];

    data.forEach((chatMsg, index) => {
      let prevChatMsg: ChatMsgType | undefined = data[index - 1];
      let nextChatMsg: ChatMsgType | undefined = data[index + 1];

      const historyData = chatMsgStore.getHistoryData();
      let historyIndex = -1;
      if (isUndefined(prevChatMsg) || isUndefined(nextChatMsg)) {
        historyIndex = chatMsgStore.findHistoryIndex(chatMsg.id);
      }
      if (historyIndex !== -1 && isUndefined(prevChatMsg)) {
        prevChatMsg = historyData[historyIndex - 1];
      }
      if (historyIndex !== -1 && isUndefined(nextChatMsg)) {
        nextChatMsg = historyData[historyIndex + 1];
      }

      const propsData: ChatMsgItemPropsType = {
        containerElem: hookOptions.getContainerElem(),
        getVirtualList: hookOptions.getVirtualList,
        chatMsg,
        prevChatMsg,
        nextChatMsg,
      };

      const instance = new Vue({
        render(h) {
          return h(ChatMsgItemComponent, {
            props: propsData,
          });
        },
        pinia,
      });

      instance.$mount();

      const domElem = instance.$el as HTMLElement;
      domElem.__vueVm = instance;
      domList.push(domElem);
    });

    return domList;
  }

  /**
   * 渲染边界节点
   * @param position 位置
   */
  function renderBoundary(position: RenderPosition) {
    console.log('>>>renderBoundary:', position);
    const virtualList = hookOptions.getVirtualList();

    // 渲染没有更多
    if (
      !channelStore.isPortraitWatchLayout &&
      position === RenderPosition.Head &&
      chatMsgStore.historyEnd &&
      virtualList.items.length >= chatMsgStore.batchCount
    ) {
      const instance = new Vue({
        render(h) {
          return h(
            'div',
            {
              class: 'c-chat-msg-list__tips pws-chat-msg-list-tips',
            },
            `${translate('chat.norMore')}`,
          );
        },
      });
      instance.$mount();
      return instance.$el as HTMLDivElement;
    }
  }

  /**
   * 渲染空数据提示。
   */
  function renderEmpty() {
    if (!channelStore.isPortraitWatchLayout && watchAppStore.isWatchBackUrl) {
      const instance = new Vue({
        render(h) {
          return h(
            'div',
            {
              class: 'c-chat-msg-list__tips pws-chat-msg-list-tips',
            },
            `${translate('chat.empty')}`,
          );
        },
      });
      instance.$mount();
      return instance.$el as HTMLDivElement;
    }
  }

  /**
   * 渲染数据加载中
   */
  function renderLoading() {
    const div = document.createElement('div');
    div.className = 'c-chat-msg-list__loading';
    return div;
  }

  /**
   * 渲染数据加载失败
   */
  function renderError() {
    const instance = new Vue({
      render(h) {
        return h(
          'div',
          {
            class: 'c-chat-msg-list__tips pws-chat-msg-list-tips',
          },
          `${translate('chat.loadError')}`,
        );
      },
    });
    instance.$mount();
    return instance.$el as HTMLDivElement;
  }

  return {
    renderItems,
    renderBoundary,
    renderLoading,
    renderError,
    renderEmpty,
  };
};
