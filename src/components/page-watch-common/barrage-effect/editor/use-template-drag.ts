/**
 * @file 模板拖拽会话
 * @desc 把模板从模板库拖到时间轴上新建锚点。
 *
 * 走的是仓库的既有惯例（mousedown + document 级 mousemove/mouseup），而不是 HTML5 拖放 ——
 * 全仓库没有一处用 `dataTransfer`，混用会多出一套没验证过的事件语义。
 *
 * 做成模块级单例是因为拖拽源（模板库）和投放目标（时间轴）是兄弟组件，
 * 让工作台用 props/callback 往下传反而更绕。
 *
 * 刻意**不做跟随指针的浮动幽灵**：时间轴上的插入线已经说明了落点，
 * 少一套 DOM 定位就少一处会飘的地方。
 */
import { computed, ref } from 'vue';
import type { EffectTemplateName } from '../types';
import { pointerClientX, pointerClientY } from './pointer-utils';

/** 超过该像素位移才算拖拽，否则当点击处理 */
const DRAG_THRESHOLD = 5;

/** 拖拽结束后挡掉补发 click 的时间窗，单位：毫秒 */
const CLICK_SUPPRESS_MS = 200;

/** 落点时间 */
export interface TemplateDropPoint {
  time: number;
  /** 该点是否允许新建锚点 */
  valid: boolean;
}

export interface TemplateDropTarget {
  /** 解析落点；返回 null 表示指针不在轨道上 */
  resolve: (clientX: number, clientY: number) => TemplateDropPoint | null;
  /** 落点变化时回调，已按「时间 + 是否可投放」去重，避免每个 mousemove 都重渲染 */
  onHover: (point: TemplateDropPoint | null) => void;
  /** 松手投放。模板由会话带过来，投放方不必再去读一遍拖拽状态 */
  onDrop: (point: TemplateDropPoint, template: EffectTemplateName) => void;
}

const draggingTemplate = ref<EffectTemplateName>();

const isDragging = computed(() => draggingTemplate.value !== undefined);

let pendingTemplate: EffectTemplateName | undefined;
let target: TemplateDropTarget | undefined;

let pressX = 0;
let pressY = 0;
let started = false;
let lastHoverKey = '';
let suppressClickUntil = 0;

function detachListeners(): void {
  document.removeEventListener('mousemove', onPointerMove);
  document.removeEventListener('mouseup', onPointerUp);
  document.removeEventListener('touchmove', onPointerMove);
  document.removeEventListener('touchend', onPointerUp);
}

function reset(): void {
  detachListeners();

  pendingTemplate = undefined;
  draggingTemplate.value = undefined;
  started = false;
  lastHoverKey = '';
}

function onPointerMove(event: MouseEvent | TouchEvent): void {
  const clientX = pointerClientX(event);
  const clientY = pointerClientY(event);

  if (!started) {
    // 低于阈值时什么都不做，让卡片自己的 click 正常触发
    if (Math.hypot(clientX - pressX, clientY - pressY) < DRAG_THRESHOLD) {
      return;
    }

    started = true;
    draggingTemplate.value = pendingTemplate;
  }

  const point = target?.resolve(clientX, clientY) ?? null;
  const hoverKey = point ? `${point.time.toFixed(1)}:${point.valid}` : '';

  if (hoverKey !== lastHoverKey) {
    lastHoverKey = hoverKey;
    target?.onHover(point);
  }
}

function onPointerUp(event: MouseEvent | TouchEvent): void {
  const dropped = started;
  const template = pendingTemplate;
  const clientX = pointerClientX(event);
  const clientY = pointerClientY(event);

  // reset() 会把落点与模板一起清掉，先把要用的值取出来
  reset();

  if (!dropped || !template) {
    return;
  }

  // 拖着卡片松手时，若指针恰好回到卡片上，浏览器会补一次 click；让源头把它挡掉
  suppressClickUntil = Date.now() + CLICK_SUPPRESS_MS;

  const point = target?.resolve(clientX, clientY) ?? null;

  target?.onHover(null);

  if (point?.valid) {
    target?.onDrop(point, template);
  }
}

/** 开始一次拖拽会话，通常在卡片上 mousedown 时调用 */
export function beginTemplateDrag(
  template: EffectTemplateName,
  event: MouseEvent | TouchEvent,
): void {
  reset();

  pendingTemplate = template;
  pressX = pointerClientX(event);
  pressY = pointerClientY(event);

  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);
  document.addEventListener('touchmove', onPointerMove, { passive: false });
  document.addEventListener('touchend', onPointerUp);
}

/** 时间轴挂载时注册自己为投放目标 */
export function registerTemplateDropTarget(dropTarget: TemplateDropTarget): () => void {
  target = dropTarget;

  return () => {
    if (target === dropTarget) {
      target = undefined;
    }
  };
}

/**
 * 是否应当吞掉这次 click
 * @desc 一次性：问过一次就作废，避免把后续的正常点击也吃掉
 */
export function shouldSuppressDragClick(): boolean {
  if (Date.now() >= suppressClickUntil) {
    return false;
  }

  suppressClickUntil = 0;

  return true;
}

export function useTemplateDrag() {
  return {
    draggingTemplate,
    isDragging,
  };
}
