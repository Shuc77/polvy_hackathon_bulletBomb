/**
 * @file 加载 vconsole
 */
import VConsole from 'vconsole';
import { paramGetter } from '@/hooks/core/use-query-params';

let vConsole: VConsole | undefined;

// 当存在 url 参数 console=1，会自动加载 vConsole 脚本
export async function createVConsole() {
  if (!vConsole) {
    vConsole = new VConsole();
  }
  return vConsole;
}

(() => {
  if (paramGetter.console()) {
    createVConsole();
  }
})();
