<!-- @file 竖屏-邀请榜列表 -->
<template>
  <mobile-popup
    :visible.sync="popupVisible"
    :theme="PopupTheme.Portrait"
    :class="{
      'c-portrait-invite-rank': true,
      'c-portrait-invite-rank--invited': hasInvitingData,
    }"
    :title="$lang('menu.tabName.invite')"
    ignore-content-max-height
    :content-percent-height="0.784"
    :content-style="getPopupContentStyle()"
  >
    <div class="c-portrait-invite-rank__main">
      <div
        class="c-portrait-invite-rank__body"
        @scroll="handleScroll"
      >
        <template v-if="hasInvitingData">
          <div class="c-portrait-invite-rank__top-three">
            <portrait-invite-rank-top3-item
              :data="topThreeRankItems[1]"
              order="second"
            />
            <portrait-invite-rank-top3-item
              :data="topThreeRankItems[0]"
              order="first"
            />
            <portrait-invite-rank-top3-item
              :data="topThreeRankItems[2]"
              order="third"
            />
          </div>
          <div
            v-if="rankList.length > 0"
            class="c-portrait-invite-rank__list"
          >
            <ul>
              <li
                v-for="(item, idx) in rankList"
                :key="item.openId"
                class="c-portrait-invite-rank__item"
              >
                <span class="c-portrait-invite-rank__item__order">{{ idx + 4 }}</span>
                <img
                  class="c-portrait-invite-rank__item__avatar"
                  :src="item.avatar"
                />
                <span class="g-singleline c-portrait-invite-rank__item__nick">{{
                  item.nickname + (isCurrentViewer(item) ? `(${$lang('invite.rank.me')})` : '')
                }}</span>
                <span
                  class="c-portrait-invite-rank__item__invite-text"
                  :class="{
                    'c-portrait-invite-rank__item__invite-text--en':
                      currentLang === LangType.English,
                  }"
                  >{{ $lang('invite.poster.num.text') }}：</span
                >
                <span class="c-portrait-invite-rank__item__invite-num">{{ item.inviteNum }}</span>
              </li>
            </ul>
          </div>
        </template>
        <div
          v-else
          class="c-portrait-invite-rank--no-data"
        >
          <span></span>
          <p>{{ $lang('invite.poster.no.data') }}</p>
        </div>
      </div>
    </div>
    <div
      v-if="showBottomInfo"
      slot="footer"
      class="c-portrait-invite-rank__foot"
    >
      <div class="c-portrait-invite-rank__foot--left c-portrait-invite-rank__self">
        <div class="c-portrait-invite-rank__self__order">
          {{ displayCurrentRankInfo.order }}
        </div>
        <div class="c-portrait-invite-rank__self__avatar">
          <img :src="displayCurrentRankInfo.avatar" />
        </div>
        <div class="c-portrait-invite-rank__self__info">
          <p class="g-singleline c-portrait-invite-rank__self__nick">
            {{ displayCurrentRankInfo.nickname }}
          </p>
          <p class="c-portrait-invite-rank__item__invite-text">
            {{ $lang('invite.poster.num.text') }}:
            <span class="c-portrait-invite-rank__item__invite-num">
              {{ displayCurrentRankInfo.inviteNum }}
            </span>
          </p>
        </div>
      </div>
      <div
        v-if="invitePosterEnabled"
        class="c-portrait-invite-poster-entry__foot--right"
      >
        <portrait-invite-poster-entry />
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PopupTheme } from '@/components/common-base/popup/types';

import PortraitInvitePosterEntry from '../portrait-invite-poster-entry/portrait-invite-poster-entry.vue';
import PortraitInviteRankTop3Item from './portrait-invite-rank-top3-item.vue';

import { appEvents, eventBus } from '@/app/app-events';
import { useViewerStore } from '@/store/use-viewer-store';
import { useInviteRankHook } from '../hooks/use-invite-rank';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';

const {
  currentRankInfo,
  rankList,
  topThreeRankItems,

  showBottomInfo,
  invitePosterEnabled,

  isCurrentViewer,
  initInviteRank,
  handleScroll,
} = useInviteRankHook({
  needFilterZeroInvitee: true,
});

const popupVisible = ref(false);
/** 是否有邀请数据 */
const hasInvitingData = computed(() => {
  return topThreeRankItems.value.length > 0;
});
/** 用于展示的用户排名信息 */
const displayCurrentRankInfo = computed(() => {
  const viewerStore = useViewerStore();

  const inviteNum = currentRankInfo.value ? currentRankInfo.value.inviteNum : 0;
  return {
    order: inviteNum !== 0 ? inviteNum : '-',
    avatar: currentRankInfo.value ? currentRankInfo.value.avatar : viewerStore.avatar,
    nickname: currentRankInfo.value ? currentRankInfo.value.nickname : viewerStore.nickname,
    inviteNum,
  };
});
const { currentLang } = storeDefinitionToRefs(useLangStore);

onMounted(() => {
  eventBus.$on(appEvents.invite.OpenPortraitInviteRank, handlePortraitInviteRankVisible);
});

onBeforeUnmount(() => {
  eventBus.$off(appEvents.invite.OpenPortraitInviteRank, handlePortraitInviteRankVisible);
});

async function handlePortraitInviteRankVisible(visible = true) {
  if (visible) {
    await initInviteRank();
  }
  popupVisible.value = visible;
}

function getPopupContentStyle() {
  const backgroundImage = require('./imgs/invite-bg.png');
  return {
    'background-image': `url(${backgroundImage})`,
    'background-size': 'cover',
    'background-repeat': 'no-repeat',
    'background-position': '0 bottom',
  };
}
</script>

<style lang="scss">
@font-face {
  font-family: Invitation;
  src: url('./fonts/BarlowSemiCondensed-Medium.ttf') format('woff2'),
    url('./fonts/BarlowSemiCondensed-SemiBoldItalic.ttf') format('woff');
}
@mixin invite-order {
  font-family: Invitation;
  font-size: 20px;
  font-style: italic;
  font-weight: bold;
  line-height: 24px;
  color: #fd6d42;
  white-space: nowrap;
}
@mixin invite-num {
  font-family: Invitation;
  font-size: 14px;
  color: #666;
}
.c-portrait-invite-rank {
  .c-mobile-popup__content {
    border-radius: 8px 8px 0 0;
  }
}
.c-portrait-invite-rank__main {
  box-sizing: border-box;
  height: 100%;
  * {
    box-sizing: border-box;
  }
}
.c-portrait-invite-rank__body {
  height: 100%;
  overflow: auto;
  font-size: 14px;
  color: #999;
}
.c-portrait-invite-rank__top-three {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 16px;
}
.c-portrait-invite-rank__list {
  width: 100%;
  padding: 8px 16px;
  color: #333;
  > ul {
    width: 100%;
    padding: 8px 0;
    background-color: #fff;
    border-radius: 8px;
    > li {
      padding: 8px 5px 8px 0;
    }
  }
}
.c-portrait-invite-rank__item {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
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
  white-space: nowrap;
}
.c-portrait-invite-rank__item__invite-text--en {
  width: 50px;
}
.c-portrait-invite-rank__item__invite-num {
  display: inline-block;
  flex-shrink: 0;
  width: 30px;
  text-align: center;
  white-space: nowrap;
  @include invite-num;
}
.c-portrait-invite-rank--no-data {
  position: relative;
  top: 50%;
  text-align: center;
  transform: translateY(-50%);
  &::before {
    display: inline-block;
    width: 60px;
    height: 60px;
    margin-bottom: 8px;
    content: '';
    background-image: url(./imgs/icon-no-invite.png);
    background-repeat: no-repeat;
    background-size: contain;
  }
}
.c-portrait-invite-rank__foot {
  position: relative;
  right: 0;
  bottom: 0;
  left: 0;
  box-sizing: content-box;
  padding: 8px 84px 0 16px;
  overflow: hidden;
  color: #333;
  background-color: #fff;
  @include iphone-x-pb(16px);
}
.c-portrait-invite-rank__self {
  position: relative;
  .c-portrait-invite-rank__item__invite-text,
  .c-portrait-invite-rank__item__invite-num {
    width: auto;
  }
}
.c-portrait-invite-rank__self__order {
  float: left;
  width: 40px;
  margin-top: 7px;
  text-align: center;
  @include invite-order;
}
.c-portrait-invite-rank__self__avatar {
  float: left;
  margin-right: 8px;
  > img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
  }
}
.c-portrait-invite-rank__self__info {
  position: absolute;
  right: 0;
  left: 86px;
}
.c-portrait-invite-rank__self__nick {
  max-width: 100%;
  line-height: 20px;
}
.c-portrait-invite-rank__self__invite-num {
  font-size: 12px;
  line-height: 17px;
  color: #999;
}
.c-portrait-invite-poster-entry__foot--right {
  position: absolute;
  top: 11px;
  right: 16px;
}
</style>
