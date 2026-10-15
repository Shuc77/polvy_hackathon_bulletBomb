/**
 * @file 指针事件工具
 * @desc 时间轴与模板拖拽都要在 mouse / touch 之间取同一个坐标。
 *
 * 统一取 `clientX` / `clientY`，**不要用 `pageX`**：仓库里的 `getEventPosition()`
 * 对触屏返回的是 `pageX`，而消费方减的是 `getBoundingClientRect().left`（视口坐标），
 * 页面一旦滚动就会差出一个 `scrollX`。工作台是全屏浮层，自己归一化更省心。
 */

/** 取指针横坐标（视口坐标系） */
export function pointerClientX(event: MouseEvent | TouchEvent): number {
  if (event instanceof MouseEvent) {
    return event.clientX;
  }

  const touch = event.touches[0] ?? event.changedTouches[0];
  return touch ? touch.clientX : 0;
}

/** 取指针纵坐标（视口坐标系） */
export function pointerClientY(event: MouseEvent | TouchEvent): number {
  if (event instanceof MouseEvent) {
    return event.clientY;
  }

  const touch = event.touches[0] ?? event.changedTouches[0];
  return touch ? touch.clientY : 0;
}
