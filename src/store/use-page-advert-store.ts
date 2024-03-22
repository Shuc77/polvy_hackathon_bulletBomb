import { getWatchCore } from '@/core/watch-sdk';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { PageAdvertItem, PlvChannelModule } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export interface PageAdvertStoreState {
  /** 页面广告开关 */
  pageAdvertEnabled: Ref<boolean>;
  /** 页面广告列表 */
  pageAdvertList: Ref<PageAdvertItem[]>;
  /** 关闭按钮是否显示 */
  closeVisible: Ref<boolean>;
  /** 广告是否显示 */
  advertVisible: Ref<boolean>;
}

export interface PageAdvertStoreActions {
  /** 同步广告 store */
  syncPageAdvertStore(): void;
  /** 关闭页面广告 */
  closeAdvert(): void;
  /** 打开广告链接 */
  openLink(href?: string): void;
}

export interface PageAdvertStore extends PageAdvertStoreState, PageAdvertStoreActions {}

export const usePageAdvertStore = defineStore<'pageAdvert', PageAdvertStore>('pageAdvert', () => {
  const __pageAdvertSetting = PlvChannelModule.generateDefaultPageAdvertSetting();

  /** 页面广告开关 */
  const pageAdvertEnabled = ref(__pageAdvertSetting.pageAdvertEnabled);

  /** 页面广告列表 */
  const pageAdvertList = ref<PageAdvertItem[]>(__pageAdvertSetting.pageAdvertList);

  /** 关闭按钮是否显示 */
  const closeVisible = ref(__pageAdvertSetting.closeAdvertEnabled);

  /** 广告是否显示 */
  const { visible: advertVisible, close: closeAdvert } = useSimpleVisible(true);

  /** 打开链接 */
  function openLink(href?: string) {
    if (!href) return;
    window.open(href, '_blank');
  }

  function syncPageAdvertStore() {
    const watchCore = getWatchCore();
    const advertSetting = watchCore.channel.getPageAdvertSetting();

    pageAdvertEnabled.value = advertSetting.pageAdvertEnabled;
    closeVisible.value = advertSetting.closeAdvertEnabled;
    pageAdvertList.value = advertSetting.pageAdvertList;

    if (!advertSetting.pageAdvertEnabled || advertSetting.pageAdvertList.length === 0) {
      closeAdvert();
    }
  }

  return {
    advertVisible,
    pageAdvertEnabled,
    pageAdvertList,
    closeVisible,
    syncPageAdvertStore,
    closeAdvert,
    openLink,
  };
});
