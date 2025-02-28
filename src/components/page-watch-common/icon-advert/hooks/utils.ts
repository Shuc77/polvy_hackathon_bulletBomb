/** @file 关于h5跳转微信的一些能力函数 */
const ua = navigator.userAgent.toLowerCase();
/**
 * 获取微信版本
 */
export const getWeixinVersion = () => {
  const regData = ua.match(/micromessenger\/([\d.]+)/i);
  return regData && regData.length ? regData[1] : '';
};

/**
 * 比较两个版本号，version1高于version2返回大于0
 * @param {String} version1
 * @param {String} version2
 */
export const compareVersions = (version1: string, version2: string) => {
  const reg = /(\.0+)+$/;
  const segA = version1.replace(reg, '').split('.');
  const segB = version2.replace(reg, '').split('.');
  const len = Math.min(segA.length, segB.length);
  for (let i = 0; i < len; i++) {
    const diff = parseInt(segA[i], 10) - parseInt(segB[i], 10);
    if (diff) {
      return diff;
    }
  }
  return segA.length - segB.length;
};
