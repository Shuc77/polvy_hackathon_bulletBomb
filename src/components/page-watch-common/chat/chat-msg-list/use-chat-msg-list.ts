import { appEvents, eventBus, useEventBusListener } from '@/app/app-events';
import { TAB_NAME_CHAT } from '@/assets/constants/tab-name';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { VirtualList } from '@just4/virtual-list';
import { ItemsRemoveEvent, VirtualListEvent } from '@just4/virtual-list/events';
import { ChatEvents, ChatMsgType, LiveStatus } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import { useChatMsgHandle } from './hooks/chat-msg-handle-hook';
import { useHideChatMsgHook } from './hooks/hide-chat-msg-hook';
import { useChatMsgQueue } from './hooks/msg-queue-hook';
import { ChatMsgItemComponentOptions, useMsgRender } from './hooks/msg-render-hook';

import { useRequestHistory } from './hooks/request-history-hook';
import { useRequestHistorySession } from './hooks/request-history-session-hook';
import { useRequestHistoryReplayHook } from './hooks/request-history-replay-hook';

import { ChatMsgListHookOptions, VirtualListInstance } from './hooks/types';
import { RenderPosition } from '@just4/virtual-list/types';
import { isMobile } from '@/assets/utils/browser';
import { usePlaybackStore } from '@/store/use-playback-store';
import { getWatchCore } from '@/core/watch-sdk';
import { loadLocalForage } from '@/plugins/external-lib-loaders/load-localforage';
import { useChannelStore } from '@/store/use-channel-store';

/** 监听聊天 Tab 切换 */
const useChatTabSwitchWatch = (options: { cb: () => void }) => {
  const layoutStore = useLayoutStore();

  // 切到聊天室 Tab 时自动滚到最底部
  // 首次打开聊天室时 oldVal 为空，此时不触发，因为会跟虚拟列表初始化冲突，会导致首屏消息重复
  if (isMobile) {
    watch(
      () => layoutStore.mobileMenuCurrentName,
      (newVal, oldVal) => {
        if (oldVal && layoutStore.mobileMenuCurrentName === TAB_NAME_CHAT) {
          options.cb();
        }
      },
    );
  } else {
    watch(
      () => layoutStore.pcAsideTabCurrentName,
      (newVal, oldVal) => {
        if (oldVal && layoutStore.pcAsideTabCurrentName === TAB_NAME_CHAT) {
          options.cb();
        }
      },
    );
  }
};

/**
 * 聊天室消息列表 hook
 */
export const useChatMsgList = (options: { ChatMsgItemComponent: ChatMsgItemComponentOptions }) => {
  const watchCore = getWatchCore();
  const watchAppStore = useWatchAppStore();
  const chatStore = useChatStore();
  const channelStore = useChannelStore();
  const chatMsgStore = useChatMsgStore();
  const playbackStore = usePlaybackStore();

  const { ChatMsgItemComponent } = options;

  const hookOptions: ChatMsgListHookOptions = {
    getContainerElem,
    getVirtualList,
  };

  // 聊天消息渲染
  const { renderItems, renderBoundary, renderLoading, renderError, renderEmpty } = useMsgRender(
    ChatMsgItemComponent,
    hookOptions,
  );

  // 获取聊天历史数据对应的 Hook
  function requestHistoryHook(hookOptions: ChatMsgListHookOptions) {
    if (watchAppStore.isPlaybackWatchUrl) {
      return useRequestHistorySession();
    }

    if (playbackStore.chatReplayEnabled) {
      return useRequestHistoryReplayHook(hookOptions);
    }

    return useRequestHistory(hookOptions);
  }

  // 聊天消息队列
  useChatMsgQueue(hookOptions);
  // 聊天消息处理
  useChatMsgHandle(hookOptions);
  // 隐藏聊天消息
  useHideChatMsgHook();

  /** 聊天消息容器节点 */
  const containerRef = ref<HTMLDivElement>();

  /**
   * 获取消息容器节点
   */
  function getContainerElem() {
    return unref(containerRef) as HTMLDivElement;
  }

  /** ---------- 虚拟列表 start ---------- */

  let virtualList: VirtualListInstance | undefined;

  /**
   * 获取虚拟列表实例
   */
  function getVirtualList(): VirtualListInstance {
    if (!virtualList) {
      throw new Error('getVirtualList error');
    }
    return virtualList;
  }

  /**
   * 初始化虚拟列表
   */
  async function initVirtualList() {
    destroyVirtualList();

    const containerElem = getContainerElem();
    if (!containerElem) return;

    if (!chatStore.chatMsgListEnabled) return;

    if (playbackStore.chatReplayEnabled) {
      const localForage = await loadLocalForage();
      watchCore.chat.addChatMsgReplayCachePlugin({
        getItem: localForage.getItem,
        setItem: localForage.setItem,
        removeItem: localForage.removeItem,
        iterate: localForage.iterate,
      });
      await watchCore.chat.initChatMsgReplay();
    }

    // 聊天消息加载
    const { loadInitialData, loadNextData, loadPreviousData } = requestHistoryHook(hookOptions);

    virtualList = new VirtualList<ChatMsgType>({
      container: containerElem,
      itemKey: 'id',
      prefetchDistance: 1,
      defaultView: 'foot',
      dataSource: {
        loadInitialData,
        loadNextData,
        loadPreviousData,
      },
      renderer: {
        renderItems,
        renderBoundary,
        renderLoading,
        renderError,
        renderEmpty,
      },
    });

    /**
     * dom 节点通过实例化 Vue 来创建
     * 移除时，需要手动销毁实例，否则不会被回收掉，高并发下会占用很高内存
     */
    virtualList.on(VirtualListEvent.ITEM_REMOVE, (data: unknown) => {
      const result = data as ItemsRemoveEvent<ChatMsgType>;
      const itemNodes = result.itemNodes;
      itemNodes.forEach(elem => {
        const domElem = elem as unknown as HTMLElement;
        const vueVm = domElem.__vueVm;
        if (vueVm) {
          vueVm.$destroy();
        }
      });
    });
  }

  /**
   * 销毁虚拟列表
   */
  function destroyVirtualList() {
    if (virtualList) {
      virtualList.destroy();
      virtualList = undefined;
    }
  }

  /**
   * 重新请求最新消息并渲染
   */
  async function initChatMsgRender() {
    if (!virtualList) {
      return;
    }

    const { loadInitialData } = requestHistoryHook(hookOptions);
    const result = await loadInitialData();
    if (!result.data) {
      return;
    }

    await virtualList.clear();
    virtualList.addBoundaryItems(result.data, RenderPosition.Foot, true);
    virtualList.scrollToFoot();

    /** clear 之后会变为边界状态，这里要手动重置头部边界，不然不会加载旧消息 */
    if (result.data.length > 0) {
      virtualList.resetBoundaryState(RenderPosition.Head);
    }
  }

  /** 重新加载聊天回放数据 */
  async function reloadChatReplayData() {
    if (!virtualList) {
      return;
    }

    chatMsgStore.hideMoreMsg();
    initChatMsgRender();
  }

  /** 滚动到最新位置 */
  async function scrollToNew() {
    if (!virtualList) {
      return;
    }
    chatMsgStore.hideMoreMsg();

    // 数据是否到达边界
    const footIsReached = virtualList.reachedBoundary(RenderPosition.Foot);
    if (footIsReached) {
      virtualList.scrollToFoot();
    } else {
      /**
       * 这里不用 virtualList.refresh() 的原因：
       * 该 api 会先清空节点后请求数据，请求期间会有明显的空屏现象，体验不佳
       */
      initChatMsgRender();
    }
  }

  useEventBusListener(appEvents.chat.ResetUpChatMsgList, () => {
    initVirtualList();
  });

  onMounted(() => {
    initVirtualList();
    eventBus.$on(appEvents.chat.ScrollToNew, scrollToNew);
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMsgReplayReload, reloadChatReplayData);
  });

  onBeforeUnmount(() => {
    destroyVirtualList();
    eventBus.$off(appEvents.chat.ScrollToNew, scrollToNew);
    watchCore.chat.eventEmitter.off(ChatEvents.ChatMsgReplayReload, reloadChatReplayData);
  });

  /** ---------- 虚拟列表 end ---------- */

  watch(
    () => chatStore.onlySpecialMsg,
    () => {
      virtualList?.refresh();
    },
  );

  watch(
    () => channelStore.liveStatus,
    () => {
      if (channelStore.liveStatus === LiveStatus.Live) {
        initVirtualList();
      }
    },
  );

  useChatTabSwitchWatch({
    cb: () => {
      scrollToNew();
    },
  });

  return {
    containerRef,
    getVirtualList,
    scrollToNew,
  };
};
