import { useGlobalInject } from '@/app/use-global-inject';
import { isSupportWebp } from '@/assets/utils/image';

export const useResizeOssImage = () => {
  const { getWatchCore } = useGlobalInject();

  /**
   * 重置 oss 的图片尺寸
   * @param url 图片地址
   * @param width 宽度
   * @param height 高度
   */
  function resizeOSSImg(url: string, width?: number, height?: number): string {
    try {
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

      const watchCore = getWatchCore();
      const staticDomain = watchCore.domain.getDomainInfo().staticDomain;

      if (!staticDomain.includes(host) || search) {
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
    } catch (error) {
      return url;
    }
  }

  function resizeHtmlContentImg(htmlContent: string): string {
    if (!htmlContent) {
      return '';
    }
    return htmlContent.replace(
      /(<img.*?\ssrc=)(["']?)(.+?)\2(.*?>)/gi,
      (match, before, quot, src, after) => {
        return before + '"' + resizeOSSImg(src, 1680) + '"' + ' data-src="' + src + '"' + after;
      },
    );
  }

  return {
    resizeOSSImg,
    resizeHtmlContentImg,
  };
};
