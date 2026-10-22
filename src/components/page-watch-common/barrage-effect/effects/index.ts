/**
 * @file 特效模板注册表
 * @desc 工厂与展示元数据的唯一来源。模板库卡片、参数面板「恢复默认」、时间轴投放幽灵都读这里，
 *   所以新增模板只要往 EFFECT_TEMPLATES 里加一项，六处 UI 会自动跟上。
 */
import type {
  EffectFactory,
  EffectFeedMode,
  EffectTemplateDescriptor,
  EffectTemplateName,
} from '../types';
import { CONVERGE_DEFAULTS, CONVERGE_DURATION, createConverge } from './converge';
import { COUNTDOWN_DEFAULTS, createCountdown } from './countdown';
import { CONFETTI_DEFAULTS, CONFETTI_DURATION, createConfetti } from './confetti';
import { PULSE_DEFAULTS, PULSE_DURATION, createPulse } from './pulse';
import { RAIN_DEFAULTS, RAIN_DURATION, createRain } from './rain';
import { SHOCKWAVE_DEFAULTS, SHOCKWAVE_DURATION, createShockwave } from './shockwave';
import { SPLIT_DEFAULTS, SPLIT_DURATION, createSplit } from './split';

/**
 * 全部模板，顺序即模板库里的展示顺序
 * @desc ★ `feedModes` 的第一项是**兜底**默认值，`static` 一律排第一。
 *   旧存档与旧分享链接没有 `feed` 字段，落到它身上，
 *   否则所有既有配置会突然从「放一次」变成「开收集窗」。
 *
 *   而「新拖进来的模板该默认怎么跑」是**另一个问题**，答案是 `defaultFeedMode` ——
 *   它只在创建时写进锚点，动不了上面那批既有配置。想改默认手感改它，别动数组顺序。
 */
export const EFFECT_TEMPLATES: EffectTemplateDescriptor[] = [
  {
    name: 'shockwave',
    label: '冲击波',
    description: '中心炸开，粒子向四周放射。通用高燃点，用在哪都不会错。',
    accent: '#ff3553',
    defaults: SHOCKWAVE_DEFAULTS,
    factory: createShockwave,
    naturalSec: SHOCKWAVE_DURATION,
    feedModes: ['static', 'scale'],
    defaultFeedMode: 'scale',
  },
  {
    name: 'converge',
    label: '汇聚吸入',
    description: '粒子从四边被吸进一点，收束成一次闪光。填了答案会继续成形为整句。',
    accent: '#7c5cff',
    defaults: CONVERGE_DEFAULTS,
    factory: createConverge,
    naturalSec: CONVERGE_DURATION,
    feedModes: ['static', 'scale'],
    defaultFeedMode: 'scale',
  },
  {
    name: 'confetti',
    label: '彩带礼花',
    description: '底部齐射的彩带，带自转与翻面。夺冠、开奖、破纪录。',
    accent: '#ffc53d',
    defaults: CONFETTI_DEFAULTS,
    factory: createConfetti,
    naturalSec: CONFETTI_DURATION,
    feedModes: ['static', 'scale'],
    defaultFeedMode: 'scale',
  },
  {
    name: 'pulse',
    label: '心跳脉冲',
    description: '同心波层层扩散，中心咚、咚两下。情绪高点，比冲击波更柔。',
    accent: '#ff4d8d',
    defaults: PULSE_DEFAULTS,
    factory: createPulse,
    naturalSec: PULSE_DURATION,
    // 刻意**不**声明 polarity：它的 bias 只能把光点整体横移，形态是中心对称的，
    // 「缝位置」这个语义根本不成立。对冲的判据是 ratio 与几何同源且实时 —— 只改配色不算
    feedModes: ['static', 'scale'],
    defaultFeedMode: 'scale',
  },
  {
    name: 'rain',
    label: '数据雨',
    description: '字符雨幕垂落，带发光尾迹。知识、科技类场景，不抢画面。',
    accent: '#2ee6a8',
    defaults: RAIN_DEFAULTS,
    factory: createRain,
    naturalSec: RAIN_DURATION,
    feedModes: ['static', 'scale', 'text'],
    // 其他模板都在比「多猛」，只有雨能把**弹幕原文**变成画面。让它默认读文字，
    // 否则这个能力要翻二级菜单才找得到 —— 而它恰好是最好演示的那个
    defaultFeedMode: 'text',
  },
  {
    name: 'split',
    label: '红蓝对抗',
    description: '红蓝两派弹幕自两侧冲向中点，在亮缝处消融。票差把缝往对面推。',
    accent: '#2f7bff',
    defaults: SPLIT_DEFAULTS,
    factory: createSplit,
    naturalSec: SPLIT_DURATION,
    // 掺入的 bias 是在 applyParams 里算、绘制时用的 —— 六个模板里唯一能实时拽动几何的那个
    feedModes: ['static', 'polarity', 'scale'],
    // 它的本质就是两派对冲，而 `polarity` 是六个模板里唯一能实时拽动几何的
    defaultFeedMode: 'polarity',
    // 两派弹幕在哪飞，分割线就该在哪 —— 观众可以把弹幕位置设成顶部/底部/半屏，
    // 光幕铺满整块视频的话，缝会和弹幕区域完全对不上
    followBarrageArea: true,
    scaleFullCount: 60,
  },
  {
    name: 'countdown',
    label: '文字倒计时',
    description: '粒子聚成大字倒数，每秒贴着新数字的轮廓流过去。与弹幕零关系。',
    accent: '#4f7cff',
    defaults: COUNTDOWN_DEFAULTS,
    factory: createCountdown,
    // 纯转场：只有 static，所以它出现在模板库的「转场」那一组，参数面板也不给驱动方式
    feedModes: ['static'],
    // 生产是 300 秒；缩略图按 8 秒一轮，否则卡片会停在那儿一动不动
    thumbnailParams: { countdownSec: 8, caption: '倒计时' },
    // 密度触发是「热闹了炸一下」，10 秒的短倒数才是这个场合该有的样子
    triggerParams: { countdownSec: 10, caption: '弹幕破了' },
  },
];

/** 模板标识 → 工厂，供特效层按锚点取用 */
export const effectTemplates = EFFECT_TEMPLATES.reduce<
  Partial<Record<EffectTemplateName, EffectFactory>>
>((map, item) => {
  map[item.name] = item.factory;
  return map;
}, {});

/** 取单个模板的完整描述 */
export function getEffectTemplate(name: EffectTemplateName): EffectTemplateDescriptor | undefined {
  return EFFECT_TEMPLATES.find(item => item.name === name);
}

/** 下拉选择用的选项列表 */
export const EFFECT_TEMPLATE_OPTIONS: Array<{ label: string; value: EffectTemplateName }> =
  EFFECT_TEMPLATES.map(item => ({ label: item.label, value: item.name }));

/** 驱动方式的展示名 */
export const FEED_MODE_LABELS: Record<EffectFeedMode, string> = {
  static: '转场',
  scale: '规模',
  text: '文字',
  polarity: '对冲',
};

/**
 * 是不是纯转场
 * @desc 只支持 `static` 即与弹幕零关系，只看时间轴。文字倒计时就是这一类
 */
export function isTransitionOnly(template: EffectTemplateDescriptor): boolean {
  return template.feedModes.length === 1;
}

/**
 * 类别名，给卡片徽标与参数面板用
 * @desc 「可互动」不是「纯互动」—— 它们全都保留 `static`，
 *   所以准确说法是「既能独立当转场，也能联合弹幕互动」
 */
export function getTemplateCategory(template: EffectTemplateDescriptor): string {
  return isTransitionOnly(template) ? '转场' : '可互动';
}

/** 按类别分组，供模板库分段展示 */
export function groupTemplatesByCategory(): Array<{
  category: string;
  items: EffectTemplateDescriptor[];
}> {
  const groups = [
    { category: '转场', items: [] as EffectTemplateDescriptor[] },
    { category: '可互动', items: [] as EffectTemplateDescriptor[] },
  ];

  EFFECT_TEMPLATES.forEach(item => {
    const group = isTransitionOnly(item) ? groups[0] : groups[1];
    group.items.push(item);
  });

  // 空组不展示：一个标题下面什么都没有会让人以为加载失败了
  return groups.filter(group => group.items.length > 0);
}
