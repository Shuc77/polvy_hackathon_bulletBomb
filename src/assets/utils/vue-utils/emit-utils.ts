import { EmitFn, ObjectEmitsOptions } from 'vue/types/v3-setup-context';

type EmitFuncType<P = void> = (arg: P) => void;

/**
 * 创建 emit 配置的空函数
 */
export const emitFunc = <P = void>(): EmitFuncType<P> => (() => true) as EmitFuncType<P>;

export type VueEmit<F extends () => ObjectEmitsOptions> = EmitFn<ReturnType<F>>;

type UpdateEmitReturn<K extends string, P = void> = Record<`update:${K}`, EmitFuncType<P>>;

export function updateModelEmit<K extends string, P>(field: K) {
  return {
    [`update:${field}`]: () => true,
  } as unknown as UpdateEmitReturn<K, P>;
}
