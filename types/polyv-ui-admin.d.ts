/* eslint-disable no-duplicate-imports */

declare module '@polyv/polyv-ui/lib-admin/popper-manager' {
  type PopperManager = {
    /** 为元素设置 z-index 属性 */
    openPopper: (elem: HTMLElement) => void;
    zIndex: number;
  };
  const manager: PopperManager;
  export default manager;
}

/**
 * 图片浏览
 */
declare module '@polyv/polyv-ui/lib-admin/image-preview' {
  import { ImagePreviewOptions } from '@/plugins/polyv-ui/types';

  export interface ImagePreviewInstance {
    /** 关闭 */
    close(): void;
  }

  function ImagePreview(
    images: string | string[],
    options: ImagePreviewOptions,
  ): ImagePreviewInstance;

  export default ImagePreview;
}

/**
 * 折叠动画
 */
declare module '@polyv/polyv-ui/lib-admin/collapse-transition' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 图标
 */
declare module '@polyv/polyv-ui/lib-admin/icon' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 图片粘贴输入框
 */
declare module '@polyv/polyv-ui/lib-admin/input-paste-image' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 栅格布局
 */
declare module '@polyv/polyv-ui/lib-admin/row' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}
declare module '@polyv/polyv-ui/lib-admin/col' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 分页器
 */
declare module '@polyv/polyv-ui/lib-admin/pagination' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 滑块
 */
declare module '@polyv/polyv-ui/lib-admin/slider' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 文字描述
 */
declare module '@polyv/polyv-ui/lib-admin/tips' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 复选框
 */
declare module '@polyv/polyv-ui/lib-admin/checkbox' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 弹层
 */
declare module '@polyv/polyv-ui/lib-admin/popper' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 级联选择器
 */
declare module '@polyv/polyv-ui/lib-admin/cascader' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 直播封面图
 */
declare module '@polyv/polyv-ui/lib-admin/channel-cover' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

declare module '@polyv/polyv-ui/lib-admin/text-ellipsis' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * Markdown 渲染
 */
declare module '@polyv/polyv-ui/lib-admin/markdown-render' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 按钮
 */
declare module '@polyv/polyv-ui/lib-admin/button' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 数字输入框
 * @desc `min` 默认为 0、`max` 默认为 Infinity
 */
declare module '@polyv/polyv-ui/lib-admin/input-number' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 颜色选择器
 * @desc 组件的 `model` 是 `{ prop: 'value', event: 'change' }`，
 *   所以 `v-model` 正常可用，手写时对应 `:value` + `@change`。
 *   面板的挂载点由 popper mixin 的 `appendToBody` 控制，**默认 true** ——
 *   在整屏浮层里必须显式传 `false`，否则会挂到 body 上被浮层的 z-index 盖住。
 */
declare module '@polyv/polyv-ui/lib-admin/color-picker' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 下拉选择器
 * @desc 选项字段名由 `optionsField` 控制，默认 `{ label: 'label', value: 'value' }`
 */
declare module '@polyv/polyv-ui/lib-admin/select' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

/**
 * 标签
 */
declare module '@polyv/polyv-ui/lib-admin/tag' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}
