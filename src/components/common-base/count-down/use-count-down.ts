import { translate } from '@/assets/lang';
import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils, useProps, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { useSecondCountDown } from '@/hooks/tools/use-count-down';
import { IRemaining as CountDownSurplusData } from '@utils-ts/countdown';
import { computed, unref, watch } from 'vue';
import { countDownSizes, countdownThemes } from './types';

export const countDownCommonProps = () => ({
  /** 计时时间，优先级高于 endTimestamp */
  second: PropUtils.number.def(undefined),
  /** 结束的时间戳 */
  endTimestamp: PropUtils.number.def(undefined),
  /** 只有 0 天时是否隐藏天数，默认：true */
  hideZeroDays: PropUtils.bool.def(true),
  /** 只有 0 小时时是否隐藏小时，默认：false */
  hideZeroHours: PropUtils.bool.def(false),
});

export const countDownProps = () => ({
  ...countDownCommonProps(),
  /** 尺寸，small-小型尺寸，常用于移动端 */
  size: PropUtils.oneOf(countDownSizes).def('default'),
  /** 倒计时样式，square-方形，text-文本，默认：square */
  theme: PropUtils.oneOf(countdownThemes).def('square'),
});

/**
 * 倒计时组件的 emit 配置
 */
export const countDownEmits = () => ({
  /** 倒计时改变 */
  'count-down-change': emitFunc<CountDownSurplusData>(),
  /** 倒计时结束 */
  'count-down-finish': emitFunc<void>(),
});

export type CountDownField = 'days' | 'hours' | 'minutes' | 'seconds';

export interface CountDownFieldItem {
  /** 字段名 */
  field: CountDownField;
  /** 标题 */
  title: string;
  /** 时间单位，多语言 */
  unit: string;
}

export interface CountDownItem {
  /** 数值 */
  count: number;
  /** 数值文案，自动补 0 */
  text: string;
  /** 标题 */
  title: string;
  /** 时间单位，含多语言 */
  unit: string;
}

/**
 * 倒计时 hook
 * @param {Object} options 选项
 * @param {Proxy} options.second 总秒数，单位：秒
 * @param {Proxy} options.endTimestamp 结束的时间戳
 * @param {Proxy} options.hideZeroDays 当天数为 0 时隐藏天数，默认：true
 * @param {Function} options.emit 回调方法
 */
export const useCountDown = (options: {
  props: VueProps<typeof countDownCommonProps>;
  emit: VueEmit<typeof countDownEmits>;
}) => {
  const { props, emit } = options;
  const { hideZeroDays, hideZeroHours, second, endTimestamp } = useProps(props);

  const { surplusTime, computedSecond, initCountDown, startCountDown, stopCountDown } =
    useSecondCountDown({
      second,
      endTimestamp,
      onCountDownChange: data => emit('count-down-change', data),
      onCountDownFinish: () => emit('count-down-finish'),
    });

  /** 显示的时间内容列表 */
  const timeContents = computed(() => {
    const contents: CountDownItem[] = [];

    const surplusVal = unref(surplusTime);

    const fields: CountDownFieldItem[] = [
      { field: 'days', title: translate('unit.dayTitle'), unit: translate('unit.day') },
      { field: 'hours', title: translate('unit.hourTitle'), unit: translate('unit.hour') },
      { field: 'minutes', title: translate('unit.minuteTitle'), unit: translate('unit.minute') },
      { field: 'seconds', title: translate('unit.secondTitle'), unit: translate('unit.second') },
    ];

    fields.forEach(({ field, title, unit }) => {
      const count = surplusVal[field];

      // 对于 0 天则不在显示列表中
      if (unref(hideZeroDays) && field === 'days' && count === 0) {
        return;
      }

      // 对于 0 小时则不在显示列表中
      if (unref(hideZeroHours) && field === 'hours' && count === 0) {
        return;
      }

      contents.push({
        // 数值
        count,
        // 数值文案，自动补 0
        text: formatNumber(count),
        // 标题
        title,
        // 单位，含多语言
        unit: unref(unit),
      });
    });

    return contents;
  });

  /**
   * 显示的时间文案
   * @example
   * 01 天 10 时 22 分 30 秒
   */
  const timeText = computed(() => {
    const texts: string[] = [];

    unref(timeContents).forEach(data => {
      texts.push(`${data.text} ${data.unit}`);
    });

    return texts.join(' ');
  });

  /** 格式化数值，自动补 0 */
  function formatNumber(count: number): string {
    return count < 10 ? `0${count}` : count.toString();
  }

  watch(
    () => unref(computedSecond),
    () => initCountDown(),
    {
      immediate: true,
    },
  );

  return {
    surplusTime,
    timeContents,
    timeText,
    startCountDown,
    stopCountDown,
  };
};
