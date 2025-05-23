/* eslint-disable sonarjs/no-duplicate-string */
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import camelCase from 'camelcase';

export const iarUIVersions = {
  /** 签到 */
  'iar-check-in-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250522',
    [SdkLoaderEnv.Rc]: 'rc-20250522',
    [SdkLoaderEnv.Test]: 'dev-20250522',
    components: ['pc-check-in', 'mobile-check-in', 'portrait-check-in'] as const,
  },

  /** 抽奖 */
  'iar-lottery-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250522',
    [SdkLoaderEnv.Rc]: 'rc-20250522',
    [SdkLoaderEnv.Test]: 'dev-20250522',
    components: ['lottery-pendant', 'lottery-dialog', 'lottery-record'] as const,
  },

  /** 问答 */
  'iar-questionnaire-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250522',
    [SdkLoaderEnv.Rc]: 'rc-20250522',
    [SdkLoaderEnv.Test]: 'dev-20250522',
    components: ['normal-questionnaire'] as const,
  },

  /** 奖励领取 */
  'iar-reward-receive-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250522',
    [SdkLoaderEnv.Rc]: 'rc-20250522',
    [SdkLoaderEnv.Test]: 'dev-20250522',
    components: ['reward-receive'] as const,
  },

  /** 优惠券 */
  'iar-coupon-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250522',
    [SdkLoaderEnv.Rc]: 'rc-20250522',
    [SdkLoaderEnv.Test]: 'dev-20250522',
    components: [
      'normal-coupon-common-list',
      'normal-coupon-user-list',
      'normal-coupon-pendant',
    ] as const,
  },

  /** 平台抽奖 */
  'iar-lucky-lottery-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250522',
    [SdkLoaderEnv.Rc]: 'rc-20250522',
    [SdkLoaderEnv.Test]: 'dev-20250522',
    components: [
      'lucky-lottery-pendant',
      'mobile-lucky-lottery-detail',
      'mobile-lucky-lottery-list',
      'mobile-lucky-lottery-prize-list',
      'mobile-lucky-lottery-receive',
    ] as const,
  },
};

export type IarUIVersionConfig = typeof iarUIVersions;

/** 互动 UI 类型 */
export type IarUIType = keyof IarUIVersionConfig;

/** 互动 UI 组件 */
export type IarUIComponents<T extends IarUIType> = IarUIVersionConfig[T]['components'][number];

/**
 * 获取互动组件全局变量名
 * @param componentName 组件名
 */
export function getUmdGlobalVariable(componentName: string) {
  return 'PolyvIarUI' + camelCase(componentName, { pascalCase: true });
}
