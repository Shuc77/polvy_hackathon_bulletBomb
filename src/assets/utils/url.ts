/**
 * @file 与地址有关的工具方法
 */
import { changeProtocol } from '@utils-ts/net';

/**
 * 将 url 修改成当前访问协议/补全协议头
 * @param url 目标 url
 */
export function fitProtocol(url: string): string {
  const matchRs = /^(http(s?)):/.exec(location.href);
  const protocol = (matchRs && matchRs[1]) || 'https';

  return changeProtocol(url, protocol);
}
