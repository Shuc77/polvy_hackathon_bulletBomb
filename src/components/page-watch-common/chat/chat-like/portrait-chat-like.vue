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
      count-position="top"
      size="32px"
      :appear-mode="upperHasIcon ? 'bottom-right' : 'bottom-center'"
      :count-formatter="shortNumber"
      :click-button-enabled="likeSingleClickEnabled"
      :press-hold-enabled="likeHoldEnabled"
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
import { useShortNumber } from '@/hooks/business/use-short-number';

const props = defineProps(chatLikeProps());

const { upperHasIcon } = useProps(props);

const { shortNumber } = useShortNumber();

const { realtimeLikes, likeSingleClickEnabled, likeHoldEnabled } =
  storeDefinitionToRefs(useChatStore);

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

  .plv-like-button__content__btn {
    width: 32px !important;
    height: 32px !important;
  }
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
}
</style>
