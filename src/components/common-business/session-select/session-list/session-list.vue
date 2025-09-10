<template>
  <div class="c-session-list">
    <component-layout-container
      v-if="dataList.length"
      :lazy-load-enabled="lazyLoadEnabled"
      :in-desk-top-view-adapter-mode="inDeskTopViewAdapterMode"
      :component-layout="componentLayout"
      :data-sources="dataList"
      :get-scroll-ref="getScrollRef"
      id-key="sessionId"
      @load-more="emits('load-more-list')"
      v-slot="{ item }"
    >
      <session-list-item
        :session-data="item"
        :size="sessionListItemSize"
        @item-click="toRedirectTargetSessionWatchPage"
      />
    </component-layout-container>
    <div
      v-else
      class="c-session-list__empty-container"
    >
      <div class="c-session-list__empty-wrapper">
        <mobile-icon-video-recorder class="c-session-list__empty-wrapper__icon" />
        <div>{{ $lang('channel.session.notFound') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed } from 'vue';

import { PropUtils, emitFunc } from '@polyv/vue-components';
import { ChannelSessionDataItem } from '@polyv/live-watch-sdk';

import { ComponentLayoutType } from '@/components/common-base/component-layout-container/type';
import ComponentLayoutContainer from '@/components/common-base/component-layout-container/component-layout-container.vue';
import { MobileIconVideoRecorder } from '@/components/component-icons/mobile/map';
import SessionListItem from './session-list-item.vue';
import { SessionListItemSize } from './type';
import {
  isBuildForFeedMainMode,
  isInjectByExternalApp,
  isStaticBuildMode,
} from '@/assets/utils/utils';
import { extractChannelAndSessionId, useQueryParams } from '@/hooks/core/use-query-params';
import { appendToURL } from '@just4/querystring';
import { useToastManager } from '@/hooks/components/use-toast';

const { paramGetter, getQueryParams } = useQueryParams();

const { toast } = useToastManager();

const props = defineProps({
  lazyLoadEnabled: PropUtils.bool.def(true),
  /** 是否处于桌面端适配模式 */
  inDeskTopViewAdapterMode: PropUtils.bool.def(false),
  /** 组件布局 */
  componentLayout: PropUtils.enum<ComponentLayoutType>().def(ComponentLayoutType.LargeImage),
  /** 频道列表数据 */
  dataList: PropUtils.array<ChannelSessionDataItem>().def(() => []),
  /** 获取滚动区域 */
  getScrollRef: PropUtils.func<() => Ref<HTMLElement | undefined>>().def(),
});

const emits = defineEmits({
  'load-more-list': emitFunc<void>,
});

const sessionListItemSize = computed<SessionListItemSize>(() => {
  switch (props.componentLayout) {
    case ComponentLayoutType.LargeImage:
      return 'normal';
    case ComponentLayoutType.RowWrap:
      return props.inDeskTopViewAdapterMode ? 'large' : 'medium';
    case ComponentLayoutType.HorizontalScroll:
      return 'small';
    case ComponentLayoutType.DetailList:
      return 'detail_list';
    case ComponentLayoutType.DetailListHorizontal:
      return 'detail_list_horizontal';
    default:
      return props.inDeskTopViewAdapterMode ? 'large_auto' : 'medium_auto';
  }
});

function toRedirectTargetSessionWatchPage(item: ChannelSessionDataItem) {
  const { origin, pathname, search } = window.location;

  // 暂时不处理信息流模式
  if (isBuildForFeedMainMode()) {
    toast.error('not support');
    return;
  }

  /** 非 SaaS 正常观看页使用场景 */
  const isNotSaasPage = isInjectByExternalApp() || isStaticBuildMode() || paramGetter().channelId();

  const searchParams = getQueryParams();

  if (isNotSaasPage) {
    const redirectUrl = appendToURL(`${location.origin}${location.pathname}`, {
      ...searchParams,
      targetSessionId: item.sessionId,
    });
    window.location.href = redirectUrl;
    return;
  }

  // SaaS 正常观看页使用场景
  const { channelId, targetSessionId } = extractChannelAndSessionId();
  if (!channelId) {
    toast.error('异常链接');
    return;
  }

  if (!targetSessionId) {
    // pathname = /watch/channelId
    window.location.href = `${origin}${pathname}/${item.sessionId}${search}`;
    return;
  }

  // pathname = /watch/channelId/sessionId
  const pathnameList = pathname.split('/');
  pathnameList.splice(-1);
  const newPathname = pathnameList.join('/');
  window.location.href = `${origin}${newPathname}/${item.sessionId}${search}`;
}
</script>

<style lang="scss">
.c-session-list {
  padding: 0 12px 12px;
}

.c-session-list__empty-container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 12px;
  font-size: 14px;
  color: #999999;
  background: #ffffff;
  border-radius: 12px;

  .c-session-list__empty-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 300px;
    border-radius: 12px;
  }

  .c-session-list__empty-wrapper__icon {
    color: #e1e5e8;
    svg {
      width: 90px;
      height: 64px;
    }
  }
}
</style>
