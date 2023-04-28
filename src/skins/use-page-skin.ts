import { paramGetter } from '@/hooks/core/use-query-params';
import { isMobile } from '@/assets/utils/browser';
import { useChannelStore } from '@/store/use-channel-store';
import { usePageStore } from '@/store/use-page-store';
import { ChannelWatchLayout, ChannelWatchPageSkin } from '@polyv/live-watch-sdk';
import { $ } from '@just4/dom';
import { watch } from 'vue';

/**
 * 页面皮肤 hook
 */
export const usePageSkin = () => {
  const channelStore = useChannelStore();
  const pageStore = usePageStore();

  /**
   * 初始化观看页多皮肤
   */
  async function initPageSkin(): Promise<void> {
    const watchLayout = channelStore.channelDetail?.channelInfo.watchLayout;

    let pageSkin = channelStore.channelDetail?.theme.newPageSkin;

    // 在非普通直播频道下只加载黑色皮肤
    if (watchLayout !== ChannelWatchLayout.Normal) {
      pageSkin = ChannelWatchPageSkin.Black;
    }

    const querySkin = paramGetter.skin();
    if (querySkin) {
      pageSkin = querySkin;
    }

    return setPageSkin(pageSkin);
  }

  /**
   * 设置页面皮肤
   * @param pageSkin 页面皮肤
   */
  async function setPageSkin(pageSkin: ChannelWatchPageSkin | undefined): Promise<void> {
    pageStore.$patch({
      pageSkin,
    });

    return importPageSkin();
  }

  /**
   * 加载观看页多皮肤
   */
  async function importPageSkin(): Promise<void> {
    const pageSkin = pageStore.pageSkin;

    if (!pageSkin) {
      return;
    }

    if (isMobile) {
      await importMobilePageSkin(pageSkin);
    } else {
      await importPcPageSkin(pageSkin);
    }
  }

  /**
   * 加载 PC 端观看页多皮肤
   */
  async function importPcPageSkin(pageSkin: ChannelWatchPageSkin): Promise<void> {
    switch (pageSkin) {
      case ChannelWatchPageSkin.Red:
        await import(/* webpackChunkName: "skin-red-pc" */ '@/skins/red/_red-pc.scss');
        break;
      case ChannelWatchPageSkin.Blue:
        await import(/* webpackChunkName: "skin-blue-pc" */ '@/skins/blue/_blue-pc.scss');
        break;
      case ChannelWatchPageSkin.Green:
        await import(/* webpackChunkName: "skin-green-pc" */ '@/skins/green/_green-pc.scss');
        break;
      case ChannelWatchPageSkin.White:
        await import(/* webpackChunkName: "skin-white-pc" */ '@/skins/white/_white-pc.scss');
        break;
      case ChannelWatchPageSkin.Golden:
        await import(/* webpackChunkName: "skin-golden-pc" */ '@/skins/golden/_golden-pc.scss');
        break;
      default:
        await import(/* webpackChunkName: "skin-black-pc" */ '@/skins/black/_black-pc.scss');
        break;
    }
  }

  /**
   * 加载 Mobile 端观看页多皮肤
   */
  async function importMobilePageSkin(pageSkin: ChannelWatchPageSkin): Promise<void> {
    switch (pageSkin) {
      case ChannelWatchPageSkin.Red:
        await import(/* webpackChunkName: "skin-red-mobile" */ '@/skins/red/_red-mobile.scss');
        break;
      case ChannelWatchPageSkin.Blue:
        await import(/* webpackChunkName: "skin-blue-mobile" */ '@/skins/blue/_blue-mobile.scss');
        break;
      case ChannelWatchPageSkin.Green:
        await import(
          /* webpackChunkName: "skin-green-mobile" */ '@/skins/green/_green-mobile.scss'
        );
        break;
      case ChannelWatchPageSkin.White:
        await import(
          /* webpackChunkName: "skin-white-mobile" */ '@/skins/white/_white-mobile.scss'
        );
        break;
      case ChannelWatchPageSkin.Golden:
        await import(
          /* webpackChunkName: "skin-golden-mobile" */ '@/skins/golden/_golden-mobile.scss'
        );
        break;
      default:
        await import(
          /* webpackChunkName: "skin-black-mobile" */ '@/skins/black/_black-mobile.scss'
        );
        break;
    }
  }

  // 设置页面的 class
  watch(
    () => pageStore.pageSkin,
    (pageSkin, oldPageSkin) => {
      const skinClassPrefix = 'pws-skin-';
      const $document = $(document.documentElement);

      if (oldPageSkin) {
        const oldPageSkinClass = `${skinClassPrefix}${oldPageSkin}`;
        if ($document.hasClass(oldPageSkinClass)) {
          $document.removeClass(oldPageSkinClass);
        }
      }

      if (pageSkin) {
        const pageSkinClass = `${skinClassPrefix}${pageSkin}`;
        $document.addClass(pageSkinClass);
      }
    },
  );

  return {
    initPageSkin,
    setPageSkin,
    importPageSkin,
  };
};
