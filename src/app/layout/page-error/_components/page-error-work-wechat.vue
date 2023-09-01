<template>
  <div class="c-page-error-work-wechat">
    <div class="c-page-error-work-wechat__content">
      <div
        class="c-page-error-work-wechat__code"
        v-if="pageError.desc"
      >
        <img
          :src="pageError.desc"
          alt="二维码"
        />
      </div>

      <div class="c-page-error-work-wechat__tip">
        <p>{{ $lang('pageError.work.wechat.tips1') }}</p>
        <p>{{ $lang('pageError.work.wechat.tips2') }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePageErrorHook } from '../_hooks/use-page-error';

const { pageError } = usePageErrorHook();
</script>

<style lang="scss">
.c-page-error-work-wechat {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f2f6;

  .c-page-error-work-wechat__code {
    width: 224px;
    height: 224px;
    overflow: hidden;
    background: #fff;
    border-radius: 8px;
    img {
      width: 100%;
      height: 100%;
    }
  }

  .c-page-error-work-wechat__tip {
    margin-top: 10px;
    font-size: 13px;
    line-height: 22px;
    color: #888888;
    text-align: center;
  }
}
</style>
