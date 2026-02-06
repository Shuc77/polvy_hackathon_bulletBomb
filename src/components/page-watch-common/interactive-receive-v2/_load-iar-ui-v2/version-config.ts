/* eslint-disable sonarjs/no-duplicate-string */
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import camelCase from 'camelcase';

export const iarUIVersions = {
  /** 签到 */
  'iar-check-in-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260205',
    [SdkLoaderEnv.Rc]: 'rc-20260205',
    [SdkLoaderEnv.Test]: 'dev-20260205',
    components: ['pc-check-in', 'mobile-check-in', 'portrait-check-in'] as const,
  },

  /** 抽奖 */
  'iar-lottery-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260205',
    [SdkLoaderEnv.Rc]: 'rc-20260205',
    [SdkLoaderEnv.Test]: 'dev-20260205',
    components: ['lottery-pendant', 'lottery-dialog', 'lottery-record'] as const,
  },

  /** 答题卡 */
  'iar-answer-card-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260205',
    [SdkLoaderEnv.Rc]: 'rc-20260205',
    [SdkLoaderEnv.Test]: 'dev-20260205',
    components: ['quick-answer-card', 'answer-card-dialog'] as const,
  },

  /** 问答 */
  'iar-questionnaire-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260205',
    [SdkLoaderEnv.Rc]: 'rc-20260205',
    [SdkLoaderEnv.Test]: 'dev-20260205',
    components: ['normal-questionnaire', 'questionnaire-dialog'] as const,
  },

  /** 优惠券 */
  'iar-coupon-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260205',
    [SdkLoaderEnv.Rc]: 'rc-20260205',
    [SdkLoaderEnv.Test]: 'dev-20260205',
    components: [
      'normal-coupon-common-list',
      'normal-coupon-user-list',
      'normal-coupon-pendant',
    ] as const,
  },

  /** 平台抽奖 */
  'iar-lucky-lottery-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260205',
    [SdkLoaderEnv.Rc]: 'rc-20260205',
    [SdkLoaderEnv.Test]: 'dev-20260205',
    components: [
      'lucky-lottery-pendant',
      'mobile-lucky-lottery-detail',
      'mobile-lucky-lottery-list',
      'mobile-lucky-lottery-prize-list',
      'mobile-lucky-lottery-receive',
    ] as const,
  },

  /** 投票 */
  'iar-vote-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260205',
    [SdkLoaderEnv.Rc]: 'rc-20260205',
    [SdkLoaderEnv.Test]: 'dev-20260205',
    components: ['vote-list', 'vote-pendant', 'vote-list-popup', 'vote-rule-popup'] as const,
  },
  /** 公告 */
  'iar-bulletin-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260205',
    [SdkLoaderEnv.Rc]: 'rc-20260205',
    [SdkLoaderEnv.Test]: 'dev-20260205',
    components: [
      'bulletin-popup',
      'bulletin-topping',
      'pc-bulletin-entrance',
      'mobile-bulletin-entrance',
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
