<!-- @file 移动端-横屏-邀请榜列表 -->
<template>
  <div class="c-mobile-invite-rank">
    <section
      class="c-mobile-invite-rank__list"
      @scroll="handleScroll"
    >
      <div class="c-mobile-invite-rank__list__title">
        <span>{{ $lang('invite.rank') }}</span>
        <span>{{ $lang('invite.rank.people.number') }}</span>
      </div>

      <!-- 前三名 -->
      <invite-rank-item
        v-for="(item, index) in topThreeRankItems"
        :rank="index + 1"
        :is-current="isCurrentViewer(item)"
        :item="item"
        :key="item.openId"
      />

      <!-- 除开前三名的列表 -->
      <invite-rank-item
        v-for="(item, index) in rankList"
        :rank="index + 4"
        :is-current="isCurrentViewer(item)"
        :item="item"
        :key="item.openId"
      />
      <div
        v-if="isLoading"
        class="c-mobile-invite-rank__list--loading"
      >
        <list-loading />
      </div>
      <div
        v-else-if="isNoMore"
        class="c-mobile-invite-rank__list__nomore"
      >
        {{ $lang('invite.rank.no.more') }}
      </div>
      <div
        v-else-if="isLoadFailed"
        class="c-mobile-invite-rank__list__failed"
      >
        {{ $lang('invite.rank.loaded.failed') }}
      </div>
    </section>

    <!-- 我的排名信息 -->
    <section
      v-if="showBottomInfo"
      class="c-mobile-invite-rank__me"
    >
      <invite-rank-item
        v-if="currentRankInfo"
        :rank="currentRankInfo.rank"
        :item="currentRankInfo"
        :is-current="true"
      >
        <div class="c-mobile-invite-rank__me__info">
          <p
            :class="{
              'c-mobile-invite-rank__me__info__nick': true,
              'c-mobile-invite-rank__me__info__nick--small': currentLang !== LangType.Chinese,
            }"
          >
            {{ $lang('invite.rank.invited', { number: String(currentRankInfo.inviteNum) }) }}
          </p>
          <p class="c-mobile-invite-rank__me__info__margin">{{ currentDes }}</p>
        </div>
        <invite-entry-capsule v-if="invitePosterEnabled" />
      </invite-rank-item>
      <div
        v-else
        class="c-mobile-invite-rank__not__info"
      >
        <span class="c-mobile-invite-rank__not__info__text">
          {{ $lang('invite.rank.click.btn.desc') }}
        </span>
        <invite-entry-capsule v-if="invitePosterEnabled" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ListLoading from '@/components/common-base/list-loading/list-loading.vue';
import InviteEntryCapsule from '../mobile-invite-poster-entry/mobile-invite-poster-entry-capsule.vue';
import InviteRankItem from './mobile-invite-rank-item.vue';
import { useInviteRankHook } from '../hooks/use-invite-rank';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';

const {
  currentRankInfo,
  topThreeRankItems,
  rankList,
  isLoading,
  isNoMore,
  isLoadFailed,

  showBottomInfo,
  currentDes,
  invitePosterEnabled,

  isCurrentViewer,
  initInviteRank,
  handleScroll,
} = useInviteRankHook();

const { currentLang } = storeDefinitionToRefs(useLangStore);

onMounted(() => {
  initInviteRank();
});
</script>

<style lang="scss">
.c-mobile-invite-rank {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-mobile-invite-rank__list {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}

.c-mobile-invite-rank__list__title {
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 40px;
  color: #adadc0;
}

.c-mobile-invite-rank__list__nomore,
.c-mobile-invite-rank__list__failed {
  height: 44px;
  font-size: 14px;
  line-height: 44px;
  color: #595a66;
  text-align: center;
}

.c-mobile-invite-rank__list--loading {
  text-align: center;
}

.c-mobile-invite-rank__me {
  z-index: 10;
  flex-shrink: 0;
  width: 100%;
  word-wrap: break-word;
  background: #292b32;
  @include iphone-x-pb(0);
}
.c-mobile-invite-rank__me__info {
  flex: 1;
  margin-right: 16px;
}
.c-mobile-invite-rank__me__info__nick {
  font-size: 14px;
  word-break: break-word;

  &.c-mobile-invite-rank__me__info__nick--small {
    font-size: 12px;
  }
}

.c-mobile-invite-rank__me__info__margin {
  margin-top: 4px;
  font-size: 12px;
  word-break: break-word;
}

.c-mobile-invite-rank__not__info {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 8px 0 16px;
  color: #adadc0;
}
.c-mobile-invite-rank__not__info__text {
  flex: 1;
  margin-right: 8px;
  font-size: 14px;
  line-height: 20px;
  word-break: break-word;
}
</style>
