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

          <!-- 多设备同步：另一端打开同一个观看页时能否看到这套编排 -->
          <span
            class="c-effect-workbench__sync"
            :class="`is-${syncStatus}`"
            :title="syncTitle"
          >
            <i class="c-effect-workbench__sync-dot" />
            {{ syncText }}
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
            @click="openPanel('share')"
          >
            分享
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
            :mode="previewMode"
            :anchors="anchors"
            :selected-anchor-id="selectedAnchor?.id"
            :is-playing="isPlaying"
            :current-time="currentTime"
            :time-axis-available="isTimeAxisAvailable"
            :template="previewTemplate"
            :params="previewParams"
            :feed="selectedAnchor?.feed"
            :span="previewSpan"
            :anchor-key="stageKey"
            :trigger-anchor="triggerAnchor"
            @update:mode="setPreviewMode"
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
          @pause="pause"
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

          <!-- 分享链接：静态分发；实时同步另有一条开发服务器通道 -->
          <template v-else-if="panelMode === 'share'">
            <p class="c-effect-workbench__dialog-text">
              把这个链接发给其他设备，打开后会看到与这里相同的时间轴编排。
              <template v-if="syncStatus === 'off'">
                当前页面没有同步端点，链接就是分发编排的方式。
              </template>
              <template v-else> 同一局域网内，之后的改动也会实时同步到已打开的页面。 </template>
            </p>
            <textarea
              v-model="ioText"
              class="c-effect-workbench__textarea"
              readonly
            />
            <p class="c-effect-workbench__dialog-text">
              链接是当前编排的快照；之后改动如果对方没有接收实时同步，请重新复制。
            </p>
          </template>

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
              {{ panelMode === 'share' ? '关闭' : '取消' }}
            </button>
            <button
              v-if="panelMode === 'export' || panelMode === 'share'"
              type="button"
              :class="{ 'is-primary': panelMode === 'share' }"
              @click="copyIoText"
            >
              {{ panelMode === 'share' ? '复制链接' : '复制' }}
            </button>
            <button
              v-if="panelMode === 'share' && syncStatus !== 'off'"
              type="button"
              @click="onPublishSync"
            >
              同步到其他设备
            </button>
            <button
              v-if="panelMode === 'import' || panelMode === 'reset'"
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
const {
  anchors,
  anchorsCount,
  selectedAnchor,
  anchorsFromUrl,
  lastSavedAt,
  isSaving,
  syncStatus,
  density,
} = storeToRefs(barrageEffectStore);

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

const syncText = computed(() => {
  switch (syncStatus.value) {
    case 'connecting':
      return '多端同步连接中';
    case 'synced':
      return '多端同步已开启';
    case 'error':
      return '多端同步异常';
    default:
      return '多端同步不可用';
  }
});

const syncTitle = computed(() => {
  switch (syncStatus.value) {
    case 'connecting':
      return '正在连接局域网同步端点';
    case 'synced':
      return '同一局域网内的其他设备会收到这套时间轴编排';
    case 'error':
      return '同步端点暂时不可用，正在重试';
    default:
      return '当前页面没有同步端点（静态部署），请用「分享」里的链接分发编排';
  }
});

const { isFullscreen } = storeToRefs(layoutStore);

const {
  ioText,
  isTimeAxisAvailable,
  duration,
  currentTime,
  isPlaying,
  togglePlay,
  pause,
  seek,
  insertAnchorAt,
  exportAnchors,
  importAnchors,
  resetAll,
} = useWorkbenchState();

/** 预览模式：时间轴预览跟随播放进度；单个特效预览循环当前选中项 */
type PreviewMode = 'timeline' | 'source';

/**
 * 默认跟随时间轴
 * @desc 有回放时间轴时，作者首先要看到的是「播到这里，画面上会发生什么」，
 *   而不是模板库最后一次点了谁。直播没有时间轴，退回单个特效预览
 */
const previewMode = ref<PreviewMode>(isTimeAxisAvailable.value ? 'timeline' : 'source');

/** 用户手动选过模式之后，不再被「时间轴从不就绪变为就绪」改回去 */
let previewModeTouched = false;

watch(
  isTimeAxisAvailable,
  available => {
    if (!available) {
      previewMode.value = 'source';
      return;
    }

    if (!previewModeTouched) {
      previewMode.value = 'timeline';
    }
  },
  { immediate: true },
);

function setPreviewMode(mode: PreviewMode): void {
  previewModeTouched = true;
  previewMode.value = mode;
}

/**
 * 打开工作台先把视频暂停
 * @desc ★ 工作台是编辑态，不是观看态。播放头继续跑的话，作者刚拖到的位置
 *   会在松手前又往前走一段，参数改完也找不到刚才看的那一帧；时间轴预览还会
 *   在编辑过程中不断触发放特效，画面一直在动。
 *
 *   只在有时间轴（回放）时暂停：直播的暂停按钮本来就不该被一个编辑面板按掉。
 *   `autoPaused` 保证只按一次 —— 作者随后自己按播放，不能再被抢回去
 */
let autoPaused = false;

function pauseForEditing(): void {
  if (autoPaused || !isTimeAxisAvailable.value) {
    return;
  }

  autoPaused = true;
  pause();
}

// 元数据晚到时补一次：挂在 onMounted 上只能覆盖「打开时 duration 已经就绪」
watch(isTimeAxisAvailable, available => {
  if (available) {
    pauseForEditing();
  }
});

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

const panelMode = ref<'import' | 'export' | 'share' | 'reset' | 'trigger'>();
const ioMessage = ref<IoMessage>();

const DIALOG_TITLES = {
  import: '导入配置',
  export: '导出配置',
  share: '分享与同步',
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

function openPanel(mode: 'import' | 'export' | 'share' | 'reset' | 'trigger'): void {
  ioMessage.value = undefined;

  if (mode === 'export') {
    exportAnchors();
  }

  if (mode === 'share') {
    ioText.value = barrageEffectStore.shareUrl();
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
  /**
   * 兜底：局域网走的是 `http://192.168.x.x`，不是安全上下文，
   * `navigator.clipboard` 直接不存在。选中文本再用 execCommand 至少
   * 让「复制」按钮不是个死按钮。
   */
  const fallback = () => {
    const textarea = document.querySelector<HTMLTextAreaElement>('.c-effect-workbench__textarea');

    if (!textarea) {
      setIoMessage('复制失败，请手动选中', 'error');
      return;
    }

    textarea.focus();
    textarea.select();

    try {
      const copied = document.execCommand('copy');
      setIoMessage(copied ? '已复制' : '复制失败，请手动选中', copied ? 'ok' : 'error');
    } catch {
      setIoMessage('复制失败，请手动选中', 'error');
    }
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(ioText.value).then(() => setIoMessage('已复制', 'ok'), fallback);
    return;
  }

  fallback();
}

/** 手动推送：服务端为空或想强制覆盖其他设备时用 */
async function onPublishSync(): Promise<void> {
  const ok = await barrageEffectStore.publishSync();

  if (ok) {
    setIoMessage('已同步到其他设备', 'ok');
    toast.success('已同步到其他设备');
    return;
  }

  setIoMessage('同步失败，请确认开发服务器仍在运行', 'error');
  toast.warning('同步失败，请确认开发服务器仍在运行');
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
  selectedTemplate.value = name;

  /*
   * 时间轴模式：模板库只是「选品」，不抢舞台
   * @desc ★ 舞台此刻代表的是播放进度上的真实画面。点一张卡就切到单个特效，
   *   等于把「02:30 会发生什么」换成了「这张卡长什么样」—— 作者刚建立的时间感
   *   被一次点击清掉，而且看不出是被谁清的。
   *
   *   想单看模板的出厂形态，先切到「单个特效」再点卡；那时舞台本来就不代表时间轴，
   *   点卡换预览是符合预期的
   */
  if (previewMode.value === 'timeline') {
    return;
  }

  // 单个特效模式：点卡就是换预览对象，取消锚点选中让舞台跟着模板走
  barrageEffectStore.selectAnchor(undefined);
}

function onTimelineCreate(time: number, template: EffectTemplateName): void {
  // 从模板库拖进来同样算开始编辑：别让新特效刚落地，播放头就从它上面跑过去
  pause();
  insertAnchorAt(time, template);
}

function onTimelineSelect(id: string): void {
  barrageEffectStore.selectAnchor(id);
}

function onTimelineMove(id: string, time: number, aligned?: boolean): void {
  // 命中自动对齐时不走 1 秒间隔的推挤，否则「对齐」会稳定偏差 1 秒
  barrageEffectStore.moveAnchor(id, time, { aligned });
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

/** 删除确认是否已经弹着。长按 Delete 会连发 keydown，靠它挡住后面的 */
let removePending = false;

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

  /**
   * 一次只开一个确认框
   * @desc ★ 接入 Delete 键之后这条才有意义：按住不放会**连发十几个 keydown**，
   *   每次都新建一个 `messageBox` 实例，屏幕上就叠出一摞一模一样的对话框，
   *   点掉最上面那个下面还有。单击「删除该特效」不可能触发，键盘会
   */
  if (removePending) {
    return;
  }

  removePending = true;

  const label = getEffectTemplate(anchor.template)?.label ?? anchor.template;

  let confirmed = false;

  try {
    confirmed = await messageBox({
      title: '删除这个特效？',
      content: `${formatSeconds(anchor.time)} 处的「${label}」将被移除，且无法撤销。`,
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    }).$confirm();
  } finally {
    // 无论确认、取消还是中途抛错，闸门都要放开，否则这个按钮从此点不动
    removePending = false;
  }

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

/**
 * 焦点是不是落在能打字的地方
 * @desc ★ 少了这道闸，在有锚点被选中时按退格删掉输入框里的字，会**顺手把锚点删了**。
 *   而锚点删除不可撤销 —— 用户想删一个字，结果丢了一个配好的特效。
 *   这类「快捷键抢输入」的 bug，只有真正手打的时候才会发现
 */
function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;

  if (!el) {
    return false;
  }

  if (el.isContentEditable) {
    return true;
  }

  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    if (panelMode.value) {
      closePanel();
      return;
    }

    close();
    return;
  }

  /**
   * Delete / Backspace 删掉选中的特效
   * @desc 两个都收：Mac 键盘上那个写着 delete 的键，`event.key` 发的是 `Backspace`。
   *   只认其中一个，另一半用户按下去还是没反应
   */
  if (event.key !== 'Delete' && event.key !== 'Backspace') {
    return;
  }

  // 弹窗打开时不吃：那儿的 Delete 属于对话框
  if (panelMode.value || isEditableTarget(event.target)) {
    return;
  }

  if (!selectedAnchor.value) {
    return;
  }

  // 浏览器里 Backspace 有「后退」的历史行为，必须拦掉才轮得到我们
  event.preventDefault();
  onAnchorRemove();
}

onMounted(() => {
  pauseForEditing();

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

  /**
   * 深色滚动条
   * @desc 模板库、参数面板、触发设置三处都会滚，而一个都没写过滚动条样式 ——
   *   Windows 上的 Chrome 给的是一条**浅色经典滚动条**，压在 `#12151b` 上
   *   像贴了块白胶布。这是纯外观问题，但它出现在每一屏。
   *
   *   用后代 `*` 而不是逐个列容器：以后再加可滚动的块不必回来补
   */
  * {
    scrollbar-color: #3d4658 transparent;
    scrollbar-width: thin;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #3d4658;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #55607a;
  }

  /**
   * 键盘焦点
   * @desc 整个模块只有两个 `:focus`，都在输入框上。用 Tab 走一圈时，
   *   十几个按钮全都没有可见焦点 —— 键盘用户根本不知道自己在哪。
   *   一条后代规则覆盖全部，`outline-offset` 保证贴着深色底也看得清
   */
  :focus-visible {
    outline: 2px solid #4f7cff;
    outline-offset: 2px;
  }
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

.c-effect-workbench__sync {
  display: flex;
  gap: 5px;
  align-items: center;
  align-self: center;
  font-size: 11px;
  color: #5d6478;
}

.c-effect-workbench__sync-dot {
  width: 5px;
  height: 5px;
  background: #5d6478;
  border-radius: 50%;
}

.c-effect-workbench__sync.is-connecting .c-effect-workbench__sync-dot {
  background: #ffc53d;
}

.c-effect-workbench__sync.is-synced .c-effect-workbench__sync-dot {
  background: #2ee6a8;
  box-shadow: 0 0 6px rgba(#2ee6a8, 0.6);
}

.c-effect-workbench__sync.is-error .c-effect-workbench__sync-dot {
  background: #ff3553;
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

/**
 * 窄屏两侧收窄
 * @desc 整个模块此前**一条媒体查询都没有**，三栏写死 268 + 264。
 *   1366 的笔记本上舞台还有 830 出头，够用；1280 以下就开始挤了，
 *   而演示时投屏、分屏都不罕见。收窄的是两栏的富余，不是舞台
 */
@media (max-width: 1280px) {
  .c-effect-workbench__body {
    grid-template-columns: 236px minmax(0, 1fr) 236px;
  }
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
 * polyv-ui 深色皮肤
 *
 * @desc ★ 挂在这个标记类上而不是各组件的 `<style>` 里，有两个原因：
 *
 *   1. **色板、下拉是 `appendToBody` 的**，挂在 body 上，不在浮层子树里 ——
 *      组件自己的样式块根本选不中它们。
 *
 *   2. **权重**。polyv-ui 的主题是 `.plv-input .plv-input__main` 这种**两级**选择器，
 *      而组件里原先写的 `.c-params-panel .plv-input__main` 也是两级 —— **完全同权**。
 *      同权就只能比谁在后面，而主题在 `index.css`（首屏 `<link>`）、
 *      组件样式在自己的异步 chunk 里，**谁在后面取决于加载时机**。
 *      表现出来就是：同一份代码，有时是深色有时是白色，且只在浏览器里看得见 ——
 *      `vue-tsc`、eslint、webpack 一路绿灯。
 *
 *      所以这里每一条都**故意多挂一级**，靠权重而不是靠顺序取胜。
 *      数字是量出来的：主题里最高的是四级
 *      （`.plv-select.plv-select--disabled .plv-select__body .plv-select__body__input`），
 *      加上标记类之后正好五级，压得住。改这里的任何一条都别把级数减回去。
 *
 *   3. 顺带把散在 `params-panel.vue` 里的那几块收拢到一处 —— 触发设置、弹幕驱动、
 *      模拟弹幕那几处用的也是同一批控件，以前它们**一条深色规则都没有**，纯白。
 *
 * 主题里用了 `!important` 的只有禁用态（`.plv-input__main--disabled`），
 * 那几条必须跟着用 `!important`，否则权重再高也压不过。
 */
.c-effect-workbench-active {
  /* ============ 输入框 / 数字输入框 / 下拉：三者共用 plv-input 那套壳 ============ */
  .plv-input .plv-input__main {
    background: #232936;
    border-color: #3d4658;
  }

  .plv-input .plv-input__main.plv-input__main--focus {
    border-color: #4f7cff;
  }

  .plv-input .plv-input__main .plv-input__main__input__inner {
    color: #e8eaf0;
    background: transparent;
  }

  .plv-input .plv-input__main .plv-input__main__input__inner::placeholder {
    color: #5d6478;
  }

  /* 主题在这几条上用了 !important，不跟着用就压不过 */
  .plv-input .plv-input__main.plv-input__main--disabled {
    background: #1b1f27 !important;
    border-color: #2f3642 !important;
  }

  .plv-input .plv-input__main .plv-input__main__input__inner[disabled] {
    color: #5d6478;
    -webkit-text-fill-color: #5d6478;
  }

  .plv-input-number .plv-input-number__controls .plv-input-number__controls__increase,
  .plv-input-number .plv-input-number__controls .plv-input-number__controls__decrease {
    color: #9aa1b4;
  }

  /* ============ 下拉 ============ */
  .plv-select .plv-select__body {
    background: #232936;
    border-color: #3d4658;
  }

  .plv-select .plv-select__body .plv-select__body__input {
    color: #e8eaf0;
  }

  .plv-select .plv-select__body .plv-select__body__suffix {
    color: #9aa1b4;
  }

  .plv-select.plv-select--disabled .plv-select__body {
    background: #1b1f27;
    border-color: #2f3642;
  }

  .plv-select.plv-select--disabled .plv-select__body .plv-select__body__input {
    color: #5d6478;
  }

  /* 下拉面板是 appendToBody 的 */
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

  /**
   * 自定义取色区
   * @desc ★ 主题给这组标题、输入框和 Hex/R/G/B 标签写的是 `#1d2129`（浅色面板用的
   *   深色文字）。面板被我们改成深色之后，这段文字与背景几乎同色，等于看不见 ——
   *   必须逐项覆盖，父级的 `color` 压不过子元素自己声明的颜色
   */
  .plv-color-picker__panel__custom__title span {
    color: #9aa1b4;
  }

  .plv-color-picker__panel__custom__icon [class^='plv-admin-icon-'] {
    color: #9aa1b4;
  }

  .plv-color-picker__panel__custom__inputs__item input {
    color: #e8eaf0;
    background: #1b1f27;
    border-color: #3d4658;
  }

  .plv-color-picker__panel__custom__inputs__item input::placeholder {
    color: #5d6478;
  }

  .plv-color-picker__panel__custom__inputs__item p {
    color: #7c8398;
  }

  /* ============ 色板 ============ */
  .plv-color-picker .plv-color-picker__body {
    background: #232936;
    border-color: #3d4658;
  }

  .plv-color-picker .plv-color-picker__body .plv-color-picker__body__input {
    color: #e8eaf0;
    background: transparent;
  }

  .plv-color-picker.plv-color-picker--disabled .plv-color-picker__body {
    background: #1b1f27;
    border-color: #2f3642;
  }

  /* ============ 滑块 ============ */
  .plv-slider .plv-slider__runway {
    background: #2c3243;
  }

  .plv-slider .plv-slider__runway .plv-slider__runway__bar {
    background: #4f7cff;
  }

  .plv-slider .plv-slider__runway .plv-slider__runway__dot {
    border-color: #232936;
  }

  .plv-slider .plv-slider__button .plv-slider__button__inner {
    background-color: #4f7cff;
    border-color: #4f7cff;
  }

  /**
   * 滑块的禁用态
   * @desc 主题里 `--disabled` 只有 `cursor:not-allowed`，**一点颜色都不改** ——
   *   于是禁用的滑块长得和可用的一模一样，只是拖不动。
   *   这条得我们自己补，否则「置灰」等于没说
   */
  .plv-slider .plv-slider__runway.plv-slider__runway--disabled {
    background: #262c37;
  }

  .plv-slider .plv-slider__runway.plv-slider__runway--disabled .plv-slider__runway__bar {
    background: #3d4658;
  }

  .plv-slider .plv-slider__button .plv-slider__button__inner--disabled {
    background-color: #3d4658;
    border-color: #3d4658;
  }
}
</style>
