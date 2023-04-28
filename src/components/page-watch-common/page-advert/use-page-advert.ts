import { computed, onMounted, ref, unref } from 'vue';
import { PageAdvertItem, YN } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { ynToBool } from '@utils-ts/boolean';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';

export const usePageAdvert = () => {
  const channelStore = useChannelStore();

  /** 页面广告开关 */
  const pageAdvertEnabled = computed<boolean>(() =>
    ynToBool(channelStore.channelDetail?.channelAdvert?.pageAdvertEnabled, YN.N),
  );

  /** 广告是否显示 */
  const { visible: advertVisible, close: closeAdvert } = useSimpleVisible(true);

  /** 页面广告列表 */
  const pageAdvertList = ref<PageAdvertItem[]>([]);

  /** 关闭按钮是否显示 */
  const closeVisible = computed(() => {
    return ynToBool(channelStore.channelDetail?.channelAdvert?.closeAdvertEnabled, YN.N);
  });

  /** 处理点击关闭 */
  function onClickClose() {
    closeAdvert();
  }

  /** 打开链接 */
  function openLink(href?: string) {
    if (!href) return;
    window.open(href, '_blank');
  }

  onMounted(() => {
    if (unref(pageAdvertEnabled)) {
      const watchCore = getWatchCore();
      pageAdvertList.value = watchCore.channel.getPageAdvertList();
    }
  });

  return {
    advertVisible,
    pageAdvertList,
    closeVisible,
    onClickClose,
    openLink,
  };
};
