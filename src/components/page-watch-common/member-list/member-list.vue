<!-- @file PC 端、移动端成员列表 -->
<template>
  <div
    ref="MemberListRef"
    class="c-member-list"
    @scroll="handleScroll"
  >
    <template v-for="groupType in memberGroupTypes">
      <member-list-item
        v-for="member in memberGroupMap[groupType]"
        :key="member.userId"
        :member="member"
      />
    </template>

    <div class="c-member-list__loading__wrap">
      <i
        v-if="loadingVisible"
        class="c-member-list__loading"
      ></i>
      <p
        v-else-if="failTipsVisible"
        class="c-member-list__load-tips c-member-list__load-failed pws-member-list-fail"
      >
        {{ $lang('member.failTips') }}
        <span
          class="pws-member-list-fail-highlight"
          @click="debounceGetMemberList"
        >
          {{ $lang('member.failTips.retry') }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash-es/debounce';
import { onBeforeMount, onMounted, ref, unref } from 'vue';
import { ChatEvents, UserEvents } from '@polyv/live-watch-sdk';

import { getWatchCore } from '@/core/watch-sdk';
import MemberListItem from './member-list-item.vue';
import { useMemberListHook } from './use-member-list';

const {
  isNoMore,
  memberGroupTypes,
  memberGroupMap,

  onUserLogin,
  onUserLogout,
  onSetNick,
  getNextUserList,
  resetMemberQueue,
} = useMemberListHook();

const loadingVisible = ref(false);
const failTipsVisible = ref(false);
const MemberListRef = ref<HTMLDivElement>();
/** 上次列表滚动scrollTop */
const lastScrollTop = ref(0);

onMounted(async () => {
  const watchCore = getWatchCore();
  watchCore.chat.eventEmitter.on(ChatEvents.ChatUserLogin, onUserLogin);
  watchCore.chat.eventEmitter.on(ChatEvents.ChatUserLogout, onUserLogout);
  watchCore.user.eventEmitter.on(UserEvents.UserSetNick, onSetNick);
  await getMemberList();
});

onBeforeMount(() => {
  const watchCore = getWatchCore();
  watchCore.chat.eventEmitter.off(ChatEvents.ChatUserLogin, onUserLogin);
  watchCore.chat.eventEmitter.off(ChatEvents.ChatUserLogout, onUserLogout);
  watchCore.user.eventEmitter.off(UserEvents.UserSetNick, onSetNick);

  resetMemberQueue();
});

/** 获取成员列表 */
async function getMemberList() {
  if (loadingVisible.value || isNoMore.value) {
    return;
  }
  try {
    await getNextUserList();
  } catch (err) {
    console.error(err);
    failTipsVisible.value = true;
  } finally {
    loadingVisible.value = false;
  }
}
const debounceGetMemberList = debounce(getMemberList, 300);

/** 滚动监听事件，滚动时提前加载数据 */
function handleScroll() {
  const $listEl = unref(MemberListRef);
  if (!$listEl) return;

  const isScrollDown = $listEl.scrollTop - lastScrollTop.value > 0;
  if (isScrollDown && $listEl.scrollHeight - $listEl.scrollTop - $listEl.clientHeight <= 100) {
    debounceGetMemberList();
  }
  lastScrollTop.value = $listEl.scrollTop;
}
</script>

<style lang="scss">
.c-member-list {
  box-sizing: border-box;
  height: 100%;
  padding-bottom: 15px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  @include scrollbar;
}

.c-member-list__load-tips {
  margin-top: 17px;
  font-size: 12px;
  color: #adadc0;
  text-align: center;
}
.c-member-list__loading__wrap {
  text-align: center;
  .c-member-list__loading {
    display: inline-block;
    width: 32px;
    height: 32px;
    background-image: url(./imgs/loading.png);
    background-position: center;
    background-size: cover;
    animation: spin 1s ease infinite;
  }
}
.c-member-list__load-failed {
  span {
    color: #3082fe;
    cursor: pointer;
  }
}
</style>
