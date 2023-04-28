<!-- @file 竖屏暂无直播占位 -->
<template>
  <div class="c-portrait-none-live-panel c-portrait-placeholder-panel">
    <div class="c-portrait-placeholder-panel__content">
      <div class="c-portrait-none-live-panel__image g-img-cover"></div>
      <p class="c-portrait-none-live-panel__text">{{ $lang('liveStatus.end') }}</p>
    </div>
  </div>
</template>

<style lang="scss">
.c-portrait-none-live-panel .c-portrait-placeholder-panel__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.c-portrait-none-live-panel__image {
  width: 154px;
  height: 120px;
  margin-bottom: 12px;
  background-image: url(./imgs/portrait-end-placeholder.png);
}
.c-portrait-none-live-panel__text {
  font-size: 14px;
  color: $--color-white;
}
</style>
