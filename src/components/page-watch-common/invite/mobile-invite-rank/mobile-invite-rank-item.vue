<!-- @file 移动端-邀请榜列表项 -->
<template>
  <div
    v-if="item"
    :class="{
      'c-mobile-invite-rank__list__item': true,
      'pws-mobile-invite-rank__list__item': true,
    }"
  >
    <!-- 排名序号 -->
    <template v-if="rank <= 3">
      <div
        :class="[
          'c-mobile-invite-rank__list__item__rank',
          'c-mobile-invite-rank__list__item__rank--' + rank,
        ]"
      ></div>
    </template>
    <template v-else>
      <div class="c-mobile-invite-rank__list__item__rank">
        <span>{{ rank }}</span>
      </div>
    </template>

    <!-- 头像 -->
    <img
      :src="item.avatar || DEFAULT_VIEWER_AVATAR"
      :alt="item.nickname"
      class="c-mobile-invite-rank__list__item__avatar"
    />

    <!-- 内容 -->
    <slot>
      <p
        :class="{
          'c-mobile-invite-rank__list__item__nick g-singleline': true,
          'c-mobile-invite-rank__list__item__nick--me': isCurrent,
          'pws-mobile-invite-rank__list__item__nick-me': isCurrent,
        }"
      >
        {{ item.nickname }}{{ isCurrent ? `(${$lang('invite.rank.me')})` : '' }}
      </p>
      <div class="c-mobile-invite-rank__list__item__number">
        {{ item.inviteNum }}{{ $lang('invite.rank.people') }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { InviteRankItem, DEFAULT_VIEWER_AVATAR } from '@polyv/live-watch-sdk';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

defineProps({
  /** 邀请榜节点 */
  item: PropUtils.objectType<InviteRankItem>().isRequired,
  /** 该节点的排名数 */
  rank: PropUtils.number.isRequired,
  /** 是否为我自己 */
  isCurrent: PropUtils.bool.def(false),
});
</script>

<style lang="scss">
.c-mobile-invite-rank__list__item {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0 12px;
  color: #adadc0;

  &.c-mobile-invite-rank__list__item--me {
    .c-mobile-invite-rank__list__item__nick--me {
      color: #78a7ed;
    }
  }
}

.c-mobile-invite-rank__list__item__rank {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 38px;
  margin-right: 8px;
  font-size: 14px;
  line-height: 38px;
  text-align: center;
  background-size: 100%;

  span {
    line-height: 1.2;
  }

  &.c-mobile-invite-rank__list__item__rank--1 {
    background-image: url(./imgs/rank-1.png);

    & + .c-mobile-invite-rank__list__item__avatar {
      border-color: #fbc44c;
    }
  }

  &.c-mobile-invite-rank__list__item__rank--2 {
    background-image: url(./imgs/rank-2.png);

    & + .c-mobile-invite-rank__list__item__avatar {
      border-color: #b7cdfd;
    }
  }

  &.c-mobile-invite-rank__list__item__rank--3 {
    background-image: url(./imgs/rank-3.png);

    & + .c-mobile-invite-rank__list__item__avatar {
      border-color: #ffbc72;
    }
  }
}

.c-mobile-invite-rank__list__item__avatar {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border: 2px solid transparent;
  border-radius: 50%;
}

.c-mobile-invite-rank__list__item__nick {
  flex: 1;
  margin-right: 16px;
  font-size: 16px;
  line-height: 56px;
}

.c-mobile-invite-rank__list__item__number {
  font-size: 16px;
}
</style>
