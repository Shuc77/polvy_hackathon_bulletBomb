<!-- @file 移动端基础信息显示 -->
<template>
  <div class="c-mobile-basic-info">
    <!-- 基础信息 -->
    <div class="c-mobile-basic-info__channel">
      <!-- 频道 logo -->
      <div
        class="c-mobile-basic-info__channel__cover g-img-cover"
        :style="{
          backgroundImage: `url(${resizeOSSImg(channelCoverImg, 80, 80)})`,
        }"
      ></div>
      <div class="c-mobile-basic-info__channel__inner">
        <!-- 频道标题 + 频道状态 -->
        <div class="c-mobile-basic-info__channel__inner__top">
          <div
            class="c-mobile-basic-info__channel__inner__title pws-mobile-basic-info-channel-title"
          >
            {{ channelTitle }}
          </div>
          <div class="c-mobile-basic-info__channel__inner__status">
            <mobile-status-tag :live-status="liveStatusByDebug" />
          </div>
        </div>
        <!-- 直播时间 + 浏览次数 + 无延迟标记 -->
        <div class="c-mobile-basic-info__channel__inner__bottom pws-mobile-basic-info-data">
          <span
            class="c-mobile-basic-info__channel__inner__start-time pws-mobile-basic-info-start-time"
          >
            {{ pageViewVisible ? '' : `${$lang('watch.liveTime')}：` }}
            {{ liveStartTimeText }}
          </span>
          <span
            v-if="pageViewVisible"
            class="c-mobile-basic-info__channel__inner__page-view pws-mobile-basic-info-page-view"
          >
            {{ shortNumber(pageViewCount) }} {{ $lang('watch.pvSuffix') }}
          </span>
          <span
            v-if="isLowLatency"
            class="c-mobile-basic-info__channel__inner__no-delay g-img-cover"
          ></span>
        </div>
      </div>
    </div>

    <!-- 主持人信息 -->
    <div class="c-mobile-basic-info__author pws-mobile-basic-info-author">
      <!-- 主持人 -->
      <div
        class="c-mobile-basic-info__author__publisher pws-mobile-basic-info-publisher"
        @click="togglePublisherFullVisible"
      >
        <mobile-icon-people class="c-mobile-basic-info__author__publisher__icon" />
        <span
          :class="{
            'g-multiline': !publisherFullVisible,
          }"
        >
          {{ channelPublisher }}
        </span>
      </div>
      <!-- 点赞数 -->
      <div
        v-if="showLikeCount"
        class="c-mobile-basic-info__author__like-count g-text-nowrap pws-mobile-basic-info-like"
      >
        <mobile-icon-like class="c-mobile-basic-info__author__like-count__icon" />
        <span>{{ likeCount }}</span>
      </div>
    </div>

    <!-- 频道介绍 -->
    <div
      v-if="showDesc"
      class="c-mobile-basic-info__desc"
    >
      <mobile-rich-text-render :html-content="channelDescription" />
    </div>

    <!-- 页脚 -->
    <mobile-page-footer v-if="showPageFooter" />
  </div>
</template>

<script setup lang="ts">
import { resizeOSSImg } from '@/assets/utils/image';
import { shortNumber } from '@/assets/utils/number';

import { MobileIconPeople, MobileIconLike } from '@/components/component-icons/mobile/map';
import MobileRichTextRender from '@/components/common-base/rich-text-render/mobile-rich-text-render.vue';
import MobilePageFooter from '@/components/common-business/page-footer/mobile-page-footer.vue';
import MobileStatusTag from '@/components/common-business/status-tag/mobile-status-tag.vue';

import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelStore } from '@/store/use-channel-store';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { PropUtils, useProps } from '@/assets/utils/vue-utils/props-utils';
import { computed, unref } from 'vue';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';

const props = defineProps({
  /** 是否显示页面浏览次数，默认：true */
  showPageView: PropUtils.bool.def(true),
  /** 是否显示点赞数，默认：true */
  showLikeCount: PropUtils.bool.def(true),
  /** 是否渲染频道介绍，默认：true */
  showDesc: PropUtils.bool.def(true),
  /** 是否渲染页脚，默认：true */
  showPageFooter: PropUtils.bool.def(true),
});

const { showPageView, showLikeCount, showDesc } = useProps(props);

const { liveStatusByDebug } = storeDefinitionToRefs(useChannelStore);

const {
  channelCoverImg,
  channelTitle,
  channelPublisher,
  pvShowEnabled,
  pageViewCount,
  likeCount,
  channelDescription,
  liveStartTimeText,
} = storeDefinitionToRefs(useChannelInfoStore);

const { isLowLatency } = storeDefinitionToRefs(usePlayerStore);

/** 页面浏览次数显示状态 */
const pageViewVisible = computed(() => {
  return unref(pvShowEnabled) && unref(showPageView);
});

/** 主持人是否显示完整 */
const { visible: publisherFullVisible, toggle: togglePublisherFullVisible } =
  useSimpleVisible(false);
</script>

<style lang="scss">
.c-mobile-basic-info {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.c-mobile-basic-info__channel {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 16px;
}

.c-mobile-basic-info__channel__cover {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.c-mobile-basic-info__channel__inner {
  flex: 1;
}

.c-mobile-basic-info__channel__inner__top {
  display: flex;
  justify-content: space-between;
}
.c-mobile-basic-info__channel__inner__title {
  font-size: 16px;
  line-height: 20px;
  word-break: break-word;
}

.c-mobile-basic-info__channel__inner__status {
  margin-left: 10px;
  white-space: nowrap;
}

.c-mobile-basic-info__channel__inner__bottom {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.c-mobile-basic-info__channel__inner__page-view {
  height: 10px;
  padding-left: 8px;
  margin-left: 8px;
  line-height: 10px;
  vertical-align: top;
  border-left: 1px solid #aaa;
}

.c-mobile-basic-info__channel__inner__no-delay {
  width: 58px;
  height: 18px;
  margin-top: -3px;
  margin-left: auto;

  background-image: url(./imgs/low-latency-bg-mob.svg);
}

.c-mobile-basic-info__author {
  display: flex;
  align-items: flex-start;
  padding: 10px 16px;

  font-size: 12px;

  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}

.c-mobile-basic-info__author__publisher {
  display: flex;
  align-items: flex-start;
  margin-right: 16px;
  line-height: 16px;
}

.c-mobile-basic-info__author__like-count {
  display: flex;
  align-items: center;
}

.c-mobile-basic-info__author__like-count {
  margin-left: auto;
}

.c-mobile-basic-info__author__publisher__icon,
.c-mobile-basic-info__author__like-count__icon {
  display: flex;
  margin-right: 4px;
  font-size: 16px !important;
}

.c-mobile-basic-info__desc {
  flex: 1;
}
</style>
