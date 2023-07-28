import { onBeforeUnmount, onBeforeMount, ref } from 'vue';

/**
 * @hook PC 页面布局 hook
 */
export const usePageLayoutStyle = () => {
  const pageWidth = ref(0);

  function updatePageWidth(): void {
    const width = document.documentElement.clientWidth;
    pageWidth.value = width;

    // ==START==  @PLV-TODO Remove 1rem  ==START==
    // 浏览器可用区域宽度在 1024 和 1920 之间变化时，内容区域对应宽度为 964 和 1680。
    // 设置 fontSize 为内容区域宽度后，就不再需要在 CSS 中计算宽度（实际上也很难在 CSS 里面算），仅需设为 1rem。
    document.documentElement.style.fontSize =
      964 + ((1680 - 964) * (Math.min(1920, Math.max(width, 1024)) - 1024)) / (1920 - 1024) + 'px';
    // ==END== @PLV-TODO Remove 1rem  ==END==
  }

  onBeforeMount(() => {
    updatePageWidth();
    window.addEventListener('resize', updatePageWidth, false);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updatePageWidth, false);
    document.documentElement.style.fontSize = '';
  });

  return {
    pageWidth,
  };
};
