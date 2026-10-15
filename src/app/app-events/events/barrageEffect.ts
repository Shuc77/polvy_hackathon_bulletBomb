/**
 * 弹幕特效事件
 * @desc 特效层与弹幕层之间的通路。走 app 级的 emitter 而不是模块级单例 ——
 *   本仓库支持 `useMultiPolyvWatchApp` 多实例观看，模块单例是全局的，
 *   两个播放器会互相串数据。
 */
export const barrageEffectEvents = {
  /**
   * 一条弹幕成功上屏
   * @param {{ text: string, self: boolean, at: number }} payload
   *   `at` 是 `performance.now()`（单调时钟）。不用 `Date.now()`：
   *   系统时钟回拨会让环形缓冲的「从尾部往前扫」直接失效
   */
  BarrageLanded: 'BarrageLanded',

  /**
   * 外部注入分派数据
   * @desc 答题卡、榜单、二屏、运营手输都能从这里喂进来，走的是与关键词解析
   *   完全相同的一条管子。这是「接真实观众数据」在拿不到投票票数时的兜底通路
   * @param {{ primary: number, secondary: number }} payload
   */
  PolarityInjected: 'PolarityInjected',
};
