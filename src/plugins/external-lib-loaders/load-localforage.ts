let loadPromise: Promise<LocalForage> | undefined;

let localForageLoader: LocalForage | null = null;

/** 加载 localforage */
export function loadLocalForage() {
  if (localForageLoader) {
    return Promise.resolve(localForageLoader);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      (async () => {
        localForageLoader = (await import(/* webpackChunkName: "load-localforage" */ 'localforage'))
          .default;
        window.localForageLoader = localForageLoader;

        if (localForageLoader) {
          resolve(localForageLoader);
        } else {
          reject(new Error('loadLocalForage fail'));
        }
      })();
    });
  }

  return loadPromise;
}
