/* eslint-disable @typescript-eslint/no-explicit-any */
import { onBeforeUnmount, onMounted, readonly } from 'vue';
import mitt from 'mitt';
import events from './events/';

// 消息模块
export const appEvents = readonly(events);

type AppMittEvents = {
  [key: string]: any;
};

const emitter = mitt<AppMittEvents>();
// 应用消息总线
export const eventBus = {
  $on: emitter.on,
  $emit: emitter.emit,
  $off: emitter.off,
};

/**
 * 设置 eventBus 监听
 * @param event appEvents 中的事件
 * @param callback 回调
 */
export const useEventBusListener = (event: string, callback: (...arg: any[]) => unknown) => {
  onMounted(() => {
    eventBus.$on(event, callback);
  });

  onBeforeUnmount(() => {
    eventBus.$off(event, callback);
  });
};

/**
 * 触发 eventBus 事件
 * @param event appEvents 中的事件
 */
export const useEventBusEmitter = (event: string) => {
  function emitEvent(params?: any) {
    eventBus.$emit(event, params);
  }

  return {
    emitEvent,
  };
};
