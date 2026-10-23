/**
 * @file 术语释义卡片状态
 */
import { computed, ref } from 'vue';
import { PolyvWatchCore } from '@polyv/live-watch-sdk';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { copyText } from '@/assets/utils/copy';
import { TERM_MAP } from '@/assets/term-dictionaries';
import { TermItem, TermTrack } from '@/core/term/term-matcher';
import { useChatStore } from '@/store/use-chat-store';

export type AskState = 'idle' | 'sending' | 'sent' | 'copied' | 'asked';

const TRACK_LABELS: Record<TermTrack, string> = {
  medical: '医学',
  trade: '外贸',
  workplace: '职场',
};

export function useTermCard(track: TermTrack) {
  const { getWatchCore, getEmitter } = useGlobalInject();
  const chatStore = useChatStore();

  let watchCore: PolyvWatchCore | undefined;

  function resolveWatchCore() {
    if (watchCore) return watchCore;

    try {
      watchCore = getWatchCore();
    } catch (error) {
      console.warn('[term] watchCore is not ready', error);
    }

    return watchCore;
  }

  const activeTermIds = ref<string[]>([]);
  const activeTermIndex = ref(0);
  const activeTermCandidates = computed(() =>
    activeTermIds.value
      .map(termId => TERM_MAP.get(termId))
      .filter((term): term is TermItem => !!term),
  );
  const activeTerm = computed(() => activeTermCandidates.value[activeTermIndex.value]);
  const trackLabel = TRACK_LABELS[track];
  const activeTermMeta = computed(() => {
    const term = activeTerm.value;
    if (!term) return '';
    return term.category ? `${trackLabel} · ${term.category}` : trackLabel;
  });

  const askState = ref<AskState>('idle');
  const askLabel = computed(() => {
    if (askState.value === 'sending') return '发送中...';
    if (askState.value === 'asked') return '已问小助手';
    if (askState.value === 'sent') return '已发送';
    if (askState.value === 'copied') return '话术已复制';
    return '一键提问';
  });

  function openTerm(termIds?: string[]) {
    if (!termIds?.length) return;
    activeTermIds.value = termIds;
    activeTermIndex.value = 0;
    askState.value = 'idle';
  }

  function selectTerm(index: number) {
    if (index < 0 || index >= activeTermCandidates.value.length) return;
    activeTermIndex.value = index;
    askState.value = 'idle';
  }

  function resetCard() {
    activeTermIds.value = [];
    activeTermIndex.value = 0;
    askState.value = 'idle';
  }

  function closeCard() {
    resetCard();
  }

  function emitScrollToNew(): void {
    try {
      getEmitter().emit(appEvents.chat.ScrollToNew);
    } catch (emitError) {
      console.warn('[term] scroll chat failed', emitError);
    }
  }

  /**
   * 发送提问
   * @desc ★ 必须等发送接口真正拿到服务端回包，再通知列表滚动。
   *
   *   V1 列表的消息源是 `watchCore.chat.eventEmitter`，V2 列表的消息源是
   *   `chatTarget.eventEmitter`，两者互不相通，所以要按当前 UI 版本选入口。
   *
   *   而无论哪一版，列表在「不在底部」时都不会把新消息插进当前视口：
   *   V1 只亮出「更多消息」，V2 直接清空消息队列。它们收到 `ScrollToNew`
   *   后会重新拉一次最近历史 —— 如果这个通知在服务端落库之前发出（V2 的
   *   `useSendChatMsg` 就是不 await 直接通知），重拉回来的历史里没有这条，
   *   于是表现为「消息发出去了，列表没有，刷新后才出现」。
   */
  async function sendQuestion(content: string): Promise<void> {
    const core = resolveWatchCore();
    if (!core) throw new Error('watchCore is not ready');

    if (chatStore.isChatUIV2) {
      const chatTarget = core.chat.chatTarget;
      if (!chatTarget) throw new Error('chatTarget is not ready');

      await chatTarget.sender.sendSpeakMsg({ content });
    } else {
      await core.chat.sendSpeakMsg({ content });
    }

    emitScrollToNew();
  }

  async function askQuestion() {
    const term = activeTerm.value;
    if (
      !term ||
      askState.value === 'sending' ||
      askState.value === 'sent' ||
      askState.value === 'asked'
    ) {
      return;
    }

    const content = `请结合当前视频内容解释一下「${term.canonical}」是什么意思。`;

    // 小助手可用时优先问小助手：它会带着本场术语表和实时字幕上下文回答。
    // 宿主被 ?liveBuddy=0 关闭或脚本未加载时，保留原来的聊天区提问兜底。
    const askBuddy = window.LiveBuddy?.ask;
    if (askBuddy) {
      askBuddy(content);
      askState.value = 'asked';
      window.setTimeout(() => {
        askState.value = 'idle';
      }, 3000);
      return;
    }

    askState.value = 'sending';

    try {
      await sendQuestion(content);

      askState.value = 'sent';
    } catch (error) {
      console.warn('[term] send question failed', error);
      try {
        await copyText(content);
        askState.value = 'copied';
      } catch (copyError) {
        console.warn('[term] copy question failed', copyError);
        askState.value = 'idle';
      }
    } finally {
      window.setTimeout(() => {
        askState.value = 'idle';
      }, 3000);
    }
  }

  return {
    trackLabel,
    activeTerm,
    activeTermCandidates,
    activeTermIndex,
    activeTermMeta,
    askLabel,
    askState,
    openTerm,
    selectTerm,
    closeCard,
    resetCard,
    askQuestion,
  };
}
