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
