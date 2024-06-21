<!-- @file 竖屏-邀请榜列表 -->
<template>
  <mobile-popup
    :visible.sync="popupVisible"
    :theme="popupTheme"
    :class="{
      'c-portrait-invite-rank': true,
      'c-portrait-invite-rank--invite-activity': inviteActivityEnabled,
    }"
    :title="translate('menu.tabName.invite')"
    ignore-content-max-height
    :content-percent-height="0.784"
    :content-style="getPopupContentStyle()"
  >
    <div class="c-portrait-invite-rank__main">
      <div
        class="c-portrait-invite-rank__body"
        @scroll="handleScroll"
      >
        <mobile-invite-activity-banner
          v-if="inviteActivityEnabled"
          :show-bottom-bg="false"
        />

        <template v-if="isExistInviteRankData">
          <div class="c-portrait-invite-rank__top-three">
            <portrait-invite-rank-top3-item
              :theme="inviteTop3Theme"
              :data="topThreeRankItems[1]"
              order="second"
            />
            <portrait-invite-rank-top3-item
              :theme="inviteTop3Theme"
              :data="topThreeRankItems[0]"
              order="first"
            />
            <portrait-invite-rank-top3-item
              :theme="inviteTop3Theme"
              :data="topThreeRankItems[2]"
              order="third"
            />
          </div>
          <div
            v-if="rankList.length"
            class="c-portrait-invite-rank__list__wrapper"
          >
            <div class="c-portrait-invite-rank__list">
              <portrait-invite-rank-item
                v-for="(item, idx) in rankList"
                :item="item"
                :order="idx + 4"
                :key="item.openId"
              ></portrait-invite-rank-item>

              <div
                class="c-portrait-invite-rank__list__no-more-tips"
                v-if="isNoMore"
              >
                {{
                  inviteListSettingInfo.inviteListDisplayType === 'partial'
                    ? onlyTopLimitTips
                    : $lang('invite.rank.no.more')
                }}
              </div>
            </div>
          </div>
        </template>
        <div
          v-else
          class="c-portrait-invite-rank__no-data-wrapper"
        >
          <div class="c-portrait-invite-rank__no-data">
            <p>{{ $lang('invite.poster.no.data') }}</p>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showBottomInfo"
      slot="footer"
      class="c-portrait-invite-rank__foot"
    >
      <mobile-invite-activity-will-end-tip
        v-if="inviteActivityWillEndTipVisible"
        class="c-portrait-invite-rank__invite-activity-will-end-tip"
      />

      <!-- 当前观众邀请信息 -->
      <div class="c-portrait-invite-rank__foot--left c-portrait-invite-rank__self">
        <div class="c-portrait-invite-rank__self__order">
          {{ displayCurrentRankInfo.order }}
        </div>
        <div class="c-portrait-invite-rank__self__avatar">
          <img :src="displayCurrentRankInfo.avatar" />
        </div>
        <div
          class="c-portrait-invite-rank__self__info"
          @click="openInviteDetail"
        >
          <p class="g-singleline c-portrait-invite-rank__self__nick">
            {{ displayCurrentRankInfo.nickname }}
          </p>
          <p class="c-portrait-invite-rank__item__invite-text">
            <span>
              {{ currentDes }}
            </span>
            <span
              v-if="inviteDetailEnabled"
              class="c-portrait-invite-rank__self__detail-btn"
            >
              {{ $lang('invite.rank.detail.btn') }}
              <mobile-icon-arrow-right class="c-portrait-invite-rank__self__icon-right" />
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
import { ref, computed } from 'vue';

import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { MobileIconArrowRight } from '@/components/component-icons/mobile/map';
import { PopupTheme } from '@/components/common-base/popup/types';

import PortraitInvitePosterEntry from '../portrait-invite-poster-entry/portrait-invite-poster-entry.vue';
import PortraitInviteRankTop3Item from './portrait-invite-rank-top3-item.vue';
import PortraitInviteRankItem from './portrait-invite-rank-item.vue';

import MobileInviteActivityBanner from '../mobile-invite-activity/mobile-invite-activity-banner/mobile-invite-activity-banner.vue';
import MobileInviteActivityWillEndTip from '../mobile-invite-activity/mobile-invite-activity-will-end-tip/mobile-invite-activity-will-end-tip.vue';

import { appEvents, useEventBusEmitter, useEventBusListener } from '@/app/app-events';
import { useViewerStore } from '@/store/use-viewer-store';
import { useInviteRankHook } from '../hooks/use-invite-rank';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useInviteStore } from '@/store/use-invite-store';
import { translate } from '@/assets/lang';

const { inviteDetailEnabled, inviteActivityEnabled, inviteActivityWillEndTipVisible } =
  storeDefinitionToRefs(useInviteStore);

const {
  currentRankInfo,
  rankList,
  topThreeRankItems,
  isExistInviteRankData,
  currentDes,
  inviteListSettingInfo,
  onlyTopLimitTips,

  showBottomInfo,
  invitePosterEnabled,

  initInviteRank,
  handleScroll,

  isNoMore,
} = useInviteRankHook();

const popupVisible = ref(false);
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

const { emitEvent: emitOpenInviteDetail } = useEventBusEmitter(appEvents.invite.OpenInviteDetail);
function openInviteDetail() {
  if (inviteDetailEnabled.value) {
    emitOpenInviteDetail();
  }
}

useEventBusListener(appEvents.invite.OpenPortraitInviteRank, () => {
  initInviteRank();
  popupVisible.value = true;
});

const popupTheme = computed(() => {
  if (inviteActivityEnabled.value) {
    return PopupTheme.PortraitLight;
  }

  if (!isExistInviteRankData.value) {
    return PopupTheme.PortraitLight;
  }

  return PopupTheme.Portrait;
});

function getPopupContentStyle() {
  if (inviteActivityEnabled.value) {
    return {
      'background-color': '#FFEBD4',
    };
  }

  if (!isExistInviteRankData.value) {
    return {};
  }

  const backgroundImage = require('./imgs/invite-bg.png');
  return {
    'background-image': `url(${backgroundImage})`,
    'background-size': 'cover',
    'background-repeat': 'no-repeat',
    'background-position': '0 bottom',
  };
}

const inviteTop3Theme = computed(() => {
  return inviteActivityEnabled.value ? 'dark' : 'light';
});
</script>

<style lang="scss">
@import './_portrait-invite';

.c-portrait-invite-rank {
  .c-mobile-popup__content {
    border-radius: 8px 8px 0 0;
  }
  &--invite-activity {
    .c-mobile-popup__header {
      // background-color: #f4604b;
      background-color: #fff;
      border-radius: 8px 8px 0 0;
    }
    .c-portrait-invite-rank__top-three {
      position: sticky;
      background: rgb(255, 235, 212);
    }
  }
}

.c-portrait-invite-rank__main {
  box-sizing: border-box;
  height: 100%;
}
.c-portrait-invite-rank__body {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
  overflow: auto;
  font-size: 14px;
  color: #999;
}

// 邀请榜前三
.c-portrait-invite-rank__top-three {
  position: relative;
  top: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 16px;
  padding-bottom: 10px;
}
// 邀请列表
.c-portrait-invite-rank__list__wrapper {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 16px;
  color: #333;
}
.c-portrait-invite-rank__list {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 0;
  background-color: #fff;
  border-radius: 8px;
}

// 无邀请数据
.c-portrait-invite-rank__no-data-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}
.c-portrait-invite-rank__no-data {
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

.c-portrait-invite-rank__invite-activity-will-end-tip {
  position: fixed;
  right: 8px;
  bottom: 56px;
  @include iphone-x-b(90px);
}

// 底部自身邀请数据
.c-portrait-invite-rank__foot {
  position: relative;
  right: 0;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  box-sizing: content-box;
  padding: 8px 92px 0 4px;
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
  margin-left: 4px;
  > img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
  }
}
.c-portrait-invite-rank__self__info {
  position: absolute;
  right: 0;
  left: 90px;
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
.c-portrait-invite-rank__self__detail-btn {
  position: relative;
  display: inline-block;
  padding-right: 12px;
  color: #f98f5a;
}
.c-portrait-invite-rank__self__icon-right {
  position: absolute;
  font-size: 12px;
}
.c-portrait-invite-poster-entry__foot--right {
  position: absolute;
  top: 11px;
  right: 16px;
}

.c-portrait-invite-rank__list__no-more-tips {
  padding: 12px 0;
  font-size: 14px;
  color: #999999;
  text-align: center;
}
</style>
