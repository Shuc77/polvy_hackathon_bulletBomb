<!-- @file PC 端消息用户信息 -->
<template>
  <div
    class="c-pc-msg-user-info"
    :class="{
      'c-pc-msg-user-info--self': isSelfMsg,
      'c-pc-msg-user-info--special pws-msg-user-info-special': isSpecialUser,
    }"
  >
    <!-- 头像 -->
    <div
      class="c-pc-msg-user-info__avatar g-img-cover"
      :style="{
        backgroundImage: `url(${msgUserAvatar})`,
      }"
    ></div>

    <div class="c-pc-msg-user-info__nick-wrap">
      <!-- 头衔 -->
      <span
        v-if="!hideUserActor"
        class="c-pc-msg-user-info__label c-pc-msg-user-info__actor g-singleline pws-chat-msg-user-actor"
        :class="{
          'c-pc-msg-user-info__actor--not-special': !isSpecialUser,
        }"
      >
        <span
          class="c-pc-msg-user-info__label-inner c-pc-msg-user-info__actor-inner"
          :title="msgUserActor"
        >
          {{ msgUserActor }}
        </span>
      </span>

      <!-- 提问区标签 -->
      <template v-if="showUserQuestionLabel">
        <span
          v-for="(questionLabel, index) in msgUserQuestionLabels"
          :key="`${questionLabel}_${index}`"
          class="c-pc-msg-user-info__label c-pc-msg-user-info__questionLabel g-singleline"
        >
          <span
            class="c-pc-msg-user-info__label-inner c-pc-msg-user-questionLabel-inner"
            :title="questionLabel"
          >
            {{ questionLabel }}
          </span>
        </span>
      </template>

      <!-- 昵称 -->
      <span
        class="c-pc-msg-user-info__nick pws-chat-msg-user-nickname"
        :title="msgUserNick"
      >
        {{ msgUserNick }}{{ isSelfMsg ? `(${$lang('base.me')})` : '' }}
      </span>
      <!-- 设置昵称图标 -->
      <pc-icon-set-nick
        v-if="isSelfMsg && canSetNick"
        class="c-pc-msg-user-info__set-nick pws-chat-msg-user-set-nick-icon"
        @click="onClickSetNick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconSetNick } from '@/components/component-icons/pc/map';
import { useMsgUserInfo } from './use-msg-user-info';

import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

const { getEmitter } = useGlobalInject();

const {
  msgUserNick,
  msgUserAvatar,
  msgUserActor,
  msgUserQuestionLabels,

  isSelfMsg,
  isSpecialUser,
  hideUserActor,
  showUserQuestionLabel,
} = useMsgUserInfo();

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

function onClickSetNick() {
  getEmitter().emit(appEvents.chat.OpenSetNick, true);
}
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-pc-msg-user-info {
  position: relative;
  box-sizing: border-box;
  padding-right: $--msg-container-padding-size;
  padding-left: $--msg-user-avatar-padding;
  margin: 0 $--margin-horizontal-margin;
}

.c-pc-msg-user-info__avatar {
  position: absolute;
  top: 0;
  left: 0;
  width: $--msg-user-avatar-size;
  height: $--msg-user-avatar-size;
  overflow: hidden;
  border-radius: 50%;
  @include minor-border;
}

.c-pc-msg-user-info__nick-wrap {
  position: relative;
  box-sizing: border-box;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  line-height: normal;
}

.c-pc-msg-user-info__label {
  box-sizing: border-box;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  max-width: 110px;
  height: 18px;
  margin: 2px;
  line-height: 18px;
  border-radius: 18px;
}
.c-pc-msg-user-info__label-inner {
  display: inline-block;
  padding: 0 6px;
  font-size: 12px;
  border-radius: 18px;
  transform: scale(0.833);
}

.c-pc-msg-user-info__questionLabel {
  color: #fff;
  background-color: #626be9;
}
// 一般通过多皮肤处理
.c-pc-msg-user-info__actor {
  color: #fff;
  background-color: #5394f6;
}
// 非特殊角色样式暂时只用一套，所以优先级比多皮肤高
.c-pc-msg-user-info__actor.c-pc-msg-user-info__actor--not-special {
  color: #fff !important;
  background: none !important;
  border-image-source: url('../_imgs/img-user-actor-bg.png');
  border-image-slice: 0 20 0 20 fill;
  border-image-width: 0 8px 0 8px;
  .c-pc-msg-user-info__actor-inner {
    background: none !important;
  }
}

.c-pc-msg-user-info__set-nick {
  display: inline-flex;
  flex-shrink: 0;
  padding: 0 8px;
  font-size: 16px !important;
  vertical-align: middle;
  cursor: pointer;
  opacity: 0;
}
.c-pc-msg-user-info:hover {
  .c-pc-msg-user-info__set-nick {
    opacity: 1;
  }
}
</style>
