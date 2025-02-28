/* eslint-disable sonarjs/no-duplicate-string */
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import camelCase from 'camelcase';

export const iarUIVersions = {
  /** 签到 */
  'iar-check-in-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250213',
    [SdkLoaderEnv.Rc]: 'rc-20250213',
    [SdkLoaderEnv.Test]: 'feature-change-build',
    components: ['pc-check-in', 'mobile-check-in', 'portrait-check-in'] as const,
  },

  /** 抽奖 */
  'iar-lottery-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250213',
    [SdkLoaderEnv.Rc]: 'rc-20250213',
    [SdkLoaderEnv.Test]: 'feature-change-build',
    components: [
      'pc-lottery-record',
      'mobile-lottery-record',
      'pc-lottery-receive',
      'mobile-lottery-receive',
    ] as const,
  },

  /** 问答 */
  'iar-questionnaire-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250213',
    [SdkLoaderEnv.Rc]: 'rc-20250213',
    [SdkLoaderEnv.Test]: 'feature-change-build',
    components: ['normal-questionnaire'] as const,
  },

  /** 奖励领取 */
  'iar-reward-receive-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20250213',
    [SdkLoaderEnv.Rc]: 'rc-20250213',
    [SdkLoaderEnv.Test]: 'feature-change-build',
    components: ['pc-reward-receive', 'mobile-reward-receive'] as const,
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
