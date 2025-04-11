/**
 * @file 浏览器全屏 hook
 */
import { useLayoutStore } from '@/store/use-layout-store';
import { computed, onBeforeUnmount, Ref, unref } from 'vue';
import { storeToRefs } from 'pinia';

export interface FullscreenFieldData {
  /** 浏览器是否支持全屏模式的 api 字段 */
  enabledField: 'fullscreenEnabled';
  /** 获取浏览器正在全屏的 dom 节点 api 字段 */
  elementField: 'fullscreenElement';
  /** 浏览器全屏的 api 字段 */
  requestApiField: 'requestFullscreen';
  /** 浏览器退出全屏的 api 字段 */
  exitApiField: 'exitFullscreen';
  /** 浏览器全屏状态改变事件 */
  fullscreenChangeEvent: 'fullscreenchange';
}

// 各浏览器全屏接口
const apis = [
  {
    enabledField: 'fullscreenEnabled',
    elementField: 'fullscreenElement',
    requestApiField: 'requestFullscreen',
    exitApiField: 'exitFullscreen',
    fullscreenChangeEvent: 'fullscreenchange',
  },
  // New WebKit
  {
    enabledField: 'webkitFullscreenEnabled',
    elementField: 'webkitFullscreenElement',
    requestApiField: 'webkitRequestFullscreen',
    exitApiField: 'webkitExitFullscreen',
    fullscreenChangeEvent: 'webkitfullscreenchange',
  },
  // Old WebKit
  {
    enabledField: 'webkitCancelFullScreen',
    elementField: 'webkitCurrentFullScreenElement',
    requestApiField: 'webkitRequestFullScreen',
    exitApiField: 'webkitCancelFullScreen',
    fullscreenChangeEvent: 'webkitfullscreenchange',
  },
  {
    enabledField: 'mozFullScreenEnabled',
    elementField: 'mozFullScreenElement',
    requestApiField: 'mozRequestFullScreen',
    exitApiField: 'mozCancelFullScreen',
    fullscreenChangeEvent: 'mozfullscreenchange',
  },
  {
    enabledField: 'msFullscreenEnabled',
    elementField: 'msFullscreenElement',
    requestApiField: 'msRequestFullscreen',
    exitApiField: 'msExitFullscreen',
    fullscreenChangeEvent: 'MSFullscreenChange',
  },
];

let fieldData: FullscreenFieldData | undefined;

// 遍历 apis，获取当前可以用的全屏 api
for (let i = 0; i < apis.length; i++) {
  const item = apis[i];
  if (item.enabledField in document) {
    fieldData = item as FullscreenFieldData;
    break;
  }
}

export type FullscreenElement = Element | Ref<Element>;

export type GetFullscreenElement = () => FullscreenElement;

/**
 * @hook 全屏处理
 */
export const useFullscreen = (
  elementRef: FullscreenElement | GetFullscreenElement = document.documentElement,
) => {
  const layoutStore = useLayoutStore();
  const { isFullscreen } = storeToRefs(layoutStore);

  /** 是否支持浏览器全屏 */
  const supportFullscreen = computed(() => !!fieldData);

  const getFullscreenElement = () => {
    if (typeof elementRef === 'function') {
      const res = elementRef();
      return unref(res) || document.documentElement;
    }

    return unref(elementRef) || document.documentElement;
  };

  /** 全屏 */
  function requestFullscreen() {
    const element = getFullscreenElement();
    if (!fieldData || !element[fieldData.requestApiField]) {
      return;
    }
    element[fieldData.requestApiField]();
  }

  /** 退出全屏 */
  function exitFullscreen() {
    if (!fieldData) {
      return;
    }
    document[fieldData.exitApiField]();
  }

  /** 切换全屏状态 */
  function toggleFullscreen() {
    if (!fieldData) {
      return;
    }
    if (!document[fieldData.elementField]) {
      requestFullscreen();
    } else {
      exitFullscreen();
    }
  }

  /** 处理全屏事件 */
  function onFullscreenChange() {
    if (!fieldData) {
      return;
    }
    if (document[fieldData.elementField]) {
      layoutStore.$patch({
        isFullscreen: true,
      });
    } else {
      layoutStore.$patch({
        isFullscreen: false,
      });
    }
  }

  if (fieldData) {
    document.addEventListener(fieldData.fullscreenChangeEvent, onFullscreenChange);
  }

  onBeforeUnmount(() => {
    if (!fieldData) {
      return;
    }
    document.removeEventListener(fieldData.fullscreenChangeEvent, onFullscreenChange);
  });

  return {
    isFullscreen,
    supportFullscreen,
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
};
