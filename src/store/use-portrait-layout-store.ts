import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { useChannelStore } from './use-channel-store';
import { useDocStore } from './use-doc-store';
import { usePageStore } from './use-page-store';
import { usePlaybackStore } from './use-playback-store';

export enum PortraitChatTabType {
  /** 聊天室 */
  'Chat' = 'Chat',
  /** 提问区 */
  'Ask' = 'Ask',
}
export interface PortraitLayoutStoreState {
  /** 竖屏轮播屏当前索引 */
  carouselActiveIndex: Ref<number>;
  /** 竖屏文档容器内容渲染高度 */
  portraitDocContentHeight: ComputedRef<number>;
  /** 竖屏文档容器渲染高度 */
  portraitDocWrapHeight: ComputedRef<number>;
  /** 频道信息位置 */
  channelInfoSeat: ComputedRef<0 | 1>;
  /** 竖屏下聊天室当前激活的tab栏 */
  portraitChatTab: Ref<PortraitChatTabType>;
  /** 竖屏下提问是否有新消息 */
  portraitAskHasNews: Ref<boolean>;
}

export interface PortraitLayoutStoreAction {
  /** 更换竖屏下聊天室当前tab栏 */
  updatePortraitChatTabType(type: PortraitChatTabType): void;
  /** 更新竖屏下提问是否有新消息 */
  updatePortraitHasAskNews(hasNews: boolean): void;
}

export interface PortraitStore extends PortraitLayoutStoreState, PortraitLayoutStoreAction {}

/**
 * 竖屏布局 store
 */
export const usePortraitLayoutStore = defineStore<'portraitLayout', PortraitStore>(
  'portraitLayout',
  () => {
    const channelStore = useChannelStore();
    const pageStore = usePageStore();
    const playbackStore = usePlaybackStore();
    const docStore = useDocStore();

    /** 竖屏轮播屏当前索引 */
    const carouselActiveIndex = ref(1);

    /** 竖屏聊天信息当前激活的tab栏目 */
    const portraitChatTab = ref(PortraitChatTabType.Chat);

    /** 竖屏文档容器内容渲染高度 */
    const portraitDocContentHeight = computed<number>(() => {
      const pageClientWidth = pageStore.pageClientWidth;
      const documentProportion = docStore.documentProportion;

      // 最小高度为 9:16
      const minHeight = pageClientWidth * (9 / 16);
      // 最大高度为 3:4
      const maxHeight = pageClientWidth * (3 / 4);

      if (!documentProportion) {
        return minHeight;
      }

      let wrapHeight = pageClientWidth / documentProportion;
      if (wrapHeight >= maxHeight) {
        wrapHeight = maxHeight;
      }
      if (wrapHeight <= minHeight) {
        wrapHeight = minHeight;
      }
      return wrapHeight;
    });

    /** 竖屏文档容器渲染高度 */
    const portraitDocWrapHeight = computed<number>(() => {
      if (!docStore.canRenderDoc || !docStore.documentSwitch) {
        return 0;
      }

      return portraitDocContentHeight.value;
    });

    /** 频道信息位置 */
    const channelInfoSeat = computed<0 | 1>(() => {
      if (
        channelStore.isPptChannel &&
        (channelStore.liveStatus === LiveStatus.Live || playbackStore.isPlaybacking)
      ) {
        return 0;
      }
      return 1;
    });

    /** 竖屏下提问是否有新消息 */
    const portraitAskHasNews = ref(false);

    /** 更换竖屏下聊天室当前tab栏 */
    const updatePortraitChatTabType = (type: PortraitChatTabType) => {
      portraitChatTab.value = type;
    };

    /** 更新是否接受到新的提问信息 */
    const updatePortraitHasAskNews = (hasNews: boolean) => {
      portraitAskHasNews.value = hasNews && portraitChatTab.value === PortraitChatTabType.Chat;
    };

    return {
      portraitChatTab,
      portraitAskHasNews,
      carouselActiveIndex,
      portraitDocContentHeight,
      portraitDocWrapHeight,
      channelInfoSeat,
      updatePortraitChatTabType,
      updatePortraitHasAskNews,
    };
  },
);
