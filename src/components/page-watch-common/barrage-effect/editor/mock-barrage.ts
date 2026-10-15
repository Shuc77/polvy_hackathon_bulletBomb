/**
 * @file 工作台模拟弹幕
 * @desc 作者不能等真实观众发弹幕。
 *
 *   ★ 关键：它写的是**与生产完全同一个入口** —— app 级总线上的 `BarrageLanded`。
 *   舞台订阅的缓冲、生产层订阅的缓冲，都是同一个事件的两个订阅者。
 *   所以预览走的代码路径与生产逐行相同，「预览能看出来、上线就坏」从结构上不可能发生。
 *   这里只造**样本**，不造假实例。
 */
import { useGlobalInject } from '@/app/use-global-inject';
import { emitBarrageSignal } from '../barrage-signal';
import { parseKeywords } from '../feed-window';

/** 没配关键词时的兜底词。作者还没填词也得能试出效果 */
export const FALLBACK_WORDS = { primary: '红', secondary: '蓝' };

/** 真实观众不会只发一个词。套一层句子，顺带把 includes 匹配也验了 */
const SENTENCE_TEMPLATES = ['{w} 冲啊', '我投 {w}', '{w}！', '支持 {w}', '{w} 稳住'];

export type MockSide = 'primary' | 'secondary';

export interface MockBarrageWords {
  wordsA?: string;
  wordsB?: string;
}

const useMockBarrage = (getWords: () => MockBarrageWords) => {
  const { getEmitter } = useGlobalInject();

  /** 取一个该派的关键词。没配就用兜底词 */
  function pickWord(side: MockSide): string {
    const { wordsA, wordsB } = getWords();
    const pool = parseKeywords(side === 'primary' ? wordsA : wordsB);

    return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : FALLBACK_WORDS[side];
  }

  function sendOne(side: MockSide): void {
    const word = pickWord(side);
    const sentence = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)];

    emitBarrageSignal(getEmitter(), sentence.replace('{w}', word), false);
  }

  /**
   * 连发
   * @desc 一次发完而不是按时间摊开：窗内统计的是「条数」，
   *   摊开只是让它慢一点到齐，反而看不出即时反馈
   */
  function burst(count: number, sharePrimary: number): void {
    const primaryCount = Math.round(count * sharePrimary);

    for (let index = 0; index < count; index += 1) {
      sendOne(index < primaryCount ? 'primary' : 'secondary');
    }
  }

  return { sendOne, burst };
};

export { useMockBarrage };
