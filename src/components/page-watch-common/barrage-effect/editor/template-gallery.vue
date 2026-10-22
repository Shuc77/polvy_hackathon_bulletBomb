<template>
  <div class="c-template-gallery">
    <div class="c-template-gallery__head">
      <span class="c-template-gallery__title">模板库</span>
      <span class="c-template-gallery__hint">拖到时间轴新增 · 单个特效模式下点击预览</span>
    </div>

    <div class="c-template-gallery__grid">
      <!-- 分类法在 UI 上的落点：转场与弹幕互动分成两段，
           一眼看得出哪些特效与弹幕无关、哪些能联合弹幕 -->
      <section
        v-for="group in groups"
        :key="group.category"
        class="c-template-gallery__group"
      >
        <div class="c-template-gallery__group-head">
          <span class="c-template-gallery__group-name">{{ group.category }}</span>
          <span class="c-template-gallery__group-hint">{{ group.hint }}</span>
        </div>

        <template-card
          v-for="item in group.items"
          :key="item.name"
          :template="item"
          :index="item.flatIndex"
          :selected="item.name === selectedTemplate"
          @select="emit('select-template', item.name)"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EffectTemplateName } from '../types';
import { EFFECT_TEMPLATES, groupTemplatesByCategory } from '../effects';
import TemplateCard from './template-card.vue';

defineProps<{ selectedTemplate?: EffectTemplateName }>();

const emit = defineEmits<{ (e: 'select-template', name: EffectTemplateName): void }>();

const GROUP_HINTS = {
  转场: '只看时间轴，与弹幕无关',
  可互动: '出厂形态能独立当转场，也可由弹幕驱动',
};

const groups = computed(() =>
  groupTemplatesByCategory().map(group => ({
    category: group.category,
    hint: GROUP_HINTS[group.category as keyof typeof GROUP_HINTS] ?? '',
    // 错峰要用全局序号：两段各从 0 开始的话，两段的第一张会同时炸
    items: group.items.map(item => ({
      ...item,
      flatIndex: EFFECT_TEMPLATES.indexOf(item),
    })),
  })),
);
</script>

<style lang="scss">
.c-template-gallery {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
}

.c-template-gallery__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.c-template-gallery__title {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
}

.c-template-gallery__hint {
  font-size: 11px;
  color: #7c8398;
}

.c-template-gallery__grid {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
}

.c-template-gallery__group {
  display: grid;
  gap: 8px;
  align-content: start;
}

.c-template-gallery__group-head {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.c-template-gallery__group-name {
  font-size: 11px;
  font-weight: 600;
  color: #9aa1b4;
  letter-spacing: 0.5px;
}

.c-template-gallery__group-hint {
  font-size: 10px;
  color: #5d6478;
}
</style>
