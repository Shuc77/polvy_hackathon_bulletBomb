/**
 * @file 帧率无关的缓动
 * @desc 「动态实时拉扯」的全部来源。新弹幕到达时支持占比是**阶跃**的，
 *   直接写进 `applyParams` 就是缝在跳 —— 观众看到的是抽搐，不是拉扯。
 *
 *   放在驱动层，**绝不放进模板**：模板的契约是「来自 params 的量在绘制时读取」，
 *   缓动是**生产者**的事。放进去七个模板各写一份，而且 `applyParams` 的语义会从
 *   「写入」变成「写入目标值」—— 工作台拖滑块会从「立即生效」变成「慢慢爬过去」，
 *   作者会以为滑块坏了。
 */

/** 默认时间常数，单位：秒。约 1.2 秒到 95% */
export const PULL_TAU = 0.45;

/**
 * 一阶低通：`current` 以时间常数 `tau` 追 `target`
 *
 * @desc 用 `1 - exp(-delta / tau)` 而不是 `k * delta`：
 *   后者帧率相关 —— 掉帧时缓动会变慢，而且 ticker 会把 delta 夹到 0.1，
 *   帧率一抖缓动速度就变。指数形式对任意 delta 都给出同一条收敛曲线。
 *
 *   为什么是「指数逼近」而不是「补间到目标」：目标值**一直在动**
 *   （每来一条弹幕占比就变），补间会被无限重启并产生速度跳变。
 *   一阶低通的输出天然滞后于投票，观感就是「缝被观众拽着走」。
 *   它还永不超调，所以 bias 不可能把缝甩出画面。
 */
export function easeToward(current: number, target: number, delta: number, tau: number): number {
  if (tau <= 0.001) {
    return target;
  }

  return current + (target - current) * (1 - Math.exp(-delta / tau));
}
