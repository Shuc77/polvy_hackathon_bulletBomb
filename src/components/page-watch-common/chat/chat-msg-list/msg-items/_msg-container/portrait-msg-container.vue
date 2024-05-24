<!-- @file 竖屏端聊天消息容器 -->
<template>
  <div
    class="c-portrait-msg-container"
    @click="emit('click-container')"
    ref="referenceRef"
    :class="{
      'c-portrait-msg-container--suffix-align-center': suffixMode === 'align-center',
    }"
  >
    <div
      class="c-portrait-msg-container__bubble"
      :class="{ 'c-portrait-msg-container__bubble__margin': askMenuData.visible }"
    >
      <slot name="msg-header"></slot>

      <div
        class="c-portrait-msg-container__content"
        @click="onClickReferenceRef"
      >
        <slot name="msg-left"></slot>

        <div class="c-portrait-msg-container__content__inner">
          <portrait-msg-user-info v-if="!hideUserInfo" />
          <slot></slot>
        </div>

        <slot name="msg-right"></slot>
      </div>

      <slot name="msg-footer"></slot>
    </div>

    <!-- 气泡后缀内容 -->
    <div class="c-portrait-msg-container__content__suffix">
      <slot name="suffix"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import PortraitMsgUserInfo from '../_msg-user-info/portrait-msg-user-info.vue';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { ref } from 'vue';

defineProps({
  /** 是否隐藏用户信息，默认：false */
  hideUserInfo: PropUtils.bool.def(false),
  /** 是否使用提示气泡，默认：false */
  useMsgTipsControl: PropUtils.bool.def(false),

  suffixMode: PropUtils.string.def('align-center'),
});

const emit = defineEmits({
  /** 点击容器 */
  'click-container': emitFunc<void>(),
  /** 点击聊天消息显示气泡 */
  'click-msg-to-tips': emitFunc<{
    target: HTMLDivElement;
    mountEl: string;
  }>(),
});

const { askMenuData } = useChannelMenuStore();

const referenceRef = ref(null);

function onClickReferenceRef() {
  if (!referenceRef.value) return;
  emit('click-msg-to-tips', {
    target: referenceRef.value,
    mountEl: 'c-portrait-chat-msg-list__container',
  });
}
</script>

<style lang="scss">
.c-portrait-msg-container {
  display: flex;
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
  margin-right: 8px;
}

.c-portrait-msg-container--suffix-align-center {
  .c-portrait-msg-container__content__suffix {
    align-self: center;
  }
}

.c-portrait-msg-container__content__suffix {
  flex-shrink: 0;
  font-size: 12px;
  line-height: initial;
  white-space: nowrap;

  &:empty {
    display: none;
  }
}
</style>
