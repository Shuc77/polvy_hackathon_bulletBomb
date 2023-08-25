/**
 * @file 和图片相关的工具函数
 */

/**
 * 判断浏览器是否支持webp格式
 */
export const isSupportWebp = (() => {
  try {
    return (
      document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0
    );
  } catch (err) {
    return false;
  }
})();

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

  if (!width && !height) {
    console.warn('需要指定图片的宽度或者高度才能进行调整');
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
    result += ',w_' + Math.round(width);
  }

  if (height) {
    result += ',h_' + Math.round(height);
  }

  if (isSupportWebp) {
    result += '/format,webp';
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
