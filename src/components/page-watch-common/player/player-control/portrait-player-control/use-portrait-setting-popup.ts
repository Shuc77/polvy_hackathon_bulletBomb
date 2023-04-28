import { appEvents, eventBus, useEventBusListener } from '@/app/app-events';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { ref } from 'vue';

export const usePortraitSettingPopup = (event: string) => {
  const { visible, setVisible } = useSimpleVisible();

  const useTransition = ref(false);

  useEventBusListener(event, (params: { _visible?: boolean; _useTransition: boolean }) => {
    const { _visible = true, _useTransition = true } = params;
    useTransition.value = _useTransition;
    setVisible(_visible);
  });

  /** 关闭弹层 */
  function closePopup(_useTransition = true) {
    useTransition.value = _useTransition;
    setVisible(false);
  }

  /** 点击返回 */
  function onClickBack() {
    eventBus.$emit(appEvents.portrait.OpenMenuPopup, {
      _visible: true,
      _useTransition: false,
    });

    useTransition.value = false;
    setVisible(false);
  }

  return {
    visible,
    setVisible,
    useTransition,
    closePopup,
    onClickBack,
  };
};
