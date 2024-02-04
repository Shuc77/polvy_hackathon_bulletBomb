<!-- @file 竖屏端聊天消息容器 -->
<template>
  <div
    class="c-portrait-msg-container"
    @click="emit('click-container')"
  >
    <div
      class="c-portrait-msg-container__bubble"
      :class="{ 'c-portrait-msg-container__bubble__margin': askMenuData.visible }"
    >
      <slot name="msg-header"></slot>

      <div
        ref="referenceRef"
        class="c-portrait-msg-container__content"
      >
        <slot name="msg-left"></slot>

        <div class="c-portrait-msg-container__content__inner">
          <portrait-msg-user-info v-if="!hideUserInfo" />
          <slot></slot>
        </div>

        <slot name="msg-right"></slot>
      </div>

      <!-- 气泡提示 -->
      <transition
        v-if="!disabledTips"
        name="fade"
      >
        <div
          v-show="tipsVisible"
          ref="popperRef"
          class="c-portrait-msg-container__tips-bubble--popper"
        >
          <div
            class="c-portrait-msg-container__tips-bubble"
            @click.stop="onClickTips"
          >
            <slot name="tips-content"></slot>
          </div>
        </div>
      </transition>
      <slot name="msg-footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import PortraitMsgUserInfo from '../_msg-user-info/portrait-msg-user-info.vue';
import { msgTipsControlProps, useMsgTipsControl } from './use-msg-tips-control';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const props = defineProps({
  ...msgTipsControlProps(),
  /** 是否隐藏用户信息，默认：false */
  hideUserInfo: PropUtils.bool.def(false),
  /** 是否使用提示气泡，默认：false */
  useMsgTipsControl: PropUtils.bool.def(false),
});

const emit = defineEmits({
  /** 点击容器 */
  'click-container': emitFunc<void>(),
});

const { referenceRef, popperRef, tipsVisible, onClickTips } = useMsgTipsControl({
  props,
  mountEl: 'c-portrait-msg-container',
});
const { askMenuData } = useChannelMenuStore();
</script>

<style lang="scss">
.c-portrait-msg-container {
  font-size: 14px;
  line-height: 22px;
}
.c-portrait-msg-container__bubble {
  box-sizing: border-box;
  display: inline-block;
  max-width: 100%;
  padding: 8px 16px;
  color: $--color-white;
  background-color: rgba(51, 51, 51, 0.6);
  border-radius: 14px;
}
.c-portrait-msg-container__content {
  position: relative;
  display: flex;
  align-items: center;
}
.c-portrait-msg-container__tips-bubble {
  padding: 10px 15px;
  font-size: 14px;
  color: rgba($--color-white, 0.8);
  white-space: nowrap;
  background-color: rgba(66, 68, 83, 0.95);
  border-radius: 4px;
}
.c-portrait-msg-container__bubble__margin {
  margin-right: 20px;
}
</style>
