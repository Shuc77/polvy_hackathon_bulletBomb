<!-- @file PC 端聊天室点赞 -->
<template>
  <div class="c-pc-chat-like">
    <plv-like
      ref="likeRef"
      :icons="likeIcons"
      :animation-options="{
        speed: 0.012,
      }"
      :count="realtimeLikes"
      :appear-mode="upperHasIcon ? 'bottom-right' : 'bottom-center'"
      @click-button="onClickLike"
      @press-hold="onClickLike"
    >
      <i
        slot="like-button"
        class="c-pc-chat-like__button pws-like-button"
      ></i>
      <template v-slot:like-count="scope">
        <div class="c-pc-chat-like__count-wrap">
          <p class="c-pc-chat-like__count pws-like-count-number">
            {{ getScopeCount(scope) }}
          </p>
        </div>
      </template>
    </plv-like>
  </div>
</template>

<script setup lang="ts">
import { PlvLike } from '@/plugins/polyv-ui/pc-import';
import { chatLikeProps, useChatLike } from './_hooks/use-chat-like';

import { useChatStore } from '@/store/use-chat-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useProps } from '@/assets/utils/vue-utils/props-utils';

const props = defineProps(chatLikeProps());

const { upperHasIcon } = useProps(props);

const { realtimeLikes } = storeDefinitionToRefs(useChatStore);

const { likeRef, likeIcons, onClickLike } = useChatLike();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getScopeCount(scope: any) {
  return scope.count;
}
</script>

<style lang="scss">
.c-pc-chat-like {
  position: relative;
  z-index: 0;
  box-sizing: border-box;
  text-align: center;
}
.c-pc-chat-like__button {
  display: inline-block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  user-select: none;
  background-position: center;
  background-size: cover;
}
.c-pc-chat-like__count-wrap {
  height: 16px;
  margin-top: 4px;
}
.c-pc-chat-like__count {
  position: absolute;
  left: 50%;
  box-sizing: border-box;
  display: inline-block;
  min-width: 48px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 16px;
  text-align: center;
  white-space: nowrap;
  border-radius: 9px;
  transform: translate(-50%, 0);
}
</style>
