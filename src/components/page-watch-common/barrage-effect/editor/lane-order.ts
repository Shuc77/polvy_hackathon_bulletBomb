/**
 * @file 时间轴条带的显示优先级
 * @desc 只按起点排序的话，把一条**新**特效拖到已有特效左边时，它会因为
 *   起点更小而抢到最上面的轨道，把原来的特效挤下去 —— 作者看到的是
 *   「我新加的东西把老东西顶走了」。这里按「第一次被时间轴看见的顺序」
 *   给每条锚点一个稳定优先级：老特效先占轨，新特效排到下面。
 *   一开始拖动就把被拖的那条排到最后 —— 正在动的那条让着停着的，
 *   这样「想往前放」时不会反过来把老特效顶走。放在拖动起点而不是
 *   松手时，拖动中的分轨预览才和最终落盘一致。
 *
 *   ★ 单独放在模块里，而不是写在 `effect-timeline.vue` 的 `<script setup>`：
 *   `<script setup>` 的顶层代码每个组件实例执行一次，工作台是 `v-if`，
 *   关掉再开就会重建，优先级会被清空。
 *
 *   它只是显示层状态，不写进锚点，也不影响导出、分享和同步。
 */

const displayOrder = new Map<string, number>();
let displayOrderSeed = 0;

/** 取显示优先级；第一次见到时排到当前末尾 */
export function displayOrderOf(id: string): number {
  const known = displayOrder.get(id);

  if (known !== undefined) {
    return known;
  }

  const order = displayOrderSeed;
  displayOrderSeed += 1;
  displayOrder.set(id, order);

  return order;
}

/**
 * 把一条锚点排到最下面
 * @desc 拖动开始时走这里：正在动的那条应该让着停着的，
 *   而不是因为起点更早就把老特效挤下去。
 *   新增锚点第一次被分轨时也会拿到当前最大的序号，效果相同
 */
export function sinkDisplayOrder(id: string): void {
  const order = displayOrderSeed;
  displayOrderSeed += 1;
  displayOrder.set(id, order);
}
