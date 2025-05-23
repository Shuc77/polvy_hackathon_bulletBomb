<template>
  <div class="c-mobile-playback-outline">
    <div
      v-show="outlineType === 'finish'"
      class="c-mobile-playback-outline__wrap pws-ai-outline-text"
    >
      <!-- 摘要 -->
      <div class="c-mobile-playback-outline__introduction">
        <div class="c-mobile-playback-outline__introduction__title">
          <span>{{ $lang('ai.summary.desc') }}</span>
          <span
            class="c-mobile-playback-outline__introduction__mind"
            @click="handleMinMapPreview"
          >
            {{ $lang('ai.summary.mind') }}
            <mobile-icon-arrow-right />
          </span>
        </div>
        <div class="c-mobile-playback-outline__introduction__content pws-ai-outline-bg">
          <p
            ref="contentRef"
            class="pws-ai-outline-desc"
            :class="{
              expanded: isUnFold,
            }"
          >
            {{ introduction }}
          </p>
          <label
            v-if="shouldShowButton"
            class="pws-ai-outline-label-text pws-ai-outline-label-bg"
            @click="handleUnFold"
            >{{ isUnFold ? $lang('base.packUp') : $lang('base.spreadOut') }}</label
          >
        </div>
      </div>
      <!-- 分段总结 -->
      <div
        v-show="outlineContent"
        class="c-mobile-playback-outline__summary"
      >
        <div class="c-mobile-playback-outline__summary__title">{{ $lang('ai.summary.sum') }}</div>
        <div
          class="c-mobile-playback-outline__summary__content pws-ai-outline-bg pws-ai-outline-desc"
        >
          <div
            v-for="(item, index) in outlineContent"
            :key="index"
            class="c-mobile-playback-outline__paragraph"
          >
            <!-- 段落标题 -->
            <div class="c-mobile-playback-outline__paragraph__title">
              <div class="c-mobile-playback-outline__paragraph-info pws-ai-outline-desc">
                {{ item.title }}
              </div>
              <div
                class="c-mobile-playback-outline__paragraph-tag pws-ai-outline-tag"
                @click="handleSeekVideo(item.startTime)"
              >
                <div>{{ item.startTime }}</div>
              </div>
            </div>
            <!-- 有序列表 -->
            <ul class="c-mobile-playback-outline__paragraph__content">
              <li
                v-for="(summaryItem, idx) in item.summary"
                :key="idx"
              >
                {{ summaryItem }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="outlineType !== 'finish'"
      class="c-mobile-playback-outline__empty pws-ai-outline-text"
    >
      <img
        v-if="outlineType === 'init'"
        class="c-mobile-playback-outline__empty__icon"
        src="./images/icon-empty.png"
      />
      {{ outlineType === 'init' ? $lang('ai.summary.init') : $lang('ai.summary.empty') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { MobileIconArrowRight } from '@/components/component-icons/mobile/map';
import { useAISummary } from './use-playback-outline';
import { computed, ref } from 'vue';

const {
  outlineType,
  isUnFold,
  outlineContent,
  introduction,

  handleUnFold,
  handleMinMapPreview,
  handleSeekVideo,
} = useAISummary();

const contentRef = ref();

const textLength = computed(() => {
  return introduction.value.trim().length || 0;
});

const shouldShowButton = computed(() => {
  const chartTextLime = 68;
  return textLength.value > chartTextLime;
});
</script>

<style lang="scss">
.c-mobile-playback-outline {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
.c-mobile-playback-outline__wrap {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 16px;
  color: #ffffff;
  @include iphone-x-pb(24px);
}

.c-mobile-playback-outline__introduction {
  display: flex;
  flex-direction: column;
}
.c-mobile-playback-outline__introduction__title,
.c-mobile-playback-outline__summary__title {
  margin: 10px 0;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  // color: #ffffff;
}
.c-mobile-playback-outline__introduction__title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  :last-child {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-left: 4px;
  }
}
.c-mobile-playback-outline__introduction__mind {
  font-size: 14px;
  line-height: 22px;
}

.c-mobile-playback-outline__introduction__content {
  position: relative;
  box-sizing: border-box;
  display: flex;
  // padding: 12px 26px 12px 12px;
  flex-direction: column;
  padding: 12px 12px 6px 12px;
  margin-bottom: 10px;
  background: rgba($color: #ffffff, $alpha: 0.1);
  border-radius: 4px;

  > p {
    flex: 1;
    min-width: 0;
    max-height: 66px;
    overflow: hidden;
    font-size: 14px;
    line-height: 22px;
    color: rgba($color: #ffffff, $alpha: 0.8);
    text-align: justify;
    word-wrap: break-word;
    transition: max-height 0.3s ease-out;
    @include multiline-text(3);
  }

  > p.expanded {
    max-height: none;
    -webkit-line-clamp: initial;
    &::last-line {
      padding-right: 20px;
    }
  }

  > label {
    font-size: 14px;
    line-height: 22px;
    color: #3f76fc;
    text-align: end;
    background-color: #37383d;
  }
}

.c-mobile-playback-outline__summary__content {
  padding: 12px 12px 0 12px;
  font-size: 14px;
  line-height: 1.3;
  color: rgba($color: #ffffff, $alpha: 0.8);
  background: rgba($color: #ffffff, $alpha: 0.1);
  border-radius: 4px;
}

.c-mobile-playback-outline__paragraph__title {
  display: flex;
  align-items: center;
}
.c-mobile-playback-outline__paragraph + .c-mobile-playback-outline__paragraph {
  padding-top: 14px;
  border-top: 1px solid rgba($color: #ffffff, $alpha: 0.1);
}
.c-mobile-playback-outline__paragraph-tag {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding-bottom: 2px;
  color: #bec2ca;
  cursor: pointer;
  border-radius: 4px;

  > div {
    font-size: 12px;
    line-height: 1 !important;
  }
}
.c-mobile-playback-outline__paragraph-info {
  display: inline-block;
  margin-right: 8px;
  overflow: hidden;
  font-size: 15px;
  font-weight: 500;
  color: rgba($color: #ffffff, $alpha: 0.8);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.c-mobile-playback-outline__paragraph__content {
  padding: 8px 12px 10px 0;
  font-size: 14px;
  line-height: 22px;
}
.c-mobile-playback-outline__tip {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  font-size: 14px;
  color: #999;
}
.c-mobile-playback-outline__preview {
  width: 100%;
  height: 300px;
}
.c-mobile-playback-outline__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 50%;
  font-size: 14px;
  color: #ffffff;
  transform: translateY(-40px);
}
.c-mobile-playback-outline__empty__icon {
  width: 26px;
  height: 18px;
  margin-bottom: 15px;
}
</style>
