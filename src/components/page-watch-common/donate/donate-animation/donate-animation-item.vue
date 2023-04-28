<!-- @file 打赏动画节点 -->
<template>
  <div class="c-donate-animation-item">
    <transition
      name="donate-animation"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
    >
      <div
        v-show="itemShow"
        class="c-donate-animation-item__content"
      >
        <!-- 信息 -->
        <p class="c-donate-animation-item__nick g-singleline">{{ translateNick(nick) }}</p>
        <p class="c-donate-animation-item__bottom">
          {{ $lang('donate.goodAction') }} {{ content }}
        </p>

        <!-- 图片 -->
        <div
          v-if="donateType === DonateType.Good"
          class="c-donate-animation-item__pic g-img-cover"
          :style="{
            backgroundImage: `url(${gimg})`,
          }"
        ></div>
        <div
          v-else
          class="c-donate-animation-item__pic c-donate-animation-item__pic--redpaper g-img-cover"
        ></div>

        <!-- 数量 -->
        <div
          v-if="count > 1"
          class="c-donate-animation-item__count"
          :class="{
            'c-donate-animation-item__count--long': count > 99,
            'c-donate-animation-item__count--animation': countAnimation,
          }"
        >
          <span>&times; </span>
          <span>{{ count }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils, useProps } from '@/assets/utils/vue-utils/props-utils';
import { useDonateStore } from '@/store/use-donate-store';
import { useLangStore } from '@/store/use-lang-store';
import { DonateType } from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  /** 动画 id */
  animationId: PropUtils.string.isRequired,
  /** 昵称 */
  nick: PropUtils.string,
  /** 打赏道具图片 */
  gimg: PropUtils.string,
  /** 礼物数量 */
  count: PropUtils.number.def(1),
  /** 打赏内容 */
  rewardContent: PropUtils.string,
  /** 打赏类型 */
  donateType: PropUtils.enum<DonateType>(),
});

const emit = defineEmits({
  'after-leave': emitFunc<void>(),
});

const { nick, donateType, gimg, count } = useProps(props);

const { translateNick } = useLangStore();

const { translateGoodName } = useDonateStore();

const content = computed(() => {
  if (props.donateType === DonateType.Cash) {
    return `￥${props.rewardContent}`;
  }
  return translateGoodName(props.rewardContent);
});

const itemShow = ref(false);

/** 显示动画节点 */
function showItem() {
  itemShow.value = true;
  resetHideTimer();
}

/** 隐藏动画节点 */
function hideItem() {
  itemShow.value = false;
  clearHideTimer();
}

let hideTimer: number | undefined;

/** 重置隐藏定时器 */
function resetHideTimer() {
  clearHideTimer();
  hideTimer = window.setTimeout(() => {
    hideItem();
  }, 2000);
}

/** 清空隐藏定时器 */
function clearHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }
}

onMounted(() => {
  showItem();
});

onBeforeUnmount(() => {
  clearHideTimer();
});

/** 数量动画 */
const countAnimation = ref(false);

function onAfterEnter() {
  countAnimation.value = true;
}

/** 处理动画里玩完成 */
function onAfterLeave() {
  emit('after-leave');
}
</script>

<style lang="scss">
@import './styles/var.scss';

.c-donate-animation-item {
  width: $--donate-animation-item-width;
  height: $--donate-animation-item-height;
  margin-bottom: $--donate-animation-item-margin;
}

.c-donate-animation-item__content {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 122px 0 12px;
  background-image: url(./imgs/donate-float-tips-bg.png);
  background-size: 100%;
}

.c-donate-animation-item__nick {
  font-size: 14px;
  color: #fcf2a6;
}

.c-donate-animation-item__bottom {
  margin-top: 4px;
  font-size: 12px;
  color: $--color-white;
}

.c-donate-animation-item__pic {
  position: absolute;
  right: 54px;
  bottom: 0;
  width: 56px;
  height: 56px;
  background-image: url(./imgs/donate-float-tips-redpaper.png);
}

.c-donate-animation-item__count {
  position: absolute;
  top: 8px;
  left: #{$--donate-animation-item-width - 50px};
  font-style: italic;
  font-weight: 800;
  color: #f57c00;
  text-shadow: #fff 1px 0 0, #fff 0 1px 0, #fff -1px 0 0, #fff 0 -1px 0;

  span {
    margin-right: 2px;
    &:first-child {
      font-size: 20px;
    }
    &:last-child {
      font-size: 28px;
    }
  }
}
.c-donate-animation-item__count--long span:last-child {
  font-size: 22px;
}
.c-donate-animation-item__count--animation {
  animation: rewardNumber 0.3s linear;
}

@keyframes rewardNumber {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

.donate-animation-enter-active {
  transform: translateX(-270px);
  animation: rewardStart 0.15s linear forwards;
}
.donate-animation-leave-active {
  transform: translateY(0);
  animation: rewardEnd 0.1s linear;
}

@keyframes rewardStart {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes rewardEnd {
  from {
    margin-top: 0;
    opacity: 1;
  }
  to {
    margin-top: -#{$--donate-animation-item-height + $--donate-animation-item-margin};
    opacity: 0;
  }
}
</style>
