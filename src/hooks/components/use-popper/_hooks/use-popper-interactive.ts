import { onMounted, unref } from 'vue';
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';
import { PopperOptions } from '../_popper-type';

/**
 * 弹层交互方式 hook
 */
export const usePopperInteractive = (popperOptions: PopperOptions) => {
  const {
    trigger,
    popperDisabled,
    getElement,
    mouseEnterDelay,
    mouseLeaveDelay,
    showPopper,
    hidePopper,
    togglePopper,
    delayShowPopper,
    delayHidePopper,
    forceOutSideClickHide,
    outSideClickDelayHide,
  } = popperOptions;

  // ============== click 交互 ============== //
  useClickOutside(
    () => {
      const { referenceElem, popperElem } = getElement();
      const elements: HTMLElement[] = [];
      referenceElem && elements.push(referenceElem);
      popperElem && elements.push(popperElem);
      return elements;
    },
    () => {
      if (unref(forceOutSideClickHide) || unref(trigger).includes('click')) {
        unref(outSideClickDelayHide) ? delayHidePopper() : hidePopper();
      }
    },
  );
  const listenElemClickEvent = () => {
    if (unref(popperDisabled)) {
      return;
    }
    const { referenceElem } = getElement();
    if (referenceElem) {
      referenceElem.addEventListener('click', togglePopper);
    }
  };

  // ============== hover 交互 ============== //
  const mouseEnterToShow = () => {
    if (unref(popperDisabled)) {
      return;
    }
    delayShowPopper(unref(mouseEnterDelay));
  };
  const mouseLeaverToHide = () => {
    delayHidePopper(unref(mouseLeaveDelay));
  };
  const listenElemHoverEvent = () => {
    const { referenceElem, popperElem } = getElement();
    if (referenceElem && popperElem) {
      referenceElem.addEventListener('mouseenter', mouseEnterToShow);
      referenceElem.addEventListener('mouseleave', mouseLeaverToHide);
      popperElem.addEventListener('mouseenter', mouseEnterToShow);
      popperElem.addEventListener('mouseleave', mouseLeaverToHide);
    }
  };

  // ============== focus 交互 ============== //
  const focusToShow = () => {
    if (unref(popperDisabled)) {
      return;
    }
    showPopper();
  };
  const blurToHide = () => {
    hidePopper();
  };
  const listenElemFocusEvent = () => {
    const { inputElem } = getElement();
    if (inputElem) {
      inputElem.addEventListener('focus', focusToShow);
      inputElem.addEventListener('blur', blurToHide);
    }
  };

  /** 设置交互 */
  const setInteractive = () => {
    const triggerVal = unref(trigger);
    if (triggerVal.includes('click')) {
      listenElemClickEvent();
    }
    if (triggerVal.includes('hover')) {
      listenElemHoverEvent();
    }
    if (triggerVal.includes('focus')) {
      listenElemFocusEvent();
    }
  };

  onMounted(() => {
    setInteractive();
  });
};
