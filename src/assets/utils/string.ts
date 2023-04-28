/**
 * @file 跟字符串相关的工具方法
 */

import { resizeOSSImg } from './image';

/**
 * 将字符串中的&nbsp;转换为空格
 * 背景：新版观看在做英文自动折行时，如果后端返回的富文本字符串包含&nbsp;，依然会存在换行切割单词的问题，因此需要做这个转换
 * 影响：如果出现连续空格的情况，使用该方法转换后，只会存在一个空格；目前会在使用的地方增加white-space: pre-wrap处理
 * 目前应用范围：对后端返回的富文本字符串进行转换，包括直播介绍、报名观看的隐私政策
 * @param str 需要处理的字符串
 */
export function nbspToSpace(str: string): string {
  return String(str).replace(/&nbsp;/g, ' ');
}

/**
 * 将富文本字符串中的图片地址进行大小处理
 * @param htmlContent 富文本字符串
 */
export function resizeHtmlContentImg(htmlContent: string): string {
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

export function isString(target: unknown): target is string {
  return typeof target === 'string';
}

/**
 * html字符串提取纯文本
 */
export function htmlStr2Text(htmlStr: string): string | null {
  if (!htmlStr) return '';
  const dom = document.createElement('div');
  dom.innerHTML = htmlStr;
  return dom.textContent;
}

/**
 * 将字符串中的链接转成 a 标签
 * @param text 目标字符串
 */
export function parseLinkContent(text: string) {
  const linkReg = /(http[s]?:\/\/)([\w-]+(\.[\w-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?)/g;

  return text.replace(linkReg, '<a target="_blank" rel="noopener" href="$1$2">$1$2</a>');
}
