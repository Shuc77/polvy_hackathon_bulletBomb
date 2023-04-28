<!-- @file 移动端播放器控制栏设置面板 -->
<template>
  <div
    class="c-mobile-player-control-setting"
    :class="{
      'c-mobile-player-control-setting--page-fullscreen': mobilePlayerIsPageFullscreen,
    }"
    @click.stop="emitClose"
  >
    <div
      class="c-mobile-player-control-setting__content"
      @click.stop="emitClose"
    >
      <div
        v-if="barrageBackstageEnabled"
        class="c-mobile-player-control-setting__barrage"
        :class="{
          'c-mobile-player-control-setting__barrage--off': !barrageShow,
        }"
        @click.stop="toToggleBarrageShow"
      >
        <mobile-icon-danmu-switch class="c-mobile-player-control-setting__barrage__icon" />
        <span>{{
          barrageShow ? $lang('player.barrage.close') : $lang('player.barrage.show')
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { MobileIconDanmuSwitch } from '@/components/component-icons/mobile/map';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerAction } from '../../hooks/use-player-action';

const emit = defineEmits({
  /** 关闭设置 */
  'close-setting': emitFunc<void>(),
});

const { barrageShow, barrageBackstageEnabled } = storeDefinitionToRefs(usePlayerStore);

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const { toToggleBarrageShow } = usePlayerAction();

function emitClose() {
  emit('close-setting');
}
</script>

<style lang="scss">
.c-mobile-player-control-setting {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: initial;
}
.c-mobile-player-control-setting__content {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
}

.c-mobile-player-control-setting__barrage {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: $--color-white;
  transform: translate(-50%, -50%);
}
.c-mobile-player-control-setting__barrage__icon {
  display: flex;
  margin-bottom: 8px;
  font-size: 32px !important;
}
.c-mobile-player-control-setting__barrage--off {
  color: $--color-primary;
}

.c-mobile-player-control-setting--page-fullscreen {
  .c-mobile-player-control-setting__content {
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 100%;
  }
}
</style>
