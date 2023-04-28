/**
 * @file 加载阿里云 awsc.js
 */
import { loadScript } from '@just4/load-script';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loadPromise: Promise<any> | undefined;

/**
 * 加载阿里云 awsc.js
 */
export const loadAliAwsc = () => {
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      (async () => {
        await loadScript('https://g.alicdn.com/AWSC/AWSC/awsc.js');

        if (window.AWSC) {
          resolve(window.AWSC);
        } else {
          reject(new Error('loadAliAwsc fail, window.AWSC is undefined'));
        }
      })();
    });
  }

  return loadPromise;
};
