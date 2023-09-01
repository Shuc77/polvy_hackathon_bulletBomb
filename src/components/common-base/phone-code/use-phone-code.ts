/**
 * @file 手机区号选择 hook
 */

import { isUndefined } from 'lodash-es';
import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { computed, ref, unref } from 'vue';
import codeList from './phone-code-data';

export const PhoneCodeEmits = ['input'];

export type PhoneCodeDataItem = typeof codeList[number];

export const phoneCodeProps = () => ({
  value: PropUtils.string.def(''),
});

export const phoneCodeEmits = () => ({
  input: emitFunc<string>(),
});

export const usePhoneCode = (options: {
  props: VueProps<typeof phoneCodeProps>;
  emit: VueEmit<typeof phoneCodeEmits>;
}) => {
  const { props, emit } = options;

  /** 搜索的关键词 */
  const searchKey = ref('');

  /** 所有首字母列表 */
  const letterList = computed(() => {
    return codeList.filter(item => item.letter);
  });

  const phoneCodeList = computed(() => {
    if (!unref(searchKey)) {
      return codeList;
    }

    return codeList.filter(item => {
      if (item.letter) {
        return false;
      }

      if (item.code && item.code.indexOf(unref(searchKey)) !== -1) {
        return true;
      }

      if (item.country && item.country.indexOf(unref(searchKey)) !== -1) {
        return true;
      }

      return false;
    });
  });

  /** 区号选择列表 ref */
  const codeListRef = ref();

  /** 滚动到某个字母中 */
  function scrollToLetter(letter: string | undefined) {
    const codeListElem = unref(codeListRef);
    if (!codeListElem || !letter) {
      return;
    }

    const targetLetterEl = codeListElem.querySelector(`[date-letter=${letter}]`);

    targetLetterEl && targetLetterEl.scrollIntoView();
  }

  /** 处理点击区号 */
  function onClickCountry(item: PhoneCodeDataItem) {
    if (isUndefined(item.code)) return;
    if (props.value === item.code) return;

    emit('input', item.code);
  }

  return {
    searchKey,
    phoneCodeList,
    letterList,
    codeListRef,
    scrollToLetter,
    onClickCountry,
  };
};
