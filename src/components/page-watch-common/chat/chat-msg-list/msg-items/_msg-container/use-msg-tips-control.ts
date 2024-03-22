import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { usePopper } from '@/hooks/components/use-popper';
import { PopperTrigger } from '@/hooks/components/use-popper/_popper-type';

export const msgTipsControlProps = () => ({
  /** 是否禁用提示，默认：true */
  disabledTips: PropUtils.bool.def(true),
});

export const useMsgTipsControl = (options: {
  props: VueProps<typeof msgTipsControlProps>;
  mountEl: string;
  popperTrigger?: PopperTrigger;
}) => {
  const { props, mountEl, popperTrigger } = options;

  /** 提示是否显示 */
  const {
    referenceRef,
    popperRef,
    popperVisible: tipsVisible,
    hidePopper: closeTips,
  } = usePopper({
    arrow: {
      color: 'rgba(66, 68, 83, 0.95)',
      size: 5,
    },
    trigger: popperTrigger,
    placement: 'top',
    popperDisabled: props.disabledTips,
    forceZIndex: 10,
    appendToBody: false,
    mountEl,
  });

  /** 点击提示 */
  function onClickTips() {
    closeTips();
  }

  return {
    referenceRef,
    popperRef,
    tipsVisible,
    onClickTips,
  };
};
