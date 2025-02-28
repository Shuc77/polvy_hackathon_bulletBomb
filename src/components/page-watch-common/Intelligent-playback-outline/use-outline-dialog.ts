import { ref } from 'vue';

export const useOutlineDialog = () => {
  const visible = ref(false);

  function handleCloseDialog(callFun?: () => void) {
    visible.value = false;
    callFun && callFun();
  }

  return {
    visible,
    handleCloseDialog,
  };
};
