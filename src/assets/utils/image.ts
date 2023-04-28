/**
 * @file 和图片相关的工具函数
 */
import { changeProtocol, startsWithProtocol } from '@utils-ts/net';

/**
 * 重置图片的地址
 * @param url 图片地址
 */
export function resetImageProtocol(url: string): string {
  // 如果当前页面是 http 协议则用 http
  if (startsWithProtocol(location.href, ['http'])) {
    return changeProtocol(url, 'http');
  }

  // 其余情况都用 https
  return changeProtocol(url, 'https');
}

/**
 * 重置 oss 的图片尺寸
 * @param url 图片地址
 * @param width 宽度
 * @param height 高度
 */
export function resizeOSSImg(url: string, width?: number, height?: number): string {
  if (!url) {
    return url;
  }

  const a = document.createElement('a');
  a.href = url;

  const host = a.host.toLowerCase();
  const search = a.search;

  if (host !== 'liveimages.videocc.net' || search) {
    return url;
  }

  let result = url + '?x-oss-process=image/resize,mfit';
  if (width) {
    result += ',w_' + width;
  }
  if (height) {
    result += ',h_' + height;
  }
  result += ',limit_1';
  return result;
}

/**
 * 获取图片地址的尺寸
 * @param url 图片地址
 * @returns 尺寸与图片实例
 */
export function getImgSize(
  url: string,
): Promise<{ width: number; height: number; imgTarget: HTMLImageElement }> {
  return new Promise<{ width: number; height: number; imgTarget: HTMLImageElement }>(
    (resolve, reject) => {
      const img = new Image();
      const resolvePromise = () => {
        resolve({
          width: img.width,
          height: img.height,
          imgTarget: img,
        });
      };
      img.onload = () => {
        resolvePromise();
      };
      img.onerror = (
        event: Event | string,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error,
      ) => {
        const reason = error?.message || '未知原因';
        reject(new Error(`获取图片尺寸失败：${reason}`));
      };
      img.src = url;
      if (img.complete) {
        resolvePromise();
      }
    },
  );
}
