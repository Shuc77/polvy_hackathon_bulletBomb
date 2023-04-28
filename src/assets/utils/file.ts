/**
 * @file 和文件相关的工具方法
 */
import { changeProtocol } from '@utils-ts/net';
import { isIframe, isMobile, isWeixin } from './browser';

/**
 * 获取文件后缀名
 * @param fileName 文件名
 */
export function getFileSuffix(fileName: string): string {
  const result = fileName.match(/[^.]+$/);
  if (!result) return '';
  return result[0].toLocaleLowerCase();
}

/**
 * 下载文件
 * @param fileUrl 文件地址
 * @param fileName 文件名
 */
export function downloadFile(fileUrl: string, fileName: string) {
  const path = changeProtocol(fileUrl, 'https');
  const a = document.createElement('a');
  a.setAttribute('target', '_blank');

  // 在 iframe 下上报事件到父窗口中进行下载
  if (isIframe) {
    const record = { name: 'file', path };
    window.parent.postMessage(record, '*');
    return;
  }

  // 移动端与微信
  if (isWeixin || isMobile) {
    a.href = path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  const xhr = new window.XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.responseType = 'blob';
  xhr.onload = () => {
    const blobUrl = window.URL.createObjectURL(xhr.response);
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    a.remove();
  };
  xhr.send();
}
