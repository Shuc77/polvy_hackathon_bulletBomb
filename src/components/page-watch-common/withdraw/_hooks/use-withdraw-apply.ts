import { computed, ref, unref, reactive } from 'vue';
import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { getWatchCore } from '@/core/watch-sdk';
import { ValidatorRules } from '@/plugins/async-validator';
import { WeixinPayType } from '@polyv/live-watch-sdk';
import { useWeixinStore } from '@/store/use-weixin-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

/** 历史提现统计错误响应 */
export function handleStatisticsErr(e: Error) {
  switch (e.message) {
    case 'blank_openid':
      return translate('weixin.error.openInClient');
    case 'user_not_found':
      return translate('withdraw.error.noUser');
    default:
      return 'ERROR7: ' + e.message;
  }
}

export const useWithdrawApplyHook = () => {
  const watchCore = getWatchCore();
  const { weixinPayType } = storeDefinitionToRefs(useWeixinStore);
  const { withdrawMaxAmount } = storeDefinitionToRefs(useWithdrawStore);

  /** 提现表单数据 */
  const formData = reactive<{
    amount: string | number;
  }>({
    amount: '',
  });

  /** 个人可提现金额 */
  const totalAmount = ref(0);

  /** 商家提现是否大于自定义限额 */
  const isMerchantAmount = computed(() => {
    return (
      unref(weixinPayType) === WeixinPayType.Merchant &&
      unref(totalAmount) > unref(withdrawMaxAmount)
    );
  });

  /** 表单规则 */
  const formRules = computed<ValidatorRules>(() => {
    return {
      amount: [
        {
          required: true,
          message: translate('withdraw.apply.rules.amount.required'),
        },
        {
          validator: (rule, val: number | string) => {
            let errorMsg: string | undefined;

            // 最小值判断，总金额不得小于 1
            if (val < 1) {
              errorMsg = translate('withdraw.apply.rules.amount.low');
            }

            // 最大值判断
            if (unref(isMerchantAmount)) {
              if (Number(formData.amount) > unref(withdrawMaxAmount)) {
                errorMsg = translate('withdraw.apply.amount.most.merchant', {
                  amount: String(unref(withdrawMaxAmount)),
                });
              }
            } else {
              if (Number(formData.amount) > unref(totalAmount)) {
                errorMsg = translate('withdraw.apply.amount.most', {
                  amount: String(unref(totalAmount)),
                });
              }
            }

            const reg = /^\d+(\.\d{0,2})?$/;
            const matchResult = `${val}`.match(reg);
            if (matchResult === null) {
              errorMsg = '提现金额为小数位最多两位的数字';
            }

            if (errorMsg) {
              return [errorMsg];
            }

            return true;
          },
        },
      ],
    };
  });

  /** 提现金额输入框-默认展示 */
  const amountInputPlaceHolder = computed(() => {
    if (unref(weixinPayType) === WeixinPayType.Merchant) {
      return translate('withdraw.apply.amount.most.merchant', {
        amount: String(withdrawMaxAmount.value),
      });
    } else {
      return translate('withdraw.apply.amount.most', {
        amount: String(totalAmount.value),
      });
    }
  });

  /** 提示语 */
  const withdrawApplyTips = computed(() =>
    translate('withdraw.apply.tips', { amount: `<span>1</span>`, day: '<span>3</span>' }),
  );

  /** 设置最大提现额 */
  function setMaxAmount() {
    formData.amount = unref(isMerchantAmount) ? unref(withdrawMaxAmount) : unref(totalAmount);
  }

  /** 获取总金额数 */
  async function setTotalAmount() {
    try {
      const result = await watchCore.withdraw.getUserStatistics();
      totalAmount.value = result.totalAmount;
    } catch (error) {
      const errMsg = handleStatisticsErr(error as Error);
      toast.error(errMsg);
    }
  }

  /** 提交表单 */
  async function submitForm() {
    const result = await watchCore.withdraw.applyWithdraw({
      amount: Number(formData.amount),
    });
    if (result.success) {
      toast.success(translate('withdraw.apply.success.msg'));
    } else {
      throw new Error(handleApplyErr(result.failMessage));
    }
  }

  /** 提现相关接口错误返回异常时的错误提示 */
  function handleApplyErr(errMessage?: string) {
    switch (errMessage) {
      case 'user_not_found':
        return translate('withdraw.error.noUser');
      case 'amount_over_limit':
        return translate('withdraw.error.getCashExceed');
      case 'set_data_fail':
        return translate('withdraw.error.getCashFailed');
      case 'blank_openid':
        return translate('weixin.error.openInClient');
      case 'invalid_amount':
      default:
        return errMessage;
      // return translate('withdraw.error.getCashFailed');
    }
  }

  /** 初始化-申请提现数据 */
  async function initWithdrawApply() {
    resetWithdrawApply();
    await setTotalAmount();
  }

  /** 重置-申请提现数据 */
  function resetWithdrawApply() {
    formData.amount = '';
  }

  return {
    formData,
    formRules,
    amountInputPlaceHolder,
    withdrawApplyTips,

    setMaxAmount,
    submitForm,

    initWithdrawApply,
    resetWithdrawApply,
  };
};
