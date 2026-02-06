import { $ } from '@just4/dom';
import { ref, watch } from 'vue';
import {
  ChannelWatchPageSkin,
  ChannelWatchThemeStyleType,
  MobileWatchLayout,
} from '@polyv/live-watch-sdk';

import { isMobile } from '@/assets/utils/browser';
import { useThemeStore } from '@/store/use-theme-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { hexToRGB } from '@/assets/utils/color';
import { WatchThemeStyleConfig, getDefaultWatchThemeConfig } from './theme-config-type';
import { SkinColorMode } from './enum';
import { merge } from 'lodash-es';

export const usePageSkinImport = () => {
  const themeStore = useThemeStore();
  const layoutStore = useLayoutStore();

  function importSkinColorMode() {
    import(/* webpackChunkName: "skin-dark" */ '@/skins/_v2/dark/style.scss');
    import(/* webpackChunkName: "skin-light" */ '@/skins/_v2/light/style.scss');
  }

  /**
   * 加载观看页多皮肤
   */
  async function importPageSkin(): Promise<void> {
    const pageSkin = themeStore.pageSkin;

    if (!pageSkin) {
      return;
    }

    if (!isMobile) {
      await importPcPageSkin(pageSkin);
      return;
    }

    if (layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait) {
      await importPortraitPageSkin(pageSkin);
    } else {
      await importMobilePageSkin(pageSkin);
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
      case ChannelWatchPageSkin.Freshblue:
        await import(
          /* webpackChunkName: "skin-freshblue-pc" */ '@/skins/freshblue/_freshblue-pc.scss'
        );
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
      case ChannelWatchPageSkin.Freshblue:
        await import(
          /* webpackChunkName: "skin-freshblue-mobile" */ '@/skins/freshblue/_freshblue-mobile.scss'
        );
        break;
      default: {
        await import(
          /* webpackChunkName: "skin-black-mobile" */ '@/skins/black/_black-mobile.scss'
        );
        break;
      }
    }
  }

  /**
   * 加载 Portrait 竖屏端观看页多皮肤
   * @PLV-WARN 竖屏多皮肤的处理是黑色背景 + 主题色强调，和横屏多皮肤不一样
   */
  async function importPortraitPageSkin(pageSkin: ChannelWatchPageSkin): Promise<void> {
    switch (pageSkin) {
      case ChannelWatchPageSkin.Red:
        await import(/* webpackChunkName: "skin-red-portrait" */ '@/skins/red/_red-portrait.scss');
        break;
      case ChannelWatchPageSkin.Blue:
        await import(
          /* webpackChunkName: "skin-blue-portrait" */ '@/skins/blue/_blue-portrait.scss'
        );
        break;
      case ChannelWatchPageSkin.Green:
        await import(
          /* webpackChunkName: "skin-green-portrait" */ '@/skins/green/_green-portrait.scss'
        );
        break;
      case ChannelWatchPageSkin.White:
        await import(
          /* webpackChunkName: "skin-white-portrait" */ '@/skins/white/_white-portrait.scss'
        );
        break;
      case ChannelWatchPageSkin.Golden:
        await import(
          /* webpackChunkName: "skin-golden-portrait" */ '@/skins/golden/_golden-portrait.scss'
        );
        break;
      case ChannelWatchPageSkin.Freshblue:
        await import(
          /* webpackChunkName: "skin-freshblue-portrait" */ '@/skins/freshblue/_freshblue-portrait.scss'
        );
        break;
      default: {
        await import(
          /* webpackChunkName: "skin-black-portrait" */ '@/skins/black/_black-portrait.scss'
        );
        break;
      }
    }
  }

  /**
   * 加载观看页主题皮肤
   * @desc 根据 colorMode 分开加载 dark/light 模式的皮肤文件
   */
  async function importWatchThemeSkin() {
    const importDark = async () => {
      if (!isMobile) {
        await import(
          /* webpackChunkName: "skin-custom-theme-dark-pc" */ '@/skins/custom-theme/entry/dark/_custom-theme-dark-pc.scss'
        );
        return;
      }

      if (layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait) {
        await import(
          /* webpackChunkName: "skin-custom-theme-dark-portrait" */ '@/skins/custom-theme/entry/dark/_custom-theme-dark-portrait.scss'
        );
      } else {
        await import(
          /* webpackChunkName: "skin-custom-theme-dark-mobile" */ '@/skins/custom-theme/entry/dark/_custom-theme-dark-mobile.scss'
        );
      }
    };

    const importLight = async () => {
      if (!isMobile) {
        await import(
          /* webpackChunkName: "skin-custom-theme-light-pc" */ '@/skins/custom-theme/entry/light/_custom-theme-light-pc.scss'
        );
      }

      if (layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait) {
        await import(
          /* webpackChunkName: "skin-custom-theme-light-portrait" */ '@/skins/custom-theme/entry/light/_custom-theme-light-portrait.scss'
        );
      } else {
        await import(
          /* webpackChunkName: "skin-custom-theme-light-mobile" */ '@/skins/custom-theme/entry/light/_custom-theme-light-mobile.scss'
        );
      }
    };

    const isDark = themeStore.currentSkinColorMode === SkinColorMode.Dark;

    if (isDark) {
      importDark();
    } else {
      importLight();
    }
  }

  return {
    importSkinColorMode,
    importPageSkin,
    importWatchThemeSkin,
  };
};

/**
 * 页面皮肤 hook
 */
export const usePageSkin = () => {
  const themeStore = useThemeStore();
  const layoutStore = useLayoutStore();

  const { getAppRootElement, getPolyvWatchApp, getWatchCore } = useMultiPolyvWatchApp();
  const { paramGetter } = useQueryParams({
    getPolyvWatchAppLoader: () => () => getPolyvWatchApp(),
  });

  const { importSkinColorMode, importPageSkin, importWatchThemeSkin } = usePageSkinImport();

  const skinInited = ref(false);

  /**
   * 初始化观看页多皮肤
   */
  async function initPageSkin(): Promise<void> {
    try {
      const querySkin = paramGetter().skin(); // 传入皮肤优先使用
      const isPageSkinMode = themeStore.styleType === ChannelWatchThemeStyleType.Skin;

      if (querySkin || isPageSkinMode) {
        setupPageSkin(querySkin);
      } else {
        if (!isMobile && themeStore.watchTheme === 'spring') {
          await setupPageSkin(ChannelWatchPageSkin.Red);
        } else {
          await setupWatchThemeConfig();
        }
      }

      skinInited.value = true;
    } catch (error) {
      console.error('initPageSkin error', error);
      setupPageSkin(ChannelWatchPageSkin.Black);
    }
  }

  /**
   * 初始化观看页主题配置
   */
  async function setupWatchThemeConfig(): Promise<void> {
    if (themeStore.watchThemeStyleConfig || !themeStore.watchTheme) {
      return;
    }

    const watchCore = getWatchCore();
    let watchThemeStyleConfig =
      await watchCore.channel.getWatchThemeStyleConfig<WatchThemeStyleConfig>(
        themeStore.watchTheme,
      );

    watchThemeStyleConfig = merge(getDefaultWatchThemeConfig(), watchThemeStyleConfig);

    themeStore.$patch({
      watchThemeStyleConfig,

      // 确保主题配置逻辑加载正常
      styleType: ChannelWatchThemeStyleType.Theme,
      pageSkin: null,
    });

    setupPageSkinVar();
    setupPageSkinClass('custom-theme');

    importSkinColorMode();
    importWatchThemeSkin();
  }

  /**
   * 设置页面皮肤
   * @param pageSkin 页面皮肤
   */
  async function setupPageSkin(skin?: ChannelWatchPageSkin): Promise<void> {
    const pageSkin = skin || themeStore.pageSkin;

    themeStore.$patch({
      pageSkin,

      // 确保主题配置逻辑加载正常
      styleType: ChannelWatchThemeStyleType.Skin,
      watchTheme: null,
      watchThemeStyleConfig: null,
    });

    setupPageSkinVar();
    setupPageSkinClass(pageSkin);

    importSkinColorMode();
    importPageSkin();
  }

  /**
   * 获取皮肤类名
   */
  function getSkinClassName(pageSkin?: ChannelWatchPageSkin | string) {
    let __pageSkin = pageSkin || themeStore.pageSkin;
    if (!__pageSkin) {
      if (themeStore.styleType === ChannelWatchThemeStyleType.Skin) {
        return '';
      } else {
        __pageSkin = 'custom-theme';
      }
    }

    let skinClassPrefix = 'pws-skin-';
    if (
      layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait &&
      __pageSkin === ChannelWatchPageSkin.Black
    ) {
      const mobileSkin = skinClassPrefix + __pageSkin;
      const nextPrefix = skinClassPrefix + 'portrait-';
      skinClassPrefix = mobileSkin + ' ' + nextPrefix;
    }

    return skinClassPrefix + __pageSkin;
  }

  // 设置页面的 class
  function setupPageSkinClass(pageSkin?: string | null) {
    if (!pageSkin) return;

    const $document = $(getAppRootElement());
    const pageSkinClass = getSkinClassName(pageSkin);
    if (pageSkinClass) $document.addClass(pageSkinClass);
  }

  watch(
    () => themeStore.pageSkin,
    (newPageSkin, oldPageSkin) => {
      if (oldPageSkin) {
        const $document = $(getAppRootElement());

        const oldPageSkinClass = getSkinClassName(oldPageSkin);
        if (oldPageSkinClass && $document.hasClass(oldPageSkinClass)) {
          $document.removeClass(oldPageSkinClass);
        }
      }

      if (oldPageSkin && newPageSkin) {
        setupPageSkinClass(newPageSkin);
      }
    },
  );

  watch(
    () => themeStore.currentSkinColorMode,
    (currentSkinColorMode, oldPageSkinColorMode) => {
      const $document = $(getAppRootElement());

      const classPrefix = 'pws-skin-color-mode-';

      if (oldPageSkinColorMode) {
        const oldClass = classPrefix + oldPageSkinColorMode;
        if ($document.hasClass(oldClass)) {
          $document.removeClass(oldClass);
        }
      }

      if (currentSkinColorMode) {
        const newClass = classPrefix + currentSkinColorMode;
        $document.addClass(newClass);
      }
    },
    {
      immediate: true,
    },
  );

  function setupPageSkinVar() {
    const rootElement = getAppRootElement();
    const config = themeStore.watchThemeStyleConfig;

    const primaryRgbColor = hexToRGB(themeStore.currentSkinPrimaryColor);
    rootElement.style.setProperty('--plv-watch-skin-primary-rgb', primaryRgbColor.join(','));

    const themeRgbColor = hexToRGB(themeStore.currentSkinThemeColor);
    rootElement.style.setProperty('--plv-watch-skin-theme-rgb', themeRgbColor.join(','));

    // 根据 colorMode 设置中性色
    const mode = themeStore.currentSkinColorMode;
    const neutralRgb = mode === SkinColorMode.Dark ? '255,255,255' : '0,0,0';
    rootElement.style.setProperty('--plv-watch-skin-neutral-rgb', neutralRgb);

    if (!config) return;
    const normalBtnBg = config.common.normalBtn.bg;
    rootElement.style.setProperty('--plv-watch-skin-normal-btn-bg', normalBtnBg);

    const normalBtnBorderColor = config.common.normalBtn.borderColor;
    rootElement.style.setProperty('--plv-watch-skin-normal-btn-border-color', normalBtnBorderColor);

    const normalBtnTextColor = config?.common.normalBtn.color;
    rootElement.style.setProperty('--plv-watch-skin-normal-btn-text-color', normalBtnTextColor);
  }

  watch(
    () => themeStore.currentSkinConfig,
    () => {
      if (!skinInited.value) return;

      setupPageSkinVar();
    },
  );

  return {
    getSkinClassName,

    initPageSkin,
    importPageSkin,
  };
};
