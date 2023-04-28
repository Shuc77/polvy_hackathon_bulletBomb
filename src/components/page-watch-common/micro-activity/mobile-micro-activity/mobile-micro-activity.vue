<!-- @file 移动端-横屏-微活动 -->
<template>
  <div class="c-mobile-micro-activity">
    <iframe
      v-if="iframeUrl"
      ref="microActivityIframeRef"
      class="c-mobile-micro-activity__iframe"
      allow="gyroscope; accelerometer; xr"
      :src="iframeUrl"
      :style="{ height: displayIframeHeight }"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { nextTick, onMounted, ref, unref, watch } from 'vue';
import { useMicroActivityHook } from '../hooks/use-micro-activity';

let $watchContainer: HTMLElement | null = null;
/**
 * 更新外部 Watch 根节点高度
 * @param {String} displayHeight
 * */
const updateWatchContainerHeight = (displayHeight: string, overflowHidden?: boolean) => {
  if (!$watchContainer) {
    $watchContainer = document.querySelector('.c-mobile-watch-layout');
  }
  if ($watchContainer) {
    $watchContainer.style.setProperty('height', displayHeight);
    $watchContainer.style.setProperty('overflow-y', overflowHidden ? 'hidden' : 'scroll');
  }
};

const props = defineProps({
  isActive: PropUtils.bool.def(false),
});

/** body 初始高度 */
const originBodyHeight = ref(0);
/** iframe 初始高度 */
const originIframeHeight = ref(0);
/** 用于展示的 iframe 高度 */
const displayIframeHeight = ref('100%');
/**  记录上一次 iframe 改变后的高度 */
const lastIframeHeight = ref(0);

const {
  microActivityIframeRef,
  iframeUrl,

  updateIframeUrl,
} = useMicroActivityHook({
  fullScreenMessageHandler,
  backHomeMessageHandler,
  forceFullScreenMessageHandler,
});

watch(
  () => props.isActive,
  () => {
    if (props.isActive) {
      // eslint-disable-next-line promise/prefer-await-to-then
      updateIframeUrl().then(() => {
        nextTick(() => {
          if (lastIframeHeight.value === 0) {
            // 如果没有上一次 iframe 高度，就重新获取
            const $iframe = unref(microActivityIframeRef);
            if (!$iframe) {
              console.warn('$iframe not found');
              return;
            }
            originIframeHeight.value = $iframe.clientHeight || 0;
            originBodyHeight.value = document.body.clientHeight;
          } else {
            updateScreenDomHeight(lastIframeHeight.value);
          }
        });
      });
    } else {
      nextTick(() => {
        recoverScreenDomHeight();
      });
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  updateIframeUrl();
});

/** 还原 DOM 原本状态 */
function recoverScreenDomHeight() {
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');

  updateWatchContainerHeight('100%', true);
  displayIframeHeight.value = '100%';
}

/**
 * 更新屏幕中需要改变的 DOM 高度
 * @param height iframe需要改变的高度
 */
function updateScreenDomHeight(height: number) {
  if (height < originIframeHeight.value) {
    recoverScreenDomHeight();
  } else {
    const offset = height - originIframeHeight.value;
    const displayBodyHeight = originBodyHeight.value + offset + 'px';

    displayIframeHeight.value = height + 'px';
    updateWatchContainerHeight(displayBodyHeight);

    document.body.style.setProperty('overflow', 'scroll');
    document.documentElement.style.setProperty('overflow', 'scroll');
  }

  lastIframeHeight.value = height;
}

function fullScreenMessageHandler() {
  const height = window.innerHeight;
  updateScreenDomHeight(height);
}

function backHomeMessageHandler() {
  recoverScreenDomHeight();
  lastIframeHeight.value = 0;
}

function forceFullScreenMessageHandler() {
  fullScreenMessageHandler();

  const $iframe = unref(microActivityIframeRef);
  if (!$iframe) {
    console.warn('$iframe not found');
    return;
  }

  $iframe.scrollIntoView({ block: 'end' });

  // 保证滚动到底部
  document.documentElement.scrollTo({ top: window.innerHeight });
  document.documentElement.scrollTop = window.innerHeight;
  window.scrollTo({ top: window.innerHeight });

  setTimeout(() => {
    document.documentElement.style.setProperty('overflow', 'hidden');
  }, 0);
}
</script>

<style lang="scss">
.c-mobile-micro-activity {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.c-mobile-micro-activity__iframe {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: none;
  -webkit-overflow-scrolling: touch;
}
</style>
