<!-- @file 聊天室关闭提示 -->
<template>
  <div class="c-chat-close-tips">
    <template v-if="privateSeminarChannel">
      <span
        class="c-chat-close-tips__icon c-chat-close-tips__icon__empty g-img-cover pws-chat-close-tips-icon__empty"
      ></span>
      <span class="c-chat-close-tips__text pws-chat-close-tips-text">
        {{ $lang('seminar.disabledChat') }}
      </span>
    </template>
    <template v-else>
      <span
        class="c-chat-close-tips__icon g-img-cover pws-chat-close-tips-icon pws-chat-close-tips-icon"
      ></span>
      <span class="c-chat-close-tips__text pws-chat-close-tips-text">
        {{ $lang('chat.closeTips') }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';

const { privateSeminarChannel } = storeDefinitionToRefs(useChannelStore);
</script>

<style lang="scss">
.c-chat-close-tips {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 12px;
}

.c-chat-close-tips__icon {
  width: 88px;
  height: 88px;
  margin-bottom: 8px;
}

.c-chat-close-tips__icon__empty {
  width: 66px;
  height: 66px;
}

.c-chat-close-tips__text {
  font-size: 14px;
  line-height: 18px;
  text-align: center;
}
</style>
