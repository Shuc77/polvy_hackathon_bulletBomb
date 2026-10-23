/**
 * @file 特效音效
 * @desc 模板与音频的唯一映射。音效只在特效**开演的那一刻**触发，因此调用点必须和
 *   `driver.play()` 放在同一处，而不是散落在播放器事件里。
 *
 *   音频走 `HTMLAudioElement` 而不是 Web Audio：cheer.mp3 只有 100KB，
 *   页面加载即预取，触发时从头播放即可；Web Audio 还要处理 AudioContext 的
 *   用户手势解锁与解码等待，换来的是当前场景用不上的低延迟。
 */
import type { EffectTemplateName } from './types';

/**
 * 模板 → 音效
 * @desc 彩带礼花承担「欢呼」场景：视觉 2.8s，音效 3s，基本同长。
 *   以后给其他模板加音效，往这里加一项即可，播放逻辑不用改
 */
const SOUND_BY_TEMPLATE: Partial<Record<EffectTemplateName, string>> = {
  confetti: require('@/assets/media/cheer.mp3'),
};

/** 音效音量。比播放器原声低一档，避免盖住主播人声 */
const SOUND_VOLUME = 0.65;

/**
 * 同一模板最多同时保留几路
 * @desc 锚点排得很密时不让后一声把前一声硬切掉；不设上限则会无限新建媒体元素，
 *   而且叠太多也只会糊成噪音
 */
const MAX_VOICES = 2;

interface SoundVoice {
  audio: HTMLAudioElement;
  src: string;
}

const voices: SoundVoice[] = [];

function createVoice(src: string): SoundVoice {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.volume = SOUND_VOLUME;

  return { audio, src };
}

// 页面加载即预取，触发时不必再等网络
Array.from(new Set(Object.values(SOUND_BY_TEMPLATE))).forEach(src => {
  if (src) {
    voices.push(createVoice(src));
  }
});

/**
 * 取一路可用的音效
 * @desc 优先复用已经播完的同一音效；没有余量时复用该音效最早的一路，
 *   避免同一模板的声音互相打断其他模板
 */
function takeVoice(src: string): SoundVoice | undefined {
  const idle = voices.find(voice => voice.src === src && (voice.audio.paused || voice.audio.ended));

  if (idle) {
    return idle;
  }

  if (voices.length < MAX_VOICES) {
    const voice = createVoice(src);
    voices.push(voice);
    return voice;
  }

  return voices.find(voice => voice.src === src) ?? voices[0];
}

/**
 * 播放特效音效
 * @desc 没有配置音效的模板直接返回，调用方不必判断模板名。
 *   移动端可能因为自动播放策略拒绝，这是预期内的，静默忽略即可
 */
export function playEffectSound(template: EffectTemplateName): void {
  const src = SOUND_BY_TEMPLATE[template];

  if (!src || typeof Audio === 'undefined') {
    return;
  }

  const voice = takeVoice(src);
  if (!voice) {
    return;
  }

  if (voice.src !== src) {
    voice.src = src;
    voice.audio.src = src;
  }

  try {
    voice.audio.currentTime = 0;
  } catch {
    // 元数据尚未加载完时赋值会抛错；此时 play() 本来就会从头开始
  }

  voice.audio.play().catch(() => undefined);
}
