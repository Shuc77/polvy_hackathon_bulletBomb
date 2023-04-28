/**
 * @file Vue 的 props 工具
 */
import { IconComponentOption } from '@polyv/icons-vue/icon-builder';
import { computed, ComputedRef, ExtractPropTypes } from 'vue';
import {
  string as _string,
  number as _number,
  bool as _bool,
  object as _object,
  func as _func,
  oneOf as _oneOf,
  array as _array,
  oneOfType as _oneOfType,
  VueTypeValidableDef,
} from 'vue-types';

/** Vue prop 配置工具 */
export class PropUtils {
  /** String 类型，默认：'' */
  static get string() {
    return _string().def('');
  }

  /** String 类型，默认：undefined */
  static get looseString() {
    return _string();
  }

  /** Number 类型，默认：0 */
  static get number() {
    return _number().def(0);
  }

  /** Number 类型，默认：undefined */
  static get looseNumber() {
    return _number();
  }

  /** Boolean 类型，默认：true */
  static get bool() {
    return _bool().def(true);
  }

  static readonly objectType = _object;

  /** Array 类型，默认：[] */
  static readonly array = <T = unknown>() => {
    return _array<T>().def([]);
  };

  /** Object 类型 */
  static readonly object = _object;

  /** Function 类型 */
  static readonly func = _func;

  /** 指定为数组中的值 */
  static readonly oneOf = _oneOf;

  /** 自定义类型 */
  static readonly oneOfType = _oneOfType;

  /** 枚举类型 */
  static readonly enum = _string;

  /** 图标组件类型 */
  static readonly icon = (): VueTypeValidableDef<IconComponentOption> => {
    return {
      type: undefined,
      default: undefined,
      required: false,
    } as VueTypeValidableDef<IconComponentOption>;
  };
}

export type VueProps<FN extends () => UniversalParams> = Readonly<ExtractPropTypes<ReturnType<FN>>>;

export type FormatProps<FN extends () => UniversalParams> = Partial<
  ExtractPropTypes<ReturnType<FN>>
>;

export type PropComputedRefs<P extends object> = {
  [K in keyof P]: ComputedRef<P[K]>;
};

/** 结构 props，将 props 转成 computed */
export const useProps = <P extends object>(props: P): PropComputedRefs<P> => {
  const ret: PropComputedRefs<P> = {} as PropComputedRefs<P>;
  for (const key in props) {
    ret[key] = computed(() => props[key]);
  }
  return ret;
};
