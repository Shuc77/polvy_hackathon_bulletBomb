/**
 * 等待一段时间
 * @param time 等待时间
 */
export function wait(time = 3000) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

/**
 * 通过 setTimeout 和递归来模拟 setInterval
 */
export function plvInterval(
  fn: AnyFunc,
  intervalTime: number | (() => number),
  options?: {
    maxCount?: number;
    immediate?: boolean;
  },
): { clear: () => void } {
  const { maxCount = Infinity, immediate = false } = options || {};

  let timer: number | undefined;
  let intervalCount = 0;

  const __intervalTime = typeof intervalTime === 'function' ? intervalTime() : intervalTime;

  const innerInterval = () => {
    timer = window.setTimeout(() => {
      fn();
      intervalCount++;

      if (intervalCount < maxCount) {
        innerInterval();
      } else {
        window.clearTimeout(timer);
      }
    }, __intervalTime);
  };

  if (immediate) {
    fn();
  }
  innerInterval();

  return {
    clear: () => {
      // 处理 intervalTime 过少的情况，比如 100ms
      window.setTimeout(() => {
        window.clearTimeout(timer);
      }, 0);
    },
  };
}

/**
 * 获取事件对象中的坐标
 * @param event 事件对象
 */
export function getEventPosition(event: MouseEvent | TouchEvent): {
  clientX: number;
  clientY: number;
} {
  if (event instanceof MouseEvent) {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }

  const touch = event.touches[0] || event.changedTouches[0] || event.targetTouches[0];
  const touchX = touch.pageX;
  const touchY = touch.pageY;

  return {
    clientX: touchX,
    clientY: touchY,
  };
}

/**
 * 是否被外部应用注入使用
 */
export function isInjectByExternalApp(): boolean {
  return !!(IN_SDK_INJECT_MODE && window.PolyvWatchAppSdk);
}

/**
 * 是否使用 feed 注入模式
 */
export function isBuildForFeedMainMode(): boolean {
  return process.env.VUE_APP_MAIN_MODE === 'Feed';
  // return isInjectByExternalApp() && process.env.VUE_APP_MAIN_MODE === 'Feed';
}
