import Vue from 'vue';
import * as Vue2Module from 'vue';
import { PiniaVuePlugin, createPinia } from 'pinia';

import {
  injectPolyvWatchAppSdkMethods,
  PolyvWatchAppClass,
  setPolyvWatchApp,
} from './plugins/sdk-inject-helper';
import { loadVConsole } from '@/plugins/vconsole';

import { installI18n } from '@/assets/lang';
import '@/assets/styles/animation.scss';
import '@/assets/utils/ie-polyfill/index.js';
import { DEFAULT_APP_UNIQUE_ID } from '@/assets/constants/defaults';
import { isInjectByExternalApp } from '@/assets/utils/utils';

/**
 * 注册 Vue 相关逻辑
 */
const installVue = () => {
  /**
   * 互动功能通过 umd 引入，需要获取 window 的 Vue 对象
   * dev 环境下 vue 使用 esModule 引入，不会挂载到 window
   * 因此在 window 没有 Vue 的情况下手动挂载一次
   */
  // if (!window.Vue && process.env.NODE_ENV !== 'production') {
  //   loadScript('https://s4.videocc.net/library/vue/2.x/vue-2.7.16.runtime.min.js')
  //     // eslint-disable-next-line
  //     .then(() => {
  //       window.Vue.config.devtools = true;
  //     });
  // }

  if (!window.Vue && process.env.NODE_ENV !== 'production') {
    (window.Vue as unknown) = Vue;
    (window.Vue2Module as unknown) = Vue2Module;
  }

  Vue.config.productionTip = false;

  Vue.config.errorHandler = error => {
    console.error(error);
    if (window.aegis) {
      window.aegis.error(error);
    }
  };

  Vue.use(PiniaVuePlugin);

  installI18n();
};

/**
 * 创建 Vue 应用实例
 */
const createVueApp = (uniqueId: string, RootApp: Vue) => {
  const pinia = createPinia();

  pinia.use(({ store }) => {
    store.$uniqueId = uniqueId;
  });

  return new Vue({
    pinia,
    provide: {
      uniqueId,
    },
    components: {
      WatchApp: RootApp,
    },
    render(createElement) {
      return createElement('watch-app');
    },
  });
};

/**
 * 创建保利威观看页应用实例
 */
function createPolyvWatchApp(opts: CreatePolyvWatchAppParams, RootApp: Vue) {
  const uniqueId = opts.id;

  return new PolyvWatchAppClass({
    createVueApp: () => createVueApp(uniqueId, RootApp),
    ...opts,
  });
}

// 主入口工厂
export function mainFactory(RootApp: Vue) {
  // eslint-disable-next-line
  loadVConsole().finally(() => {
    installVue();

    if (isInjectByExternalApp()) {
      // 注入模式需要回调 init 注入方法，并回调相关事件表示注入完成
      injectPolyvWatchAppSdkMethods({
        createPolyvWatchApp: opts => createPolyvWatchApp(opts, RootApp),
      });
      window.PolyvWatchAppSdk?.eventEmitter.emit('init');
    } else {
      // 非注入模式就直接挂载即可
      const uniqueId = DEFAULT_APP_UNIQUE_ID;
      const plvWatchApp = createPolyvWatchApp({ id: uniqueId }, RootApp);
      setPolyvWatchApp(plvWatchApp);
      plvWatchApp.getVueInstance().$mount(`#${uniqueId}`);
    }
  });
}
