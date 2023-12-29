import Vue from 'vue';
import WatchApp from './app/watch-app.vue';
import { pinia } from '@/plugins/pinia';

import { i18nInstall } from '@/assets/lang';
import { useLangStore } from '@/store/use-lang-store';

import '@/assets/styles/animation.scss';
import '@/plugins/vconsole';

import { isIE } from './assets/utils/browser';

// IE 兼容处理
if (isIE) {
  import(/* webpackChunkName: "ie-polyfill" */ '@/assets/utils/ie-polyfill/index.js');
}

console.info(
  '%c WatchApp build info: %s, %s',
  'color: white;background-color: #0070ed;padding: 5px 5px',
  PROJECT_VERSION,
  PROJECT_BUILD_TIME,
);

/**
 * 互动功能通过 umd 引入，需要获取 window 的 Vue 对象
 * dev 环境下 vue 使用 esModule 引入，不会挂载到 window
 * 因此在 window 没有 Vue 的情况下手动挂载一次
 */
if (!window.Vue) {
  (window.Vue as unknown) = Vue;
}

Vue.config.productionTip = false;

Vue.use(i18nInstall, {
  locale: () => {
    const langStore = useLangStore();
    return langStore.currentLang;
  },
});

Vue.config.errorHandler = error => {
  console.error(error);
  if (window.aegis) {
    window.aegis.error(error);
  }
};

new Vue({
  pinia,
  components: {
    App: WatchApp,
  },
  render(createElement) {
    return createElement('app');
  },
}).$mount('#app');
