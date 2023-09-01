<!-- @file 竖屏聊天室点赞 -->
<template>
  <div
    class="c-portrait-chat-like"
    @click="onClickLikeWrap"
  >
    <plv-like
      ref="likeRef"
      :icons="likeIcons"
      :readonly="isReadonlyLike"
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
        class="c-portrait-chat-like__button"
      ></i>
      <template v-slot:like-count="scope">
        <div class="c-portrait-chat-like__count-wrap">
          <p class="c-portrait-chat-like__count">
            {{ getScopeCount(scope) }}
          </p>
        </div>
      </template>
    </plv-like>
  </div>
</template>

<script setup lang="ts">
import { PlvLike } from '@/plugins/polyv-ui/mobile-import';
import { chatLikeProps, useChatLike } from './_hooks/use-chat-like';

import { useChatStore } from '@/store/use-chat-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useProps } from '@/assets/utils/vue-utils/props-utils';

const props = defineProps(chatLikeProps());

const { upperHasIcon } = useProps(props);

const { realtimeLikes } = storeDefinitionToRefs(useChatStore);

const { likeRef, likeIcons, isReadonlyLike, onClickLike, onClickLikeWrap } = useChatLike();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getScopeCount(scope: any) {
  return scope.count;
}
</script>

<style lang="scss">
.c-portrait-chat-like {
  position: relative;
  z-index: 0;
  box-sizing: border-box;
  text-align: center;
}
.c-portrait-chat-like__button {
  display: inline-block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  user-select: none;
  background-image: url(./imgs/icon-chat-like-portrait.png);
  background-position: center;
  background-size: cover;
}
.c-portrait-chat-like__count-wrap {
  height: 16px;
  margin-top: 4px;
}
.c-portrait-chat-like__count {
  position: absolute;
  left: 50%;
  box-sizing: border-box;
  display: inline-block;
  font-size: 12px;
  line-height: 16px;
  color: $--color-white;
  text-align: center;
  white-space: nowrap;
  transform: translate(-50%, 0);
}
</style>
