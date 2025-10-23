<!-- @file PC 端设置昵称占位 -->
<template>
  <div
    class="c-pc-set-nick-placeholder pws-pc-set-nick-placeholder"
    @click="onClickSetNick"
  >
    <span>{{ $lang('chat.setNick.tips1') }}</span>
    <span
      v-if="!hasNickname"
      class="c-pc-set-nick-placeholder--highlight pws-pc-set-nick-placeholder-highlight"
    >
      {{ $lang('chat.setNick.tips2') }}
    </span>
    <span
      v-else-if="needRealNameAuth"
      class="c-pc-set-nick-placeholder--highlight pws-pc-set-nick-placeholder-highlight"
    >
      {{ $lang('realName.phone') }}
    </span>
    <span>{{ $lang('chat.setNick.tips3') }}</span>
  </div>
</template>

<script setup lang="ts">
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useViewerStore } from '@/store/use-viewer-store';

const { hasNickname, needRealNameAuth } = storeDefinitionToRefs(useViewerStore);

const { toInterruptUserClick } = useInterruptUserClick();

function onClickSetNick() {
  toInterruptUserClick({ triggerSource: 'set-nick', ignoreSetNick: false });
}
</script>

<style lang="scss">
.c-pc-set-nick-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  background: #1a1b1f;
}

.c-pc-set-nick-placeholder--highlight {
  margin: 0 3px;
  font-weight: bold;
  color: #78a7ed;
}

.c-pc-msg-input-wrap__msg-input {
  position: relative;
  display: flex;
}
</style>
