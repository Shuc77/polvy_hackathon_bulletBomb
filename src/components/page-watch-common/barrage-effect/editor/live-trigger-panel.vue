<!-- @file 直播实时特效面板 -->
<template>
  <div class="c-live-trigger-panel">
    <p class="c-live-trigger-panel__hint">
      点一下模板，立即在直播间放一次，同一直播间的所有观众都会看到。
      参数与点播回放共用：先点卡片右下角「调参数」在右侧面板里调好，再回来点放。
    </p>

    <div class="c-live-trigger-panel__grid">
      <div
        v-for="item in liveTemplates"
        :key="item.name"
        class="c-live-trigger-panel__cell"
      >
        <button
          type="button"
          class="c-live-trigger-panel__item"
          :class="{ 'is-busy': sending && busyTemplate === item.name }"
          :disabled="sending"
          @click="fire(item.name)"
        >
          <span class="c-live-trigger-panel__item-label">{{ item.label }}</span>
          <span class="c-live-trigger-panel__item-desc">{{ item.description }}</span>
          <span
            v-if="summaryOf(item.name)"
            class="c-live-trigger-panel__item-meta"
          >
            {{ summaryOf(item.name) }}
          </span>
        </button>

        <!-- 面板是右对齐停靠的，正好盖住右侧参数面板 —— 要调参数就得先回到工作台，
             所以这里做成显式出口，而不是让作者自己猜「参数去哪儿了」 -->
        <button
          type="button"
          class="c-live-trigger-panel__config"
          :disabled="sending"
          @click="emit('configure', item.name)"
        >
          调参数
        </button>
      </div>
    </div>

    <p
      class="c-live-trigger-panel__status"
      :class="`is-${statusTone}`"
    >
      {{ statusText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useBarrageEffectStore } from '@/store/use-barrage-effect-store';
import { createRuntimeAnchor } from '../density-trigger';
import { EFFECT_TEMPLATES, getEffectTemplate } from '../effects';
import { useLiveEffectSender } from '../live-effect';
import type { BarrageAnchor, EffectTemplateName } from '../types';

const emit = defineEmits<{
  (e: 'preview', anchor: BarrageAnchor): void;
  /** 回到工作台调这个模板的参数；面板会关掉，右侧参数面板随之露出来 */
  (e: 'configure', template: EffectTemplateName): void;
}>();

const { send } = useLiveEffectSender();

const barrageEffectStore = useBarrageEffectStore();

/** 广播进行中：挡住连点，一次只发一条 */
const sending = ref(false);
/** 正在广播的模板，用于给对应按钮加忙碌态 */
const busyTemplate = ref<EffectTemplateName>();
const statusText = ref('点一下任意模板即可播放');
const statusTone = ref<'idle' | 'ok' | 'error'>('idle');

/**
 * 模板顺序
 * @desc 彩带礼花挪到第一个：直播手动触发最常见的场景就是「庆祝一下」，
 *   它该是离手指最近的那一个。其余保持注册表顺序
 */
const liveTemplates = computed(() => {
  const list = EFFECT_TEMPLATES.slice();
  const index = list.findIndex(item => item.name === 'confetti');

  if (index > 0) {
    const [confetti] = list.splice(index, 1);
    list.unshift(confetti);
  }

  return list;
});

/**
 * 卡片上的参数摘要
 * @desc 只有倒计时的「时长」是一个必须在点之前看见的量：10 秒和 5 分钟
 *   点下去才知道就晚了。其余模板的参数是外观，看舞台预览即可
 */
function summaryOf(template: EffectTemplateName): string {
  if (template !== 'countdown') {
    return '';
  }

  const seconds = barrageEffectStore.liveTemplateConfigOf(template).params?.countdownSec;

  return typeof seconds === 'number' ? `当前 ${seconds} 秒` : '';
}

/**
 * 放一个特效
 * @desc ★ 本机先放再广播：广播要等 socket 回包，而工作台是整屏浮层，
 *   真实图层被盖住，作者唯一能看的就是舞台。等回包再预览会让点击看起来「没反应」。
 *   真实图层那边会按页面标识跳过自己发的消息，不会叠成两份
 */
async function fire(template: EffectTemplateName): Promise<void> {
  if (sending.value) {
    return;
  }

  const label = getEffectTemplate(template)?.label ?? template;
  // 舞台预览与广播用**同一份**参数：作者看到什么，观众就收到什么
  const config = barrageEffectStore.liveTemplateConfigOf(template);

  emit('preview', createRuntimeAnchor(template, config));

  sending.value = true;
  busyTemplate.value = template;
  statusTone.value = 'idle';
  statusText.value = `正在广播「${label}」…`;

  try {
    await send(template, config);
    statusTone.value = 'ok';
    statusText.value = `已放给全场：${label}`;
  } catch (error) {
    console.warn('[live-effect] 广播失败', error);
    statusTone.value = 'error';
    statusText.value = '广播失败：只有本机能看见。请确认聊天室已连接后重试';
  } finally {
    sending.value = false;
    busyTemplate.value = undefined;
  }
}
</script>

<style lang="scss">
.c-live-trigger-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.c-live-trigger-panel__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: #7c8398;
}

.c-live-trigger-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

/* 卡片与「调参数」是兄弟而不是嵌套：按钮里不能再套按钮 */
.c-live-trigger-panel__cell {
  position: relative;
  display: flex;
  min-width: 0;
}

.c-live-trigger-panel__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  /* 底部留出「调参数」胶囊的位置，否则它会压在描述文字上 */
  padding: 10px 12px 30px;
  text-align: left;
  cursor: pointer;
  background: #232936;
  border: 1px solid #3d4658;
  border-radius: 6px;
  transition: border-color 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    background: #2a3140;
    border-color: #4f7cff;
  }

  &.is-busy {
    border-color: #4f7cff;
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}

.c-live-trigger-panel__item-label {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
}

.c-live-trigger-panel__item-desc {
  font-size: 10px;
  line-height: 1.5;
  color: #7c8398;
}

/* 倒计时时长：点之前就该看见「这一点下去是 10 秒还是 5 分钟」 */
.c-live-trigger-panel__item-meta {
  font-size: 10px;
  color: #ffc53d;
}

.c-live-trigger-panel__config {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 1;
  padding: 2px 8px;
  font-size: 10px;
  color: #9aa1b4;
  cursor: pointer;
  background: #1b1f27;
  border: 1px solid #3d4658;
  border-radius: 9px;
  transition: color 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    color: #e8eaf0;
    border-color: #4f7cff;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
}

.c-live-trigger-panel__status {
  margin: 0;
  font-size: 11px;
  color: #7c8398;

  &.is-ok {
    color: #2ee6a8;
  }

  &.is-error {
    color: #ff6b81;
  }
}
</style>
