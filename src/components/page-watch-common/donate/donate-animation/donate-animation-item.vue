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
        :style="{
          background: itemBgColor,
        }"
      >
        <!-- 头像 -->
        <div
          class="c-donate-animation-item__pic g-img-cover"
          :style="{
            backgroundImage: `url(${pic})`,
          }"
        ></div>

        <!-- 信息 -->
        <p class="c-donate-animation-item__nick g-singleline">{{ translateNick(nick) }}</p>
        <p class="c-donate-animation-item__bottom">{{ $lang('donate.goodAction') }}{{ content }}</p>

        <!-- 图片 -->
        <div
          v-if="donateType === DonateType.Good"
          class="c-donate-animation-item__good-image g-img-cover"
          :style="{
            backgroundImage: `url(${resizeOSSImg(gimg, 36, 36)})`,
          }"
        ></div>
        <div
          v-else
          class="c-donate-animation-item__good-image c-donate-animation-item__good-image--redpaper g-img-cover"
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
          <span>x</span>
          <span>{{ count }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { generateRandomInteger, numberToFixed } from '@/assets/utils/number';
import { PropUtils, useProps, emitFunc } from '@polyv/vue-components';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { useDonateStore } from '@/store/use-donate-store';
import { useLangStore } from '@/store/use-lang-store';
import { DonateType } from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  /** 动画 id */
  animationId: PropUtils.string.isRequired,
  /** 昵称 */
  nick: PropUtils.string,
  /** 头像 */
  pic: PropUtils.string,
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

const { resizeOSSImg } = useResizeOssImage();

const content = computed(() => {
  if (props.donateType === DonateType.Cash) {
    return `￥${props.rewardContent}`;
  }
  return translateGoodName(props.rewardContent);
});

const bgColors = [
  'linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 85%)',
  'linear-gradient(90deg, rgba(91, 70, 255, 0.6) 0%, rgba(91, 70, 255, 0.1) 85%)',
  'linear-gradient(90deg, rgba(87, 173, 255, 0.7) 9%, rgba(87, 173, 255, 0.1) 83%)',
  'linear-gradient(90deg, rgba(45, 208, 192, 0.6) 2%, rgba(45, 208, 192, 0.1) 85%)',
  'linear-gradient(90deg, rgba(40, 222, 122, 0.6) 0%, rgba(40, 222, 122, 0.1) 85%)',
  'linear-gradient(90deg, rgba(255, 193, 69, 0.7) 9%, rgba(255, 193, 69, 0.1) 83%)',
  'linear-gradient(90deg, rgba(255, 103, 194, 0.6) 4%, rgba(255, 103, 194, 0.1) 85%)',
  'linear-gradient(90deg, rgba(255, 70, 70, 0.6) 0%, rgba(255, 70, 70, 0.1) 85%)',
];

const itemBgColor = ref(bgColors[0]);

const itemShow = ref(false);

/** 显示动画节点 */
function showItem() {
  const bgIndex = numberToFixed(generateRandomInteger(0, bgColors.length - 1), 0);
  itemBgColor.value = bgColors[bgIndex];

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
  margin-left: 12px;
}

.c-donate-animation-item__content {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 6px 48px 0 40px;
  background: linear-gradient(90deg, rgba(91, 70, 255, 0.6) 0%, rgba(91, 70, 255, 0.1) 85%);
  border-radius: 18px;
}

.c-donate-animation-item__pic {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.c-donate-animation-item__nick {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.c-donate-animation-item__bottom {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(#ffffff, 0.6);
  white-space: nowrap;
  transform: scale(0.83);
  transform-origin: top left;
}

.c-donate-animation-item__good-image {
  position: absolute;
  right: 4px;
  bottom: 0;
  width: 36px;
  height: 36px;
}
.c-donate-animation-item__good-image--redpaper {
  background-image: url(./imgs/donate-float-tips-redpaper.png);
}

.c-donate-animation-item__count {
  position: absolute;
  top: 8px;
  left: 100%;
  padding-left: 8px;
  color: #fff;
  white-space: nowrap;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);

  span {
    &:first-child {
      margin-right: 2px;
      font-size: 14px;
    }
    &:last-child {
      @include alibaba-font(20px, 800);
    }
  }
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
