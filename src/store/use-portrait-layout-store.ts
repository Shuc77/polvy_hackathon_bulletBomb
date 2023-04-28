import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { useChannelStore } from './use-channel-store';
import { useDocStore } from './use-doc-store';
import { usePageStore } from './use-page-store';
import { usePlaybackStore } from './use-playback-store';

export interface PortraitLayoutStoreState {
  /** 竖屏轮播屏当前索引 */
  carouselActiveIndex: Ref<number>;
  /** 竖屏页面背景地址 */
  portraitPageBgUrl: ComputedRef<string | undefined>;
  /** 竖屏文档容器内容渲染高度 */
  portraitDocContentHeight: ComputedRef<number>;
  /** 竖屏文档容器渲染高度 */
  portraitDocWrapHeight: ComputedRef<number>;
  /** 频道信息位置 */
  channelInfoSeat: ComputedRef<0 | 1>;
}

/**
 * 竖屏布局 store
 */
export const usePortraitLayoutStore = defineStore<'portraitLayout', PortraitLayoutStoreState>(
  'portraitLayout',
  () => {
    const channelStore = useChannelStore();
    const pageStore = usePageStore();
    const playbackStore = usePlaybackStore();
    const docStore = useDocStore();

    /** 竖屏轮播屏当前索引 */
    const carouselActiveIndex = ref(1);

    /** 竖屏页面背景地址 */
    const portraitPageBgUrl = computed<string | undefined>(() => {
      const channelDetail = channelStore.channelDetail;
      const portraitChatBgImg = channelDetail?.channelInfo.portraitChatBgImg;
      const portraitChatBgImgOpacity = channelDetail?.channelInfo.portraitChatBgImgOpacity;

      if (!portraitChatBgImg) {
        return;
      }

      return portraitChatBgImgOpacity
        ? `${portraitChatBgImg}?x-oss-process=image/blur,r_${portraitChatBgImgOpacity},s_${portraitChatBgImgOpacity}`
        : portraitChatBgImg;
    });

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

    return {
      carouselActiveIndex,
      portraitPageBgUrl,
      portraitDocContentHeight,
      portraitDocWrapHeight,
      channelInfoSeat,
    };
  },
);
