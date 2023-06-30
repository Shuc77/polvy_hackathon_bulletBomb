import { DefineComponent, ref, shallowRef } from 'vue';
import { formatDate } from '@utils-ts/date';
import { PageContent } from '@polyv/live-watch-sdk';
import { toast } from '@/hooks/components/use-toast';
import { DATE_FORMAT_SLASH } from '@/assets/constants/date-format';

export const useReceiveRecordHook = <T>(hookOption: {
  fetchMethod: ({
    pageNumber,
  }: {
    pageNumber: number;
    [key: string]: unknown;
  }) => Promise<PageContent<T>>;
  fetchMethodParams?: UniversalParams;
  errMsg: string;
}) => {
  const { fetchMethod, fetchMethodParams = {}, errMsg = 'ReceiveRecordError' } = hookOption;

  const loadingVisible = ref(false);

  /** 没有更多了/无数据 */
  const isNotMore = ref(false);

  /** 领取记录列表 */
  const receiveRecordList = shallowRef<T[]>([]);

  /** 总页数 */
  let totalPages = 1;

  /** 当前页数 */
  let pageNumber = 0;

  /** 转换领取日期 */
  function convertReceiveDate(ts: string | number) {
    return formatDate(new Date(ts), DATE_FORMAT_SLASH);
  }

  /** 转换金额，转成保留 2 位小数的数字字符串 */
  function convertAmount(val: number) {
    let amount = String(Math.round(val * 100) / 100);

    const xsd = amount.split('.');
    if (xsd.length === 1) {
      return `${amount}.00`;
    }

    if (xsd.length > 1) {
      if (xsd[1].length < 2) {
        amount = `${amount}0`;
      }
      return amount;
    }

    return amount;
  }

  /** 获取领取记录 */
  async function getReceiveRecordList() {
    if (typeof fetchMethod !== 'function') return;

    if (loadingVisible.value || isNotMore.value) {
      return;
    }

    if (totalPages <= pageNumber) {
      isNotMore.value = true;
      return;
    }

    loadingVisible.value = true;
    try {
      const pageResult = await fetchMethod({
        pageNumber: pageNumber + 1,
        ...fetchMethodParams,
      });

      receiveRecordList.value = receiveRecordList.value.concat(pageResult.contents);
      totalPages = pageResult.totalPages;
      pageNumber = pageResult.pageNumber;
    } catch (e) {
      console.error(e);
      toast.error(errMsg);
    } finally {
      loadingVisible.value = false;
    }
  }

  return {
    loadingVisible,
    isNotMore,
    receiveRecordList,

    convertReceiveDate,
    convertAmount,
    /** 组件会在 setup 阶段 expose 该方法 */
    getReceiveRecordList,
  };
};

type ReceiveRecordInstanceExpose = Pick<
  ReturnType<typeof useReceiveRecordHook>,
  'getReceiveRecordList'
>;

/** 领取记录组件实例类型 */
export type ReceiveRecordInstance = InstanceType<
  DefineComponent<Record<string, never>, ReceiveRecordInstanceExpose>
>;
