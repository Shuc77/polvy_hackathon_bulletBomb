/**
 * @file 字幕时间轴查找工具
 */

export interface TimelineItem {
  start: number;
  end: number;
}

/**
 * 找到最后一个 start 小于等于 time 的下标。
 * 要求 items 已按 start 升序排列。
 */
export function findLastIndexByStart<T extends TimelineItem>(items: T[], time: number): number {
  let low = 0;
  let high = items.length - 1;
  let result = -1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    if (items[middle].start <= time) {
      result = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return result;
}

/**
 * 查找当前时间对应的字幕。
 *
 * 正常字幕区间不会重叠，因此从最后一个 start <= time 的条目开始校验即可；
 * 额外向前检查少量条目，用于兼容 SRT 中偶发的重叠时间区间。
 */
export function findTimelineItem<T extends TimelineItem>(
  items: T[],
  time: number,
  endTolerance = 0,
): T | undefined {
  if (!items.length || !Number.isFinite(time)) return undefined;

  const index = findLastIndexByStart(items, time);
  if (index < 0) return undefined;

  const minIndex = Math.max(0, index - 8);
  for (let cursor = index; cursor >= minIndex; cursor--) {
    const item = items[cursor];
    if (item.end + endTolerance >= time) return item;
  }

  return undefined;
}
