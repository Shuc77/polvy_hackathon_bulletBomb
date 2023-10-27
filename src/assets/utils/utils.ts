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
 * 获取在指定范围的随机整数
 */
export function generateRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
