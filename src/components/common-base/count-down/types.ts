import { tupleString } from '@/assets/utils/array';

export const countDownSizes = tupleString('default', 'small');
export type CountDownSize = typeof countDownSizes[number];

export const countdownThemes = tupleString('square', 'text');
export type CountDownTheme = typeof countdownThemes[number];
