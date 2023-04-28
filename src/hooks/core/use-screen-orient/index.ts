import { computed, onMounted, ref } from 'vue';

/**
 * 屏幕旋转模式
 * @desc 不使用 portrait 和 landscape 是不想和业务名称重合
 * */
export enum ScreenOrientationMode {
  /** 屏幕纵向 */
  Vertical = 'Vertical',
  /** 屏幕横向 */
  Horizontal = 'Horizontal',
}

/**
 * @hook 屏幕旋转
 */
export const useScreenOrientHook = (params: {
  /** 自动监听事件 */
  autoListen?: boolean;
  /** 自动监听回调 */
  autoListenCb?: (screenOrientationMode: ScreenOrientationMode) => void;
}) => {
  const { autoListen = true, autoListenCb = () => {} } = params;

  /** 屏幕旋转模式 */
  const screenOrientationMode = ref(ScreenOrientationMode.Vertical);

  /** 当前屏幕旋转角度是否为纵向 */
  const isVerticalScreenOrientation = computed(() => {
    return screenOrientationMode.value === ScreenOrientationMode.Vertical;
  });

  /** 当前屏幕旋转角度是否为横向 */
  const isHorizontalScreenOrientation = computed(() => {
    return screenOrientationMode.value === ScreenOrientationMode.Horizontal;
  });

  /** 手动更新当前屏幕的旋转方向 */
  function updateScreenOrientationModeManually() {
    if (window.orientation === 180 || window.orientation === 0) {
      screenOrientationMode.value = ScreenOrientationMode.Vertical;
    }
    if (window.orientation === 90 || window.orientation === -90) {
      screenOrientationMode.value = ScreenOrientationMode.Horizontal;
    }
  }

  /** 监听屏幕旋转方向的改变 */
  function onOrientationChange() {
    setTimeout(() => {
      const mql = window.matchMedia('(orientation: portrait)');
      if (mql?.matches) {
        screenOrientationMode.value = ScreenOrientationMode.Vertical;
      } else {
        screenOrientationMode.value = ScreenOrientationMode.Horizontal;
      }
      autoListenCb(screenOrientationMode.value);
    }, 200);
  }

  onMounted(() => {
    if (autoListen) {
      // 处理屏幕旋转
      window.addEventListener(
        'onorientationchange' in window ? 'orientationchange' : 'resize',
        onOrientationChange,
        false,
      );
      onOrientationChange();
    }
  });

  return {
    screenOrientationMode,
    isVerticalScreenOrientation,
    isHorizontalScreenOrientation,
    updateScreenOrientationModeManually,
  };
};
