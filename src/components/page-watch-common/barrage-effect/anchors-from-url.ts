/**
 * @file 从地址栏读取时间锚点
 * @desc 分享与演示的入口，可用 `?barrageAnchors=` 直接把一套配置带给别人。
 *   正式形态下锚点由发布者在配置面板里预设、经后台下发。
 */
import { getUrlQueryParams } from '@/hooks/core/use-query-params';
import { parseAnchorsText } from './anchor-utils';
import type { BarrageAnchor } from './types';

/** 锚点配置在地址栏上的参数名 */
export const ANCHORS_QUERY_KEY = 'barrageAnchors';

/**
 * 取地址栏参数的原始文本
 * @desc 调用方要拿它做「指纹」比对：同样的载荷不该被反复应用，
 *   否则每次刷新都会把用户在工作台里的改动冲掉。所以这里返回原文而不是解析结果
 */
export function getAnchorsQueryRaw(): string | undefined {
  const raw = getUrlQueryParams()[ANCHORS_QUERY_KEY];
  const value = Array.isArray(raw) ? raw[0] : raw;

  return value || undefined;
}

export function getAnchorsFromUrl(): BarrageAnchor[] {
  const value = getAnchorsQueryRaw();

  return value ? parseAnchorsText(value) : [];
}

/**
 * 生成带当前编排的分享链接
 * @desc 多设备之间没有共享存储时，地址栏就是分发介质：其他设备打开这个
 *   链接，首次加载会按 `barrageAnchors` 应用同一套时间轴。
 *
 *   只改地址栏参数，不会跳转；工作台里点「复制链接」时调用。
 */
export function buildAnchorsShareUrl(raw: string): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const url = new URL(window.location.href);
  url.searchParams.set(ANCHORS_QUERY_KEY, raw);

  return url.toString();
}
