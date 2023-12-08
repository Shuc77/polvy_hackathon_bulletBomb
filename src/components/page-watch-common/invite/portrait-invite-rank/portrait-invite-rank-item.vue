<template>
  <div class="c-portrait-invite-rank__item">
    <!-- 排序 -->
    <span class="c-portrait-invite-rank__item__order">{{ order }}</span>
    <!-- 头像 -->
    <img
      class="c-portrait-invite-rank__item__avatar"
      :src="item.avatar"
    />
    <!-- 昵称 -->
    <span class="g-singleline c-portrait-invite-rank__item__nick">{{
      item.nickname + (isCurrentViewer(item) ? `(${$lang('invite.rank.me')})` : '')
    }}</span>
    <!-- 邀请人数 -->
    <span
      class="c-portrait-invite-rank__item__invite-text"
      :class="{
        'c-portrait-invite-rank__item__invite-text--en': currentLang === LangType.English,
      }"
      >{{ $lang('invite.poster.num.text') }}:</span
    >
    <span class="c-portrait-invite-rank__item__invite-num">
      {{ item.inviteNum }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';
import { useInviteRankHook } from '../hooks/use-invite-rank';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { InviteRankItem } from '@polyv/live-watch-sdk';

defineProps({
  /** 邀请榜节点 */
  item: PropUtils.objectType<InviteRankItem>().isRequired,
  order: PropUtils.number.isRequired,
});

const { currentLang } = storeDefinitionToRefs(useLangStore);
const { isCurrentViewer } = useInviteRankHook();
</script>

<style lang="scss">
@import './_portrait-invite';

.c-portrait-invite-rank__item {
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 8px 5px 8px 0;
}
.c-portrait-invite-rank__item__order {
  @include invite-order;
  flex-shrink: 0;
  width: 40px;
  text-align: center;
}
.c-portrait-invite-rank__item__avatar {
  width: 36px;
  height: 36px;
  margin-right: 8px;
  border-radius: 50%;
}
.c-portrait-invite-rank__item__nick {
  flex-grow: 1;
}
.c-portrait-invite-rank__item__invite-text {
  display: inline-block;
  flex-shrink: 0;
  width: 60px;
  font-size: 12px;
  color: #999;
  word-break: break-word;
}

.c-portrait-invite-rank__item__invite-text--en {
  width: 54px;
}
.c-portrait-invite-rank__item__invite-num {
  display: inline-block;
  flex-shrink: 0;
  width: 30px;
  text-align: center;
  white-space: nowrap;
  @include invite-num;
}
</style>
