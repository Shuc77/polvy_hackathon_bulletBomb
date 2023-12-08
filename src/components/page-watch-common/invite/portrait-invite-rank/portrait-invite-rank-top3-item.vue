<!-- @file 竖屏-邀请榜前三名 -->
<template>
  <div
    v-if="data"
    :class="[
      'c-portrait-invite-rank__top-three__item',
      `c-portrait-invite-rank__top-three__item--theme__${theme}`,
      `c-portrait-invite-rank__top-three__item--${order}`,
    ]"
  >
    <div class="c-portrait-invite-rank__top-three__item__avatar">
      <img
        v-if="data.avatar"
        :src="data.avatar"
        class="c-portrait-invite-rank__top-three__item__avatar__pic"
      />
      <span
        v-else
        class="c-portrait-invite-rank__top-three__item__avatar__pic"
      ></span>
    </div>
    <div class="c-portrait-invite-rank__top-three__item__detail">
      <p class="g-singleline c-portrait-invite-rank__top-three__item__detail__nick">
        {{ data.nickname || '-' }}
      </p>
      <p
        v-if="data.inviteNum"
        class="c-portrait-invite-rank__top-three__item__detail__num"
      >
        {{ $lang('invite.poster.num.text') }}:<span>{{ data.inviteNum }}</span>
      </p>
      <p
        v-else
        class="c-portrait-invite-rank__top-three__item__detail__num"
      >
        {{ $lang('invite.poster.not.on.the.list') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InviteRankItem } from '@polyv/live-watch-sdk';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { tupleString } from '@/assets/utils/array';

defineProps({
  data: PropUtils.objectType<InviteRankItem>().isRequired,
  order: PropUtils.oneOf(tupleString('first', 'second', 'third')).def('first'),
  theme: PropUtils.oneOf(tupleString('light', 'dark')).def('light'),
});
</script>

<style lang="scss">
.c-portrait-invite-rank__top-three__item {
  width: 33.333%;
  padding-top: 20px;
  text-align: center;
}

.c-portrait-invite-rank__top-three__item--theme__dark {
  .c-portrait-invite-rank__top-three__item__detail__nick {
    color: #333;
  }
  .c-portrait-invite-rank__top-three__item__detail__num {
    color: rgba(#333, 0.8);
    > span {
      color: #333;
    }
  }
}

.c-portrait-invite-rank__top-three__item__avatar {
  position: relative;
  width: 64px;
  height: 64px;
  padding: 2px;
  margin: 0 auto;
  border-radius: 50%;
  &::before {
    position: absolute;
    top: -16px;
    left: 50%;
    width: 32px;
    height: 32px;
    content: '';
    background-repeat: no-repeat;
    background-size: contain;
  }
  &::after {
    position: absolute;
    bottom: 0;
    left: -4px;
    width: 72px;
    height: 20px;
    content: '';
    background-repeat: no-repeat;
    background-size: contain;
  }
  .c-portrait-invite-rank__top-three__item__avatar__pic {
    display: inline-block;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 70%;
    border-radius: 50%;
  }
}
.c-portrait-invite-rank__top-three__item__detail {
  margin-top: 4px;
}
.c-portrait-invite-rank__top-three__item__detail__nick {
  max-width: 100%;
  padding: 0 4px;
  font-size: 14px;
  line-height: 20px;
  color: #fff;
  text-align: center;
}
.c-portrait-invite-rank__top-three__item__detail__num {
  font-size: 12px;
  line-height: 17px;
  color: rgba(#fff, 0.8);
  > span {
    font-family: Invitation;
    color: #fff;
  }
}
.c-portrait-invite-rank__top-three__item--second {
  .c-portrait-invite-rank__top-three__item__avatar {
    background-image: linear-gradient(90deg, #cdebff 0%, #7485ff 100%);
    &::before {
      background-image: url(./imgs/icon-second-place.png);
    }
    &::after {
      background-image: url(./imgs/icon-no.2.png);
    }
    .c-portrait-invite-rank__top-three__item__avatar__pic {
      background-color: #cbdcf7;
      background-image: url(./imgs/icon-default-avatar.png);
    }
  }
}
.c-portrait-invite-rank__top-three__item--first {
  .c-portrait-invite-rank__top-three__item__avatar {
    width: 80px;
    height: 80px;
    background-image: linear-gradient(90deg, #fff088 0%, #ff8300 100%);
    &::before {
      top: -20px;
      width: 40px;
      height: 40px;
      background-image: url(./imgs/icon-champion.png);
    }
    &::after {
      width: 84px;
      height: 26px;
      background-image: url(./imgs/icon-no.1.png);
    }
    .c-portrait-invite-rank__top-three__item__avatar__pic {
      background-color: #fff;
    }
  }
}
.c-portrait-invite-rank__top-three__item--third {
  .c-portrait-invite-rank__top-three__item__avatar {
    background-image: linear-gradient(90deg, #ffd9ad 0%, #ff4a4a 100%);
    &::before {
      background-image: url(./imgs/icon-third-place.png);
    }
    &::after {
      background-image: url(./imgs/icon-no.3.png);
    }
    .c-portrait-invite-rank__top-three__item__avatar__pic {
      background-color: #fdc8b4;
      background-image: url(./imgs/icon-default-avatar.png);
    }
  }
}
</style>
