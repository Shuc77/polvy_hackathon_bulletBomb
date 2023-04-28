<!-- @file 在线列表单个观众组件 -->

<template>
  <div
    class="c-member-list-item pws-member-list-item"
    :class="{
      'pws-member-list-item-special': isSpecialUser,
    }"
  >
    <span class="c-member-list-item__avatar__wrap">
      <span
        class="c-member-list-item__avatar"
        :style="{ backgroundImage: `url(${member.pic || DEFAULT_VIEWER_AVATAR})` }"
      ></span>
    </span>
    <span class="c-member-list-item__nick g-singleline">
      {{ getDisplayMemberName(member) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_VIEWER_AVATAR } from '@/assets/constants/defaults';
import { specialUserTypes } from '@/assets/constants/special-user-types';
import { translate } from '@/assets/lang';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { useLangStore } from '@/store/use-lang-store';
import { computed } from 'vue';
import { MemberAdditionalGroupTypes, MemberInfo } from './use-member-list';

const { translateNick } = useLangStore();

const props = defineProps({
  member: PropUtils.objectType<MemberInfo>().def(),
});

/** 获取展示的成员名称 */
function getDisplayMemberName(member: MemberInfo) {
  let displayMemberName = '';

  displayMemberName = member.actor ? member.actor + ' - ' : '';
  displayMemberName += translateNick(member.nick);
  displayMemberName +=
    member.groupType === MemberAdditionalGroupTypes.SELF ? `(${translate('member.self')})` : '';

  return displayMemberName;
}

const isSpecialUser = computed<boolean>(() => {
  return specialUserTypes.includes(props.member.userType);
});
</script>

<style lang="scss">
$avatarWidth: 28px;

.c-member-list-item {
  position: relative;
  height: $avatarWidth;
  padding-top: 15px;
  padding-left: $avatarWidth + 8px;
  margin: 0 16px;
  overflow: hidden;
  line-height: $avatarWidth;
  color: #adadc0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.c-member-list-item__avatar__wrap {
  position: absolute;
  top: 15px;
  left: 0;
  display: inline-block;
  width: $avatarWidth;
  height: $avatarWidth;
  vertical-align: middle;
}
.c-member-list-item__avatar {
  display: inline-block;
  width: $avatarWidth;
  height: $avatarWidth;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
}
.c-member-list-item__nick {
  width: 100%;
  font-size: 14px;
}
</style>
