<template>
  <custom-teleport :to="teleportTarget">
    <div class="c-effect-workbench">
      <header class="c-effect-workbench__header">
        <div class="c-effect-workbench__brand">
          <em class="c-effect-workbench__title">弹幕特效工作台</em>
          <span class="c-effect-workbench__subtitle">
            模板预览 · 拖拽到时间轴插入 · 改完在观看页实时生效
          </span>
          <span
            v-if="anchorsFromUrl"
            class="c-effect-workbench__badge"
          >
            当前配置来自地址栏，任一处改动后以本地存档为准
          </span>

          <!-- 改动本来就是自动落盘的，但没有任何提示时用户只会以为「没保存」 -->
          <span
            class="c-effect-workbench__save"
            :class="{ 'is-busy': isSaving }"
          >
            <i class="c-effect-workbench__save-dot" />
            {{ saveText }}
          </span>
        </div>

        <div class="c-effect-workbench__actions">
          <button
            type="button"
            class="c-effect-workbench__trigger"
            :class="{ 'is-on': density.enabled }"
            @click="openPanel('trigger')"
          >
            触发设置<span v-if="density.enabled">· 开</span>
          </button>
          <button
            type="button"
            @click="openPanel('import')"
          >
            导入
          </button>
          <button
            type="button"
            @click="openPanel('export')"
          >
            导出
          </button>
          <button
            type="button"
            @click="openPanel('reset')"
          >
            重置
          </button>
          <button
            type="button"
            class="c-effect-workbench__close"
            @click="close"
          >
            ✕
          </button>
        </div>
      </header>

      <div class="c-effect-workbench__body">
        <section class="c-effect-workbench__pane c-effect-workbench__pane--left">
          <template-gallery
            :selected-template="selectedTemplate"
            @select-template="onTemplateSelect"
          />
        </section>

        <section class="c-effect-workbench__pane c-effect-workbench__pane--center">
          <effect-stage
            :template="previewTemplate"
            :params="previewParams"
            :feed="selectedAnchor?.feed"
            :span="previewSpan"
            :anchor-key="stageKey"
            :trigger-anchor="triggerAnchor"
          />
        </section>

        <section class="c-effect-workbench__pane c-effect-workbench__pane--right">
          <params-panel
            :anchor="selectedAnchor"
            :duration="duration"
            :is-time-axis-available="isTimeAxisAvailable"
            @patch="onAnchorPatch"
            @remove="onAnchorRemove"
            @use-current-time="onUseCurrentTime"
          />
        </section>
      </div>

      <footer class="c-effect-workbench__footer">
        <effect-timeline
          :duration="duration"
          :current-time="currentTime"
          :anchors="anchors"
          :selected-id="selectedAnchor?.id"
          :is-available="isTimeAxisAvailable"
          :is-playing="isPlaying"
          @toggle-play="togglePlay"
          @seek="seek"
          @select-anchor="onTimelineSelect"
          @move-anchor="onTimelineMove"
          @resize-anchor="onTimelineResize"
          @create-anchor="onTimelineCreate"
        />
      </footer>

      <!-- ★ 触发设置**不遮**：它是「即改即生效 + 当场看效果」的面板，
           一个 55% 黑的整屏遮罩加一个正中（也就是特效炸开的那一点）的对话框，
           正好把唯一值得看的东西挡死。靠右停靠 + 透传指针，改参数的手不离开画面 -->
      <div
        v-if="panelMode"
        class="c-effect-workbench__mask"
        :class="{ 'is-trigger': panelMode === 'trigger' }"
        @click.self="closePanel"
      >
        <div
          class="c-effect-workbench__dialog"
          :class="{ 'is-wide': panelMode === 'trigger' }"
        >
          <div class="c-effect-workbench__dialog-title">{{ dialogTitle }}</div>

          <template v-if="panelMode === 'reset'">
            <p class="c-effect-workbench__dialog-text">
              将清空全部 {{ anchorsCount }} 个特效，并删除本地存档。此操作不可撤销。
            </p>
          </template>

          <!-- 触发设置自带按钮，不套下面那排通用的 -->
          <trigger-panel
            v-else-if="panelMode === 'trigger'"
            @preview="onTriggerPreview"
          />

          <template v-else>
            <textarea
              v-model="ioText"
              class="c-effect-workbench__textarea"
              :readonly="panelMode === 'export'"
              :placeholder="panelMode === 'import' ? '粘贴导出的配置文本' : ''"
            />
            <p class="c-effect-workbench__dialog-text">
              {{
                panelMode === 'export'
                  ? '复制这段文本即可分享；也可以直接填进地址栏的 barrageAnchors 参数。'
                  : '导入会覆盖当前全部特效。'
              }}
            </p>
          </template>

          <div
            v-if="panelMode !== 'trigger'"
            class="c-effect-workbench__dialog-actions"
          >
            <button
              type="button"
              @click="closePanel"
            >
              取消
            </button>
            <button
              v-if="panelMode === 'export'"
              type="button"
              @click="copyIoText"
            >
              复制
            </button>
            <button
              v-else
              type="button"
              class="is-primary"
              @click="confirmPanel"
            >
              {{ panelMode === 'import' ? '导入' : '清空' }}
            </button>
            <span
              v-if="ioMessage"
              class="c-effect-workbench__dialog-msg"
              :class="`is-${ioMessage.tone}`"
              >{{ ioMessage.text }}</span
            >
          </div>

          <!-- 触发设置是「即改即生效」的，没有确认这一步；只留一个关闭 -->
          <div
            v-else
            class="c-effect-workbench__dialog-actions"
          >
            <button
              type="button"
              @click="closePanel"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  </custom-teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { PC_PLAYER_FULL_SCREEN_SELECTOR } from '@/assets/constants/selector';
import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';
import { useBarrageEffectStore } from '@/store/use-barrage-effect-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { getEffectTemplate } from '../effects';
import { spanOf, spanPatchOf } from '../span';
import type { BarrageAnchor, EffectParams, EffectTemplateName } from '../types';
import CustomTeleport from '@/components/common-base/custom-teleport/custom-teleport';
import { messageBox } from '@/components/common-base/message-box';
import { useToastManager } from '@/hooks/components/use-toast';
import { createTriggerAnchor } from '../density-trigger';
import EffectStage from './effect-stage.vue';
import EffectTimeline from './effect-timeline.vue';
import ParamsPanel from './params-panel.vue';
import TemplateGallery from './template-gallery.vue';
import TriggerPanel from './trigger-panel.vue';
import { useWorkbenchState, type ImportResult } from './use-workbench-state';

/**
 * popper 的 z-index 起点
 * @desc `openPopper` 是「自增后赋值」，而工作台在 `$--zIndex-top`（10001）。
 *   色板/下拉默认从 3000 起，不抬的话会弹在工作台底下 —— 看不见，也想不到去查 z-index。
 *   抬这一下覆盖所有 popper，不依赖各组件是否把 `append-to-body` 透传下来。
 */
const POPPER_Z_INDEX_BASE = 10002;

/** 弹层容器的类名，仅用于给挂到 body 上的 popper 上深色皮肤 */
const BODY_MARK_CLASS = 'c-effect-workbench-active';

const barrageEffectStore = useBarrageEffectStore();
const layoutStore = useLayoutStore();

/**
 * 全局轻提示
 * @desc ★ 必须在 setup 里取好再在回调里用，不能等到回调里现取 ——
 *   管理员内部会去 `useWatchAppStore()` 拿挂载点，而多实例观看时
 *   回调里那个「当前 pinia」未必还是这块播放器的
 *
 *   它挂到 body 上、z-index 由 `PlvPopperManager` 自增，
 *   所以天然盖在工作台（也是 10002 起）之上，不需要额外处理
 */
const { toast } = useToastManager();

// 必须走 storeToRefs：setup store 的属性在 store 上是解包后的值，
// 直接解构拿到的是快照，选中锚点变了这里不会跟着动
const { anchors, anchorsCount, selectedAnchor, anchorsFromUrl, lastSavedAt, isSaving, density } =
  storeToRefs(barrageEffectStore);

const saveText = computed(() => {
  if (isSaving.value) {
    return '保存中…';
  }

  if (lastSavedAt.value === undefined) {
    return anchorsCount.value > 0 ? '未保存' : '自动保存已开启';
  }

  return `已自动保存 ${formatClock(lastSavedAt.value)}`;
});

function formatClock(timestamp: number): string {
  const at = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${pad(at.getHours())}:${pad(at.getMinutes())}:${pad(at.getSeconds())}`;
}
const { isFullscreen } = storeToRefs(layoutStore);

const {
  ioText,
  isTimeAxisAvailable,
  duration,
  currentTime,
  isPlaying,
  togglePlay,
  seek,
  insertAnchorAt,
  exportAnchors,
  importAnchors,
  resetAll,
} = useWorkbenchState();

/**
 * 舞台当前预览的模板
 * @desc 选中锚点时它就是锚点的模板；没选中时是用户刚点开的那个模板 ——
 *   此时舞台预览的是模板的出厂形态，参数面板则是空态
 */
const selectedTemplate = ref<EffectTemplateName>('shockwave');

watch(
  () => selectedAnchor.value?.template,
  template => {
    if (template) {
      selectedTemplate.value = template;
    }
  },
  { immediate: true },
);

const previewTemplate = computed(() => selectedAnchor.value?.template ?? selectedTemplate.value);

const previewParams = computed<EffectParams>(() => {
  const defaults = getEffectTemplate(previewTemplate.value)?.defaults ?? {};

  return selectedAnchor.value ? { ...defaults, ...selectedAnchor.value.params } : { ...defaults };
});

/** 舞台据此重建实例：改选锚点或换模板都从头播一遍 */
const stageKey = computed(() => selectedAnchor.value?.id ?? previewTemplate.value);

/**
 * 预览的时长
 * @desc 舞台把它并进重建的 watch key，所以**拖完松手会立刻重播一遍** ——
 *   不重播的话作者拖了半天看不到任何变化，等于这个功能是坏的
 */
const previewSpan = computed(() => {
  const anchor = selectedAnchor.value;

  return anchor ? spanOf(anchor, getEffectTemplate(anchor.template)) : undefined;
});

/**
 * 系统全屏时把浮层挂进播放器子树
 * @desc 全屏下浏览器只绘制全屏元素那棵子树，挂在 body 上的 `position: fixed` 浮层
 *   **完全不会显示**。不处理这条，演示时一按全屏工作台就消失
 */
const teleportTarget = computed(() =>
  isFullscreen.value ? PC_PLAYER_FULL_SCREEN_SELECTOR : undefined,
);

/** 对话框里那行小字。`tone` 决定颜色 —— 失败必须长得像失败 */
interface IoMessage {
  text: string;
  tone: 'ok' | 'error';
}

const panelMode = ref<'import' | 'export' | 'reset' | 'trigger'>();
const ioMessage = ref<IoMessage>();

const DIALOG_TITLES = {
  import: '导入配置',
  export: '导出配置',
  reset: '确认清空',
  trigger: '密度触发设置',
} as const;

const dialogTitle = computed(() => (panelMode.value ? DIALOG_TITLES[panelMode.value] : ''));

/**
 * 待预览的触发锚点
 * @desc 舞台按**引用变化**判定，所以每次点击都造一个新对象。
 *   构造走的是 `createTriggerAnchor` —— 与生产层同一个函数，
 *   预览看到的就是自动触发会放的东西
 */
const triggerAnchor = ref<BarrageAnchor>();

function onTriggerPreview(): void {
  triggerAnchor.value = createTriggerAnchor(density.value);
}

function close(): void {
  barrageEffectStore.toggleWorkbench(false);
}

function openPanel(mode: 'import' | 'export' | 'reset' | 'trigger'): void {
  ioMessage.value = undefined;

  if (mode === 'export') {
    exportAnchors();
  }

  panelMode.value = mode;
}

function closePanel(): void {
  panelMode.value = undefined;
  ioMessage.value = undefined;
  ioText.value = '';
}

function setIoMessage(text: string, tone: IoMessage['tone']): void {
  ioMessage.value = { text, tone };
}

function copyIoText(): void {
  // 非 HTTPS 下 clipboard 不可用，只提示，不做兜底选中 —— 文本就在框里，手动复制即可
  navigator.clipboard?.writeText(ioText.value).then(
    () => setIoMessage('已复制', 'ok'),
    () => setIoMessage('复制失败，请手动选中', 'error'),
  );
}

/**
 * 导入完如实报数
 * @desc ★ 解析器对脏数据是**静默丢弃**的，而导入是唯一一个由用户亲手粘贴文本的入口。
 *   10 条里只进来 3 条却什么都不说的话，作者看到的是「导入成功了，但少了几个」——
 *   唯一的线索在 `console.warn` 里，而他不会去开控制台。
 *   工作台是整屏浮层，所以走全局 toast 而不是对话框里那行小字（那行会随对话框一起关掉）
 */
function reportImport({ imported, dropped }: ImportResult): void {
  if (dropped > 0) {
    toast.warning(`已导入 ${imported} 个特效，跳过 ${dropped} 条无法识别的数据`);
    return;
  }

  toast.success(`已导入 ${imported} 个特效`);
}

function confirmPanel(): void {
  if (panelMode.value === 'import') {
    const result = importAnchors();

    if (result.imported > 0) {
      closePanel();
      reportImport(result);
      return;
    }

    setIoMessage(
      result.dropped > 0
        ? `解析出 ${result.dropped} 条，但没有一条能用，请检查模板名与时间写法`
        : '没解析出可用的特效，请检查文本',
      'error',
    );
    return;
  }

  resetAll();
  closePanel();
}

function onTemplateSelect(name: EffectTemplateName): void {
  // 取消锚点选中 → 舞台转而预览这个模板的出厂形态
  barrageEffectStore.selectAnchor(undefined);
  selectedTemplate.value = name;
}

function onTimelineCreate(time: number, template: EffectTemplateName): void {
  insertAnchorAt(time, template);
}

function onTimelineSelect(id: string): void {
  barrageEffectStore.selectAnchor(id);
}

function onTimelineMove(id: string, time: number): void {
  barrageEffectStore.moveAnchor(id, time);
}

/**
 * 拖条带右端改时长
 * @desc 补丁由 `span.ts` 造 —— 三种归属（倒计时 / 收集窗 / 时间缩放）的映射
 *   只在那一个地方，这里不重复判断
 */
function onTimelineResize(id: string, span: number): void {
  const anchor = anchors.value.find(item => item.id === id);

  if (!anchor) {
    return;
  }

  barrageEffectStore.updateAnchor(
    id,
    spanPatchOf(anchor, getEffectTemplate(anchor.template), span),
  );
}

function onAnchorPatch(patch: Partial<BarrageAnchor>, opts?: { defer?: boolean }): void {
  const id = selectedAnchor.value?.id;

  if (id) {
    barrageEffectStore.updateAnchor(id, patch, opts);
  }
}

/** 秒 → `分:秒`。只用在确认文案里，让「删的是哪一个」有个坐标 */
function formatSeconds(value: number): string {
  const total = Math.max(0, Math.round(value));

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * 删除选中的锚点
 * @desc 走一次确认：删除**没有撤销**，误触的代价是「重新拖一个 + 把那些滑块再调一遍」。
 *   浮层把 z-index 起点抬到 10002 之后，`messageBox` 会盖在工作台之上，不必额外处理层级
 */
async function onAnchorRemove(): Promise<void> {
  const anchor = selectedAnchor.value;

  if (!anchor) {
    return;
  }

  const label = getEffectTemplate(anchor.template)?.label ?? anchor.template;

  const confirmed = await messageBox({
    title: '删除这个特效？',
    content: `${formatSeconds(anchor.time)} 处的「${label}」将被移除，且无法撤销。`,
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  }).$confirm();

  if (confirmed) {
    barrageEffectStore.removeAnchor(anchor.id);
  }
}

function onUseCurrentTime(): void {
  const id = selectedAnchor.value?.id;

  if (id) {
    barrageEffectStore.updateAnchor(id, { time: Math.round(currentTime.value) });
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') {
    return;
  }

  if (panelMode.value) {
    closePanel();
    return;
  }

  close();
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  document.body.classList.add(BODY_MARK_CLASS);

  // 只抬不降：openPopper 是自增的，降回去会把已经打开的 popper 挤到新开的下面
  if (PlvPopperManager.zIndex < POPPER_Z_INDEX_BASE) {
    PlvPopperManager.zIndex = POPPER_Z_INDEX_BASE;
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.classList.remove(BODY_MARK_CLASS);
});
</script>

<style lang="scss">
.c-effect-workbench {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: $--zIndex-top;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #e8eaf0;
  background: #12151b;
}

.c-effect-workbench__header {
  display: flex;
  flex-shrink: 0;
  gap: 16px;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #232936;
}

.c-effect-workbench__brand {
  display: flex;
  gap: 12px;
  align-items: baseline;
  min-width: 0;
}

.c-effect-workbench__title {
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
}

.c-effect-workbench__subtitle {
  font-size: 12px;
  color: #7c8398;
}

.c-effect-workbench__badge {
  padding: 2px 8px;
  font-size: 11px;
  color: #ffc53d;
  background: rgba(#ffc53d, 0.14);
  border-radius: 10px;
}

.c-effect-workbench__save {
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 11px;
  color: #5d6478;
}

.c-effect-workbench__save-dot {
  width: 5px;
  height: 5px;
  background: #2ee6a8;
  border-radius: 50%;
}

.c-effect-workbench__save.is-busy .c-effect-workbench__save-dot {
  background: #ffc53d;
}

.c-effect-workbench__actions {
  display: flex;
  gap: 8px;
  margin-left: auto;

  button {
    padding: 6px 14px;
    font-size: 12px;
    color: #d5dae8;
    cursor: pointer;
    background: #232936;
    border: 1px solid #3d4658;
    border-radius: 4px;
    transition: border-color 0.15s;

    &:hover {
      border-color: #4f7cff;
    }
  }
}

.c-effect-workbench__close {
  padding: 6px 10px !important;
  font-size: 14px !important;
}

/**
 * 触发开关开着时按钮换个色
 * @desc 工作台关掉后它是唯一还生效的配置，而浮层里看不见任何提示 ——
 *   不标出来的话，「为什么直播里突然开始炸」要查很久
 */
.c-effect-workbench__trigger.is-on {
  color: #2ee6a8;
  border-color: rgba(#2ee6a8, 0.6);
}

.c-effect-workbench__body {
  display: grid;
  flex: 1;
  grid-template-columns: 268px minmax(0, 1fr) 264px;
  gap: 1px;
  min-height: 0;
  background: #232936;
}

.c-effect-workbench__pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 14px;
  background: #12151b;
}

.c-effect-workbench__footer {
  flex-shrink: 0;
  padding: 12px 20px 16px;
  border-top: 1px solid #232936;
}

.c-effect-workbench__mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);

  /**
   * 触发设置：靠右停靠、不压暗、不拦指针
   * @desc 指针透传是关键 —— 遮罩还在，但点得到下面的时间轴与模板库。
   *   代价是「点空白处关闭」在它身上失效，所以它有明确的「完成」按钮，
   *   Esc 也照常管用
   */
  &.is-trigger {
    justify-content: flex-end;
    padding-right: 20px;
    pointer-events: none;
    background: transparent;
  }
}

.c-effect-workbench__dialog {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 480px;
  max-width: calc(100% - 40px);
  padding: 20px;
  background: #1b1f27;
  border: 1px solid #2f3646;
  border-radius: 8px;

  /* 触发设置是两列滑块加一排模板，480px 会把标签挤成两行 */
  &.is-wide {
    width: 560px;
    /* 指针从遮罩透传过来，得在这里收回来，否则它自己也点不动 */
    max-height: calc(100% - 40px);
    overflow-y: auto;
    pointer-events: auto;
  }
}

.c-effect-workbench__dialog-title {
  font-size: 14px;
  font-weight: 600;
}

.c-effect-workbench__dialog-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #7c8398;
}

.c-effect-workbench__textarea {
  width: 100%;
  height: 160px;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 12px;
  color: #d5dae8;
  resize: none;
  background: #12151b;
  border: 1px solid #3d4658;
  border-radius: 4px;
}

.c-effect-workbench__dialog-actions {
  display: flex;
  gap: 8px;
  align-items: center;

  button {
    padding: 6px 16px;
    font-size: 12px;
    color: #d5dae8;
    cursor: pointer;
    background: #232936;
    border: 1px solid #3d4658;
    border-radius: 4px;

    &.is-primary {
      color: #fff;
      background: #4f7cff;
      border-color: #4f7cff;
    }
  }
}

/**
 * 对话框里那行小字
 * @desc ★ 以前只有一种绿色，于是「复制失败，请手动选中」和「已复制」长得一模一样 ——
 *   失败被当成了成功，用户以为自己已经拿到了东西
 */
.c-effect-workbench__dialog-msg {
  font-size: 12px;

  &.is-ok {
    color: #2ee6a8;
  }

  &.is-error {
    color: #ff8b8b;
  }
}

/**
 * 色板与下拉是 appendToBody 的，挂在 body 上，不在浮层子树里。
 * 用同样挂在 body 上的标记类限定作用域，只在工作台打开期间生效。
 */
.c-effect-workbench-active {
  .plv-color-picker__panel,
  .plv-select__options {
    background: #232936;
    border: 1px solid #3d4658;
  }

  .plv-select-option {
    color: #cdd6f0;

    &:hover,
    &.plv-select-option--selected {
      background: rgba(#4f7cff, 0.18);
    }
  }

  .plv-color-picker__panel__custom__title {
    color: #9aa1b4;
  }
}
</style>
