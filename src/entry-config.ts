if (typeof BUILD_ENV !== 'undefined') {
  window.BUILD_ENV = BUILD_ENV;
}

// 新版 SDK 的 UI 层用的是 vue2.7，所以需要额外挂载一个全局变量来存放 Vue 模块对象
if (window.Vue) {
  (window.Vue2Module as unknown) = Vue;
}

if (
  IN_SDK_INJECT_MODE &&
  ENABLE_RUNTIME_PUBLIC_PATH &&
  window.PolyvWatchAppSdk &&
  window.PolyvWatchAppSdk.publicPath
) {
  // eslint-disable-next-line
  __webpack_public_path__ = window.PolyvWatchAppSdk.publicPath;
}
