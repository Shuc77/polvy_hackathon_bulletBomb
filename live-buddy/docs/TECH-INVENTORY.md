# 技术盘点

调研时间：2026-10-23

## 本地项目

- 当前工作区 `保利威黑客松大赛` 是空 Git 仓库，没有现成框架、后端、AI 配置或页面。
- 参考项目 `C:\polyvgame\polyv-web-live-watch-sdk` 是保利威官方观看页 UI 层，版本 `2.20.0`，使用 Vue 2.7.16、TypeScript、Pinia、Webpack。
- 观看页逻辑层为 `@polyv/live-watch-sdk@2.20.0`。本项目的播放器壳没有强制绑定 Vue，避免为了复用一套观看页 UI 而整体迁移技术栈。

## 已核实的真实能力

### 观看页 SDK

源码依据：

- `polyv-web-live-watch-sdk/src/core/watch-sdk.ts`
- `polyv-web-live-watch-sdk/node_modules/@polyv/live-watch-sdk/lib/polyv-live-watch-sdk.d.ts`
- 官方文档：https://help.polyv.net/live/js/new_sdk/live_watch_sdk/articles/core/sdk-core/

真实接口：

```ts
const watchCore = createWatchCore({ channelId: '频道号' });
await watchCore.setup();
```

- `channelId`：必填频道号。
- `targetSessionId`：可选，指定场次。
- `appId`：不在观看页 `AppConfig` 中；它是保利威服务端接口签名参数。
- `watchCore.channel.getCurrentSessionId()` 可用于取得当前场次。

### 实时字幕

源码依据：

- `src/core/bind-sdk-events/bind-subtitle-events.ts`
- `polyv-live-watch-sdk.d.ts` 中 `SubtitleEvents`、`SubtitleRealTimeCC`

真实事件：

```ts
watchCore.subtitle.eventEmitter.on('SubtitleRealTimeCC', data => {
  // data: { index, text, language, sliceType }
});
```

结论：保利威观看 SDK 能提供实时字幕文本，但没有“专业术语”语义事件。专业术语识别与高亮仍由队友模块产生，Live Buddy 只消费队友发出的 `LiveTermEvent`。

### 老师发布的答题卡

源码依据：

- `src/components/page-watch-common/interactive-receive-v2`
- 官方文档：https://help.polyv.net/live/js/new_sdk/interactions_receive_sdk/sdk/answer_card/

真实事件：

- `GET_TEST_QUESTION_CONTENT`：老师发起答题，含题型、题干、选项与限时信息。
- `STOP_TEST_QUESTION`：答题结束。
- `GET_TEST_QUESTION_RESULT`：老师发送结果，数据可含答案、选项统计。

限制：

- 需要互动接收端 SDK 的 `socket`、频道/场次信息和 `getViewerApiToken`。
- `viewerApiToken` 必须由后端使用 `appId + appSecret` 签名获取，不能在前端生成。

### 服务端 API

- 官方明确 `appSecret` 禁止进入浏览器，所有签名接口应通过自有后端转发。
- 用户提供的场景汇总 API 是统计数据接口，不用于字幕或题目事件，本项目没有误用。
- 已配置 `POLYV_APP_ID=hmpc5skuwx` 的安全占位；`POLYV_APP_SECRET` 尚未提供。

## 当前实现边界

真实可用：

- 已接入 `C:\polyvgame\polyv-web-live-watch-sdk` 的 `15021` 观看页，频道号 `8574764`，回放 VID `2cfade64310ddaa5a98df5e104accebf_2`。
- 宠物宿主以同源透明 iframe 挂载；折叠时只占右下角，展开时向右侧扩展。
- 宿主暴露 `window.LiveBuddy.injectTerm/injectQuestion/setLiveContext`，并转发同名 CustomEvent。
- 宠物状态与开合交互。
- 术语事件注入、去重、搜索、详情、场次隔离、本地恢复。
- 题目事件注入、列表、详情、答案权限。
- 随手记支持播放时间、术语和题目关联；关联内容会同时出现在对应术语/题目详情中。
- AI 请求后端、上下文组装、超时/限流/错误处理。
- DeepSeek 通过 OpenAI-compatible Chat Completions 接口接入，密钥仅存放于后端 `.env`。
- 后端会在每次请求中注入当前北京时间；模型优先使用直播上下文，资料不足时允许使用通用知识回答。
- 无模型密钥时的规则演示回答，并在 UI 中明确标注“未调用模型”。

预留但未接：

- 互动接收端答题卡到 `QuestionProvider` 的直接转发。
- 生产环境的 AI 后端部署地址（当前默认 `http://127.0.0.1:8787/api/chat`）。
- 当前观看页默认走真实模式，不加载演示术语和题目；需要演示数据时通过 `liveBuddyMode=demo` 启用。
- 字幕术语已由 `src/live-buddy/term-sync.ts` 接入，直播与回放共用同一套 `TermTrie` 匹配结果。

缺失配置：

- 真实 `channelId`。
- 真实 `targetSessionId`（如使用系列场次）。
- `POLYV_APP_SECRET`（如从后端调用需要签名的保利威接口）。
- `AI_API_KEY` 与 `AI_MODEL`（如调用真实模型）。
