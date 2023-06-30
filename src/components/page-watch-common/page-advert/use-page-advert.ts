import { getWatchCore } from '@/core/watch-sdk';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { PageAdvertItem } from '@polyv/live-watch-sdk';
import { onMounted, ref } from 'vue';

export const usePageAdvert = () => {
  /** 页面广告开关 */
  const pageAdvertEnabled = ref(false);

  /** 页面广告列表 */
  const pageAdvertList = ref<PageAdvertItem[]>([]);

  /** 关闭按钮是否显示 */
  const closeVisible = ref(false);

  /** 广告是否显示 */
  const { visible: advertVisible, close: closeAdvert } = useSimpleVisible(true);

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
    const watchCore = getWatchCore();
    const advertSetting = watchCore.channel.getPageAdvertSetting();

    pageAdvertEnabled.value = advertSetting.pageAdvertEnabled;
    closeVisible.value = advertSetting.closeAdvertEnabled;
    pageAdvertList.value = advertSetting.pageAdvertList;
  });

  return {
    advertVisible,
    pageAdvertEnabled,
    pageAdvertList,
    closeVisible,
    onClickClose,
    openLink,
  };
};
