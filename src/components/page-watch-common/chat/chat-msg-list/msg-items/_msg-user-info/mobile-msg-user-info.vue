<!-- @file 移动端消息用户信息 -->
<template>
  <div
    class="c-mobile-msg-user-info"
    :class="{
      'c-mobile-msg-user-info--self': isSelfMsg,
      'c-mobile-msg-user-info--special pws-msg-user-info-special': isSpecialUser,
    }"
  >
    <!-- 头像 -->
    <div
      class="c-mobile-msg-user-info__avatar g-img-cover"
      :style="{
        backgroundImage: `url(${msgUserAvatar})`,
      }"
    ></div>

    <div class="c-mobile-msg-user-info__nick-wrap">
      <!-- 头衔 -->
      <span
        v-if="!hideUserActor"
        class="c-mobile-msg-user-info__label c-mobile-msg-user-info__actor g-singleline pws-chat-msg-user-actor"
        :class="{
          'c-mobile-msg-user-info__actor--not-special': !isSpecialUser,
        }"
      >
        <span class="c-mobile-msg-user-info__label-inner c-mobile-msg-user-info__actor__inner">
          {{ msgUserActor }}
        </span>
      </span>
      <!-- 提问区标签 -->
      <template v-if="showUserQuestionLabel">
        <span
          v-for="(questionLabel, index) in msgUserQuestionLabels"
          :key="`${questionLabel}_${index}`"
          class="c-mobile-msg-user-info__label c-mobile-msg-user-info__questionLabel g-singleline"
        >
          <span
            class="c-mobile-msg-user-info__label-inner c-mobile-msg-user-info__questionLabel-inner"
          >
            {{ questionLabel }}
          </span>
        </span>
      </template>

      <!-- 昵称 -->
      <span class="c-mobile-msg-user-info__nick pws-chat-msg-user-nickname">
        {{ msgUserNick }}{{ isSelfMsg ? `(${$lang('base.me')})` : '' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMsgUserInfo } from './use-msg-user-info';

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
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-mobile-msg-user-info {
  position: relative;
  box-sizing: border-box;
  padding-right: $--msg-container-padding-size;
  padding-left: $--msg-user-avatar-padding-mobile;
  margin: 0 $--margin-horizontal-margin;
}

.c-mobile-msg-user-info__avatar {
  position: absolute;
  top: 0;
  left: 0;
  width: $--msg-user-avatar-size-mobile;
  height: $--msg-user-avatar-size-mobile;
  overflow: hidden;
  border-radius: 50%;
  @include minor-border;
}

.c-mobile-msg-user-info__nick-wrap {
  position: relative;
  box-sizing: border-box;
  display: inline-block;
  max-width: 100%;
  max-height: $--msg-user-nick-wrap-max-height;
  overflow: hidden;
  font-size: 12px;
  line-height: normal;
}

.c-mobile-msg-user-info__nick {
  color: #adadc0;
}

.c-mobile-msg-user-info__label {
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

.c-mobile-msg-user-info__label-inner {
  display: inline-block;
  padding: 0 6px;
  font-size: 12px;
  border-radius: 18px;
  transform: scale(0.833);
}

.c-mobile-msg-user-info__questionLabel {
  color: #fff;
  background-color: #626be9;
}
// 一般通过多皮肤处理
.c-mobile-msg-user-info__actor {
  color: #fff;
  background: #5394f6;
}
// 非特殊角色样式暂时只用一套，所以优先级比多皮肤高
.c-mobile-msg-user-info__actor.c-mobile-msg-user-info__actor--not-special {
  color: #fff !important;
  background: none !important;
  border-image-source: url('../_imgs/img-user-actor-bg.png');
  border-image-slice: 0 20 0 20 fill;
  border-image-width: 0 8px 0 8px;
  .c-mobile-msg-user-info__actor__inner {
    background: none !important;
  }
}
.c-mobile-msg-user-info--special {
  .c-mobile-msg-user-info__nick {
    color: #5394f6;
  }
}
</style>
