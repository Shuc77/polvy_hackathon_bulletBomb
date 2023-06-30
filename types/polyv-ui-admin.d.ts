/* eslint-disable no-duplicate-imports */
/* eslint-disable @typescript-eslint/no-duplicate-imports */
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
