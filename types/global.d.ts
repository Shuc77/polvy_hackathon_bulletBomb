import type { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import type { ComputedRef, Ref } from 'vue';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends Record<string, unknown> {}

  interface HTMLElement {
    __vueVm?: Vue;
  }

  /** 代表任意的函数类型 */
  type AnyFunc = (...arg: unknown[]) => unknown;

  /** 响应式 Ref，包括 ComputedRef 和 Ref */
  type ResponsiveRef<T = unknown> = ComputedRef<T> | Ref<T>;

  type RefOrElement<E = unknown> = Ref<E> | HTMLElement;

  /** 没有参数的方法类型 */
  type EmptyParamsFunc = () => unknown;

  /** 通用对象定义 */
  type UniversalParams<V = unknown> = {
    [key: string]: V;
  };

  /** 项目构建时间 */
  const PROJECT_BUILD_TIME: string;

  /** 项目版本号 */
  const PROJECT_VERSION: string;

  /** 观看页 SDK 加载的环境 */
  const WATCH_SDK_ENV: SdkLoaderEnv;

  interface NavigatorLanguage {
    readonly browserLanguage: string;
  }
}
