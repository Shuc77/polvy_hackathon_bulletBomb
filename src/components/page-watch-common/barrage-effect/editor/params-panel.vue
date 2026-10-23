<template>
  <div class="c-params-panel">
    <div class="c-params-panel__head">特效参数</div>

    <!-- ★ 空态分两套文案：直播下时间轴整个不渲染，插入锚点的**唯一**路径（拖到时间轴上）
         根本不存在。继续教用户去拖，等于把他引到一条死路上 -->
    <div
      v-if="!anchor"
      class="c-params-panel__empty"
    >
      <template v-if="isTimeAxisAvailable">
        点击时间轴上的标记编辑已有特效，
        <br />
        或从左侧把模板拖到时间轴上新增一个。
      </template>
      <template v-else>
        直播中没有时间轴，拖进来的模板无处安放。
        <br />
        点左侧任意模板卡，参数就会出现在这里 —— 调好再点右上角「实时特效」放给全场。
        <br />
        也可以打开「触发设置」，让弹幕自己把特效喊出来。
      </template>
    </div>

    <template v-else>
      <!-- 直播模板参数：说明这份值的来历与出口。不写的话，作者会以为它只是
           一个「预览参数」，不知道改完怎么放出去、也不知道回放那边会不会变 -->
      <p
        v-if="liveTemplate"
        class="c-params-panel__shared"
      >
        这份参数与点播回放共用同一个模板配置：回放工作台里调过同款特效，这里会直接沿用；
        在这里调好，直播手动触发与弹幕密度触发都会按它放。点「实时特效」即可放给全场。
      </p>

      <div
        v-if="!liveTemplate"
        class="c-params-panel__field"
      >
        <div class="c-params-panel__label">触发时间</div>
        <div class="c-params-panel__row">
          <plv-input-number
            :value="anchor.time"
            :min="0"
            :max="Math.max(duration, 0)"
            :step="1"
            :disabled="!isTimeAxisAvailable"
            @change="onTimeChange"
          />
          <button
            type="button"
            class="c-params-panel__ghost-btn"
            :disabled="!isTimeAxisAvailable"
            :title="isTimeAxisAvailable ? '把触发时间设成播放头现在的位置' : LIVE_NO_TIMELINE_HINT"
            @click="emit('use-current-time')"
          >
            取当前位置
          </button>
        </div>
        <!-- 直播下这个字段是**死的**：min 与 max 都是 0，输什么都被夹回 0，
             而值没变就连 change 都不发 —— 看着能编辑，其实一个字也改不动 -->
        <p
          v-if="!isTimeAxisAvailable"
          class="c-params-panel__note"
        >
          直播没有时间轴，触发时间不参与判定 —— 这个锚点只会由密度触发放出来
        </p>
      </div>

      <!-- 与「触发时间」成对：先说什么时候放，再说放多久。
           和时间轴上拖条带右端是**同一个量**，两条路径汇到 span.ts 的同一个出口 -->
      <div class="c-params-panel__field">
        <div class="c-params-panel__label">{{ spanLabel }}</div>
        <plv-input-number
          :value="spanValue"
          :min="spanBounds.min"
          :max="spanBounds.max"
          :step="0.5"
          @change="onSpanChange"
        />
      </div>

      <!-- 直播模板由左侧卡片选定，这里再放一个下拉只会让「当前到底在调哪个」多一处状态 -->
      <div
        v-if="!liveTemplate"
        class="c-params-panel__field"
      >
        <div class="c-params-panel__label">模板</div>
        <plv-select
          :value="anchor.template"
          :options="EFFECT_TEMPLATE_OPTIONS"
          @change="onTemplateChange"
        />
      </div>

      <!-- 放在模板下面：先选「是什么特效」，再选「怎么被驱动」。
           feed-panel 自己判断模板支不支持互动，纯转场不会出现。
           直播触发恒为一次性播放，驱动方式不适用 -->
      <feed-panel
        v-if="!liveTemplate"
        :anchor="anchor"
        @patch="onFeedPatch"
      />

      <!-- 只给声明了文字槽的模板显示。
           这是「文字是数据、样式是模板」的最小雏形：模板在自己的 defaults 里
           声明有没有 caption 这一槽，讲师改的只是值，样式不归他管 -->
      <div
        v-if="hasCaption"
        class="c-params-panel__field"
      >
        <div class="c-params-panel__label">文案</div>
        <!-- 原生 input：`plv-input` 的 props 被 mixin 隐藏、无法校验 -->
        <input
          class="c-params-panel__text"
          type="text"
          maxlength="80"
          :value="captionValue"
          @input="onCaptionChange"
        />
      </div>

      <!-- 汇聚吸入的答案槽。空着 = 原来的转场；填了就会在吸入之后成形为整句 -->
      <div
        v-if="hasAnswerText"
        class="c-params-panel__field"
      >
        <div class="c-params-panel__label">揭晓答案</div>
        <textarea
          class="c-params-panel__text c-params-panel__textarea"
          rows="2"
          maxlength="80"
          :value="answerValue"
          placeholder="例如：正确答案是「光合作用」"
          @input="onAnswerChange"
        ></textarea>
        <p
          v-if="!liveTemplate"
          class="c-params-panel__hint"
        >
          题目与提前秒数在「弹幕驱动」里配置；互动模式会先吸入答题弹幕，转场只揭晓答案。 答案揭晓约
          7 秒，互动窗口建议 ≥ 9 秒。
        </p>
        <!-- 直播触发不收集弹幕，上面那条「去弹幕驱动里配」的指引在这里是死路 -->
        <p
          v-else
          class="c-params-panel__hint"
        >
          直播手动触发不收集弹幕：吸入阶段结束后直接成形为这句话，时长用上面的「播放时长」调。
        </p>
      </div>

      <div class="c-params-panel__field">
        <div class="c-params-panel__label">配色</div>
        <div class="c-params-panel__row">
          <plv-color-picker
            :value="colorPrimary"
            @change="onPrimaryChange"
          />
          <plv-color-picker
            :value="colorSecondary"
            @change="onSecondaryChange"
          />
        </div>
      </div>

      <div class="c-params-panel__field">
        <div class="c-params-panel__label">
          <span>粒子数量</span>
          <b>{{ particles }}</b>
        </div>
        <plv-slider
          :value="particles"
          :min="MIN_PARTICLES"
          :max="MAX_PARTICLES"
          :step="10"
          :progress-bar-visible="false"
          :hot-area-height="28"
          @input="onParticlesInput"
        />
      </div>

      <div
        v-if="hasAudienceMix"
        class="c-params-panel__field"
      >
        <div class="c-params-panel__label">
          <span>主色占比</span>
          <b>{{ ratioPercent }}%</b>
        </div>
        <plv-slider
          :value="ratioPercent"
          :min="0"
          :max="100"
          :progress-bar-visible="false"
          :hot-area-height="28"
          @input="onRatioInput"
        />
      </div>

      <div
        v-if="hasAudienceMix"
        class="c-params-panel__field"
      >
        <div class="c-params-panel__label">
          <span>重心偏向</span>
          <b>{{ biasText }}</b>
        </div>
        <plv-slider
          :value="biasPercent"
          :min="-100"
          :max="100"
          :progress-bar-visible="false"
          :hot-area-height="28"
          @input="onBiasInput"
        />
      </div>

      <!-- 直播模板不是时间轴上的一条，删掉它没有语义；要「取消」就点舞台上的取消预览 -->
      <button
        v-if="!liveTemplate"
        type="button"
        class="c-params-panel__remove"
        @click="emit('remove')"
      >
        删除该特效
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// ★ 这几个必须在 `<script setup>` 里显式 import，模板里的 `<plv-*>` 才解析得出来。
//   本仓库的 polyv-ui 没有全局注册，`pc-barrage-setting.vue` 那类页面都是逐个引入的。
//   漏掉 import 不会报编译错误，只会渲染成「Unknown custom element」—— 控件是死的，
//   构建却一切正常，所以只有打开页面才看得见
import {
  PlvColorPicker,
  PlvInputNumber,
  PlvSelect,
  PlvSlider,
} from '@/plugins/polyv-ui/admin-import';
import { messageBox } from '@/components/common-base/message-box';
import { EFFECT_TEMPLATE_OPTIONS, getEffectTemplate, isTransitionOnly } from '../effects';
import { spanOf, spanPatchOf, spanRangeOf } from '../span';
import type { BarrageAnchor, EffectParams, EffectTemplateName } from '../types';
import FeedPanel from './feed-panel.vue';

/** 粒子数的上下限：低于 20 看不出形状，高于 280 在小画布上糊成一片 */
const MIN_PARTICLES = 20;
const MAX_PARTICLES = 280;

/**
 * 直播下置灰控件的统一说法
 * @desc 「这个按钮为什么点不动」必须能**就地**读到。让用户去别处找答案等于没答案，
 *   他只会得出「这个按钮是坏的」
 */
const LIVE_NO_TIMELINE_HINT = '直播没有时间轴，这个功能只在回放地址下可用';

const props = defineProps<{
  anchor?: BarrageAnchor;
  duration: number;
  isTimeAxisAvailable: boolean;
  /**
   * 直播模板参数模式
   * @desc 这时 `anchor` 不是时间轴上的一条，而是工作台给「这个模板被
   *   直播触发时」临时造的视图对象。触发时间、模板切换、驱动方式、删除
   *   都不适用，改的是 `store` 里按频道共享的那份参数
   */
  liveTemplate?: boolean;
}>();

const emit = defineEmits<{
  (
    e: 'patch',
    patch: Partial<BarrageAnchor>,
    opts?: {
      /** 滑块这类高频写入：让 store 跳过重排并把落盘合并到尾部 */
      defer?: boolean;
    },
  ): void;
  (e: 'remove'): void;
  (e: 'use-current-time'): void;
}>();

const descriptor = computed(() =>
  props.anchor ? getEffectTemplate(props.anchor.template) : undefined,
);

/** 锚点参数与模板默认值合并后的最终值 —— 和舞台预览的是同一份 */
const resolved = computed<EffectParams>(() => ({
  ...descriptor.value?.defaults,
  ...props.anchor?.params,
}));

/**
 * 时长字段的名字
 * @desc 倒计时的「时长」就是内容本身，叫「播放时长」会让人以为它只是
 *   条带长短、不影响数字从几开始；直播里尤其如此 —— 作者找的就是这个
 */
const spanLabel = computed(() =>
  descriptor.value?.name === 'countdown' ? '倒计时时长（秒）' : '播放时长（秒）',
);

/**
 * 播放时长：和时间轴上那条可拖拽的条带是**同一个量**
 * @desc 三种归属的换算是 `span.ts` 的事，这里只负责显示与写回 ——
 *   面板和拖拽共用同一个出口，不另开一条写入路径
 */
const spanValue = computed(() => {
  const anchor = props.anchor;

  return anchor ? spanOf(anchor, descriptor.value) : 0;
});

/**
 * 播放时长的可达区间
 * @desc 上下界与条带、驱动器共用 `span.ts` 那一份 —— 敲得进去的值必须和拖得动、
 *   播得出的值完全一致，否则就成了「敲 5000 秒、实际只播 3599 秒」
 */
const spanBounds = computed(() => {
  const anchor = props.anchor;

  if (!anchor) {
    return { min: 1, max: 60 };
  }

  const range = spanRangeOf(anchor, descriptor.value);

  if (props.duration <= 0) {
    return range;
  }

  // 同时不能超过轨道末端 —— 与条带的夹取是同一条规矩
  return {
    min: range.min,
    max: Math.max(range.min, Math.min(range.max, props.duration - anchor.time)),
  };
});

/** 模板在 `defaults` 里声明了文字槽才给这一行 */
const hasCaption = computed(() => !!descriptor.value && 'caption' in descriptor.value.defaults);

const captionValue = computed(() => resolved.value.caption ?? '');

/** 模板声明了答案槽（目前是汇聚吸入）才给答案输入框 */
const hasAnswerText = computed(
  () => !!descriptor.value && 'answerText' in descriptor.value.defaults,
);

const answerValue = computed(() => resolved.value.answerText ?? '');

const colorPrimary = computed(() => resolved.value.colorPrimary ?? '#ff3553');
const colorSecondary = computed(() => resolved.value.colorSecondary ?? '#ffd166');

/**
 * 配色占比 / 重心偏向两行只对「会读弹幕」的模板有意义
 * @desc 文字倒计时是纯转场，模板里根本不读 ratio / bias —— 留着这两根滑杆
 *   就是明摆着的死控件：拖了没反应，作者只会以为参数面板坏了
 */
const hasAudienceMix = computed(
  // 直播触发恒为 static，不读弹幕 —— 这两根滑杆在这里拖了不会有任何反应
  () => !!descriptor.value && !props.liveTemplate && !isTransitionOnly(descriptor.value),
);

const particles = computed(() => resolved.value.particles ?? 120);
const ratioPercent = computed(() => Math.round((resolved.value.ratio ?? 0.5) * 100));
const biasPercent = computed(() => Math.round((resolved.value.bias ?? 0) * 100));

const biasText = computed(() => {
  const value = biasPercent.value;

  if (value === 0) {
    return '居中';
  }

  return value < 0 ? `左 ${-value}%` : `右 ${value}%`;
});

/**
 * 写回参数
 * @desc 写的是**合并后的全量**而不是单个字段：从地址栏导入的锚点 `params` 可能是空的，
 *   只写差异的话，导出时就得到一份缺字段的配置
 */
function patchParams(patch: EffectParams, defer = true): void {
  if (!props.anchor) {
    return;
  }

  emit('patch', { params: { ...resolved.value, ...patch } }, { defer });
}

function onTimeChange(value: number | string): void {
  const time = Number(value);

  emit('patch', { time: Math.max(0, Math.round(Number.isFinite(time) ? time : 0)) });
}

/**
 * 面板里改时长
 * @desc 与拖条带右端走**同一个出口**（`spanPatchOf`），所以两条路径不可能给出
 *   不同的结果。传进去的原始秒数由它统一收敛与量化
 */
function onSpanChange(value: number | string): void {
  const anchor = props.anchor;
  const seconds = Number(value);

  if (!anchor || !Number.isFinite(seconds)) {
    return;
  }

  emit('patch', spanPatchOf(anchor, descriptor.value, seconds));
}

function onCaptionChange(event: Event): void {
  // 与广播接收端的清洗上限一致：本地预览看到的就是观众收到的
  patchParams({ caption: (event.target as HTMLInputElement).value.slice(0, 80) });
}

function onAnswerChange(event: Event): void {
  // 模板侧也截到 80 字：手改地址栏塞进来的超长答案不该把排版撑爆
  const value = (event.target as HTMLTextAreaElement).value.slice(0, 80);

  patchParams({ answerText: value });
}

/**
 * 参数被改过没有
 * @desc 判据是「锚点上存着参数」，不是「参数和模板默认值不同」——
 *   从地址栏导入或手改过的配置本来就可能带着一组恰好等于默认值的参数，
 *   和默认值比对会把这种判成「没动过」，于是那次改动静悄悄地就没了
 */
const hasCustomParams = computed(() => Object.keys(props.anchor?.params ?? {}).length > 0);

async function onTemplateChange(name: EffectTemplateName): Promise<void> {
  const anchor = props.anchor;

  if (!anchor || name === anchor.template) {
    return;
  }

  // 换模板要清空全部参数，而这一步没有撤销 —— 改过参数就先问一句。
  // 刚拖进来还没动过的直接换：那种情况下没什么可丢的，
  // 拿一个空对话框打断连续试用是纯亏（`plv-select` 是完全受控的，
  // 取消后显示会跟着 `value` 退回旧模板，不会留下改错的样子）
  if (hasCustomParams.value) {
    const confirmed = await messageBox({
      title: '换模板会清空已调参数',
      content: `「${
        descriptor.value?.label ?? anchor.template
      }」上改过的参数将全部丢失，且无法撤销。`,
      confirmButtonText: '仍然更换',
      cancelButtonText: '取消',
    }).$confirm();

    if (!confirmed) {
      return;
    }
  }

  /**
   * 换模板时清空参数：带着上一个模板的参数会让新模板长得像「选错了」
   *
   * ★ `spanSec` 也得清。它是个**倍数**（相对模板自然时长），留着的话
   *   2.8 秒的数据雨换成 1.5 秒的冲击波就成了 0.53 倍慢放 ——
   *   作者看到的是新模板「有 bug」。
   *   （倒计时那一种归属不用管：它的值在 `params` 里，被这次清空带走）
   *
   * ★ `feed` 同样得换成新模板的默认。留着旧 mode 有两种错法：新模板不认它
   *   （`resolveFeedMode` 静默退回 static，作者看到「怎么又变回转场了」），
   *   或者认得（于是用一种他从没选过的方式跑起来）。两种都难查
   */
  const defaultFeedMode = getEffectTemplate(name)?.defaultFeedMode;

  emit('patch', {
    template: name,
    params: {},
    spanSec: undefined,
    // 新互动锚点默认带答题卡；纯转场模板不写 feed，保持旧兜底路径
    feed: defaultFeedMode
      ? {
          mode: defaultFeedMode,
          ...(defaultFeedMode === 'static' ? {} : { collect: {} }),
        }
      : undefined,
  });
}

function onPrimaryChange(color: string): void {
  patchParams({ colorPrimary: color });
}

function onSecondaryChange(color: string): void {
  patchParams({ colorSecondary: color });
}

function onParticlesInput(value: number): void {
  patchParams({ particles: Math.round(value) });
}

function onRatioInput(value: number): void {
  patchParams({ ratio: value / 100 });
}

function onBiasInput(value: number): void {
  patchParams({ bias: value / 100 });
}

/**
 * 驱动配置的改动
 * @desc 刻意**不带 defer**：选模式、填关键词都是低频操作，
 *   即时落盘更符合预期 —— 改完顺手刷一下页面也不该丢
 */
function onFeedPatch(patch: Partial<BarrageAnchor>): void {
  emit('patch', patch);
}
</script>

<style lang="scss">
/* 与时间轴、模板卡片各自声明一份：这几个变量的作用域是**单个文件**，
   没有全局注入（`sass-resources-loader` 只注入 `sassResources` 里那几个文件） */
$accent: #4f7cff;

.c-params-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.c-params-panel__head {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
}

.c-params-panel__empty {
  padding: 24px 12px;
  font-size: 12px;
  line-height: 1.8;
  color: #6d7488;
  text-align: center;
  border: 1px dashed #343a49;
  border-radius: 6px;
}

/* 解释「为什么这一项是灰的」。用琥珀色而不是灰色 —— 它是说明，不是装饰 */
.c-params-panel__note {
  margin: 0;
  font-size: 10px;
  line-height: 1.6;
  color: #e0a458;
}

/* 直播模板参数的作用域说明。用带底的块而不是一行灰字：
   它回答的是「我改的到底是哪一份」，值得被看见一眼 */
.c-params-panel__shared {
  padding: 8px 10px;
  margin: 0;
  font-size: 11px;
  line-height: 1.7;
  color: #9fb4e8;
  background: rgba(79, 124, 255, 0.12);
  border: 1px solid rgba(79, 124, 255, 0.35);
  border-radius: 6px;
}

.c-params-panel__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.c-params-panel__label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 12px;
  color: #9aa1b4;

  b {
    font-weight: 600;
    color: #cdd6f0;
  }
}

.c-params-panel__row {
  display: flex;
  gap: 8px;
}

/* 文案用的原生 input。外观跟着后台那套输入框走，但不引 plv-input ——
   它的 props 被 mixin 隐藏、无法校验 */
.c-params-panel__text {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  font-size: 12px;
  color: #d5dae8;
  background: #232936;
  border: 1px solid #3d4658;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.15s;
}

.c-params-panel__text:focus {
  border-color: $accent;
}

/* 答案输入框：多行，但别把右栏撑开 */
.c-params-panel__textarea {
  height: auto;
  min-height: 52px;
  padding: 8px 10px;
  line-height: 1.5;
  resize: vertical;
}

/* 灰色说明，不是「为什么点不动」那种琥珀色告警 */
.c-params-panel__hint {
  margin: 0;
  font-size: 10px;
  line-height: 1.6;
  color: #5d6478;
}

.c-params-panel__ghost-btn {
  flex-shrink: 0;
  padding: 0 10px;
  font-size: 12px;
  color: #d5dae8;
  cursor: pointer;
  background: #232936;
  border: 1px solid #3d4658;
  border-radius: 4px;
  transition: border-color 0.15s;

  &:hover:not(:disabled) {
    border-color: #4f7cff;
  }

  &:disabled {
    color: #5d6478;
    cursor: not-allowed;
  }
}

.c-params-panel__remove {
  padding: 7px 0;
  margin-top: 4px;
  font-size: 12px;
  color: #ff8b8b;
  cursor: pointer;
  background: rgba(#ff6b6b, 0.08);
  border: 1px solid rgba(#ff6b6b, 0.4);
  border-radius: 4px;
  transition: background 0.15s;

  &:hover {
    background: rgba(#ff6b6b, 0.16);
  }
}

/**
 * ★ polyv-ui 控件的深色皮肤**不在这个文件里**，全部收在
 *   `effect-workbench.vue` 的 `.c-effect-workbench-active` 块下。
 *
 *   原先这里写过一份 `.c-params-panel .plv-input__main { background: … }`，
 *   看着没问题，其实**权重和主题一模一样**（都是两级）—— 同权就只能比先后，
 *   而主题在首屏的 `index.css`、这份样式在自己的异步 chunk 里，
 *   谁在后面全看加载时机。结果就是输入框时深时白，且 `vue-tsc` / eslint /
 *   webpack 一路绿灯，只有打开页面才看得见。
 *
 *   别在这里再加一份：同一批控件（触发设置、弹幕驱动、模拟弹幕）此前就是
 *   各写各的，那几处连一条深色规则都没有，纯白。
 */
</style>
