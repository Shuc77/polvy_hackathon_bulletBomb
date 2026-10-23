# 队友模块接入契约

字幕高亮模块已经接入（`src/live-buddy/term-sync.ts`），下面的事件入口仍然保留，供题目、答题卡和其他数据源复用。真实模式不会自动加载演示术语或题目。

## 浏览器事件

字幕/术语模块可以向当前页面派发：

```ts
window.dispatchEvent(
  new CustomEvent('live-buddy:term', {
    detail: {
      sessionId: '当前场次 ID',
      term: 'LTV',
      translation: 'Life Time Value',
      explanation: '用户终身价值',
      timestamp: 186,
      occurrences: 1,
      source: 'subtitle',
    },
  }),
);
```

题目模块可以派发：

```ts
window.dispatchEvent(
  new CustomEvent('live-buddy:question', {
    detail: {
      sessionId: '当前场次 ID',
      id: 'answer-card-123',
      title: '题干',
      options: [
        { key: 'A', text: '选项 A' },
        { key: 'B', text: '选项 B' },
      ],
      correctAnswers: ['B'],
      explanation: '解析',
      status: 'closed',
      answerVisible: true,
      submittedAnswers: ['B'],
      source: 'answer-card',
      askedAt: 1761193750000,
    },
  }),
);
```

字幕上下文可以派发：

```ts
window.dispatchEvent(
  new CustomEvent('live-buddy:context', {
    detail: {
      sessionId: '当前场次 ID',
      text: '老师刚说的一段话',
      timestamp: 204,
    },
  }),
);
```

## 直接调用

页面加载后也可以调用：

```ts
window.LiveBuddy?.injectTerm(event);
window.LiveBuddy?.injectQuestion(event);
window.LiveBuddy?.setLiveContext(event);
window.LiveBuddy?.ask('请解释一下 LTV 是什么意思');
window.LiveBuddy?.setSession(sessionId);
window.LiveBuddy?.setMode('live');
window.LiveBuddy?.openPanel();
window.LiveBuddy?.closePanel();
```

`ask` 会展开宠物面板、切到「问 AI」并直接发送问题。宿主会补全 `sessionId`，调用方可以省略。

## 防重复与场次

- 术语按 `trim + 连续空格归一化 + 小写` 去重。
- 同一术语重复推送时，补齐原有记录中缺失的翻译或解释，并按 `occurrences` 累加本场出现次数。
- 题目优先按 `id` 去重；没有 `id` 时按题干归一化去重。
- `sessionId` 不匹配当前场次的事件会被忽略并显示提示。
- 每个场次单独存于 `localStorage`，保留 12 小时。
- 关闭宠物面板不会结束场次，数据不会清空。

## 与保利威 SDK 的适配方式

### 字幕

当前实现：`src/components/page-watch-common/player/player-subtitle/_hooks/use-term-subtitle.ts`（直播）和 `player-replay-subtitle.vue`（回放）在字幕渲染时调用 `src/live-buddy/term-sync.ts`，把匹配结果推给 `window.LiveBuddy`。同一句字幕按 `cueKey` 去重，术语在不同字幕里重复出现时累计次数。

如果宿主页面要自己接其他字幕源，也可以把 `SubtitleRealTimeCC` 的文本送入自己的识别模块，再产生 `LiveTermEvent`。不要把 `SubtitleRealTimeCC` 直接当作术语事件，它没有术语语义字段。

```ts
watchCore.subtitle.eventEmitter.on('SubtitleRealTimeCC', data => {
  teammateTermDetector.push({
    text: data.text,
    timestamp: data.index,
    sessionId: watchCore.channel.getCurrentSessionId(),
  });
});
```

### 答题卡

```ts
answerCardSdk.on(answerCardSdk.events.GET_TEST_QUESTION_CONTENT, msg => {
  window.LiveBuddy?.injectQuestion({
    sessionId,
    id: String(msg.id),
    title: msg.name,
    options: msg.options?.map(option => ({
      key: option.value,
      text: option.text,
    })),
    status: 'open',
    answerVisible: false,
    source: 'answer-card',
  });
});

answerCardSdk.on(answerCardSdk.events.GET_TEST_QUESTION_RESULT, msg => {
  window.LiveBuddy?.injectQuestion({
    sessionId,
    id: String(msg.id),
    title: msg.name,
    options: msg.options?.map(option => ({
      key: option.value,
      text: option.text,
    })),
    correctAnswers: msg.answer,
    explanation: msg.analysis,
    status: 'closed',
    answerVisible: true,
    source: 'answer-card',
  });
});
```

真实字段可能随互动 SDK 版本变化，接入前必须以当前版本的类型和实际事件数据为准。
