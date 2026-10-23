# 直播小伙伴 Live Buddy

一只住在保利威直播间里的 AI 学习宠物：记录本场专业术语、回看老师发布的课堂题目，并在本场可用资料范围内回答问题。

当前已接入保利威观看页源码工程：

- 频道号：`8574764`
- 回放 VID：`2cfade64310ddaa5a98df5e104accebf_2`
- 观看页：`http://localhost:15021/index.html?channelId=8574764&playBackVid=2cfade64310ddaa5a98df5e104accebf_2`

宠物直接叠加在原观看页右下角；打开面板时只向右侧展开，不替换或遮挡主播放器。

## 本地运行

环境要求：Node.js 20.10+。

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

打开 `http://localhost:5173`。

生产构建与测试：

```powershell
npm run test
npm run build
```

## 演示模式

直接打开首页即为演示模式，包含明确标识的示例术语和题目。

- 点击右下角宠物展开面板。
- 宠物下方按钮默认隐藏，鼠标移到宠物身体上后淡入显示。
- 快速提问以按钮中心为原点，向左右同时展开；当前 1.5× 屏幕缩放下视觉尺寸约为 `510×80`。
- 打开问 AI 面板时直接定位到最新消息；只有新增消息和生成回答时才使用平滑滚动。
- 用户消息使用保利威蓝到青色的渐变气泡；AI 消息和回答中状态直接使用 `src/assets/polyv-ai-logo.jpg` 原图头像。
- 宠物可拖到页面任意位置；移开后再次打开界面不会重置位置。
- 拖动时采用合成层逐帧位移并暂停高成本动画，宠物会朝移动方向切换左跑/右跑姿态。
- 宠物左键单击只会触发挠痒动画，右键不会打开界面；只有第二个按钮打开主界面。
- 快速聊天打开后，宠物的眼睛会跟随聊天框内光标移动。
- 悬停时宠物会蹦跳、挥手和踏步，空闲每 5 秒眨眼，思考时切换屏幕表情。
- 嵌入式主面板约为 `380×600`，根据左右空间出现在宠物当前位置旁边；关闭后宠物仍在原拖动位置。
- 手机窄屏下主面板限制为 `320×480`，不再铺满整个观看页。
- 在“问 AI”中提问，例如“能力图谱是什么意思？”或“现在几点？”。
- 点击页面右上角“事件控制台”，可注入术语、题目和字幕上下文、切换场次或真实模式。
- 宠物快捷栏第三个按钮可直接记随手记，并自动绑定当前播放时间。
- 没有 `AI_API_KEY` 时，后端会返回带“规则演示 · 未调用模型”标识的降级回答。

## 真实场次

观看页 SDK 的必需参数是 `channelId`，不是 `appId`。

.env 示例：

```dotenv
VITE_POLYV_APP_ID=hmpc5skuwx
VITE_POLYV_CHANNEL_ID=你的频道号
VITE_POLYV_TARGET_SESSION_ID=指定系列场次时填写
```

也可以使用 URL：

```text
http://localhost:5173/?mode=live&channelId=频道号&targetSessionId=场次ID
```

没有 `channelId` 时，系统会保持在演示页面，不会伪造真实直播成功。

## 接入保利威观看页

Live Buddy 子工程现在位于 SDK 仓库的 `live-buddy/`，宿主代码位于：

- 宿主 iframe 与事件桥：`src/live-buddy/host.ts`
- 入口注册：`src/main.ts`
- 生产复制配置：`webpack.config.js`

观看页默认加载真实模式，不注入任何示例术语或题目。需要演示数据时，在观看页 URL 后加：

```text
&liveBuddyMode=demo
```

修改宠物 UI 后，重新生成同源 widget：

```powershell
cd live-buddy
npm run build:widget
```

产物写入 SDK 的 `external/live-buddy/`。开发服务器会直接从 `external/` 提供 `/live-buddy/widget.html`；SDK 执行 `npm run build` 时会把该目录复制到生产包 `dist/live-buddy/`。

启动 AI 后端（另开一个终端）：

```powershell
cd live-buddy
Copy-Item .env.example .env
npm run dev:api
```

默认监听 `http://127.0.0.1:8787`，观看页的 widget 会向 `/api/chat` 提问。

## AI 配置

`server/index.ts` 是 OpenAI-compatible Chat Completions 适配层：

```dotenv
AI_BASE_URL=https://api.deepseek.com/v1
AI_API_KEY=
AI_MODEL=deepseek-chat
AI_TIMEOUT_MS=25000
ALLOW_DEMO_AI=true
CORS_ORIGIN=http://localhost:5173,http://localhost:15021,http://127.0.0.1:15021
```

把 DeepSeek Key 写进 `live-buddy/.env`。该文件已被 `live-buddy/.gitignore` 忽略，**不要提交**。密钥只由后端读取，不会出现在浏览器代码里；不要把 API Key、保利威 `appSecret` 写入任何 `VITE_*` 变量。

AI 会优先使用本场术语、题目和字幕；资料不足时仍可回答通用知识、写作、销售方法和当前时间等问题。

## 字幕与术语高亮联动

字幕模块已经和小助手接通：

- `src/live-buddy/term-sync.ts` 在直播/回放字幕出现时，把匹配到的术语、英文翻译、`zh + note` 解释、出现时间推给 `window.LiveBuddy.injectTerm`。
- 同一句字幕只上报一次；术语在不同字幕里重复出现时累加 `occurrences`，面板「术语」页显示出现次数和最近命中时间。
- 当前字幕（原文 + 翻译）会通过 `setLiveContext` 送进 AI 上下文，回答会优先结合本场内容。
- 术语卡片上的「一键提问」改为 `window.LiveBuddy.ask(question)`：自动展开宠物面板、切到「问 AI」并发送问题。只有小助手被 `?liveBuddy=0` 关闭或宿主未加载时，才退回原来的聊天区提问。

宿主会按当前页面统一补全 `sessionId`，字幕模块不需要自己拼 `targetSessionId || playback-<channelId>-<vid>`。事件接口见 [docs/TEAM-INTERFACE.md](docs/TEAM-INTERFACE.md)。

## 数据生命周期

- 数据按 `sessionId` 隔离。
- 当前浏览器中的场次数据保留 12 小时，并在写入时清理过期场次。
- 关闭面板不清空数据；切换到其他场次会加载该场次自己的数据。
- 不收集姓名、手机号等身份信息。
- 完整字幕只保留最近 80 条，AI 对话只保留最近 24 条；超出后自动截断。
- 本场随手记最多保留 80 条，可按当前播放时间记录，也可关联术语或题目。

## 已验证能力与限制

已实现：

- 宠物待机、思考、发现术语、回答四种真实交互状态。
- 字幕术语自动接收、去重、出现次数统计、详情和搜索。
- 术语高亮「一键提问」直接打开小助手并发送问题。
- 题目回看、选项、已选状态和答案权限判断。
- 后端 AI 适配、超时、限流、空响应和错误提示。
- 无密钥规则降级、演示/真实模式区分、场次隔离和刷新恢复。

尚未接入：

- 互动接收端答题卡到本项目的真实 socket 转发。
- 需要 `appSecret` 的保利威服务端接口。
- 双端直播间广播/鉴权场景的自动化验证（观看页需要微信扫码登录）。

详细技术依据见 [docs/TECH-INVENTORY.md](docs/TECH-INVENTORY.md)，实际测试结果见
[docs/TEST-REPORT.md](docs/TEST-REPORT.md)。

## 现场演示流程

1. 打开真实观看页，说明宠物会跟随本场字幕自动收集术语。
2. 等字幕出现高亮术语，点击它，再点「一键提问」，展示小助手自动展开并回答。
3. 打开「术语」页，展示词库、出现次数和最近命中时间。
4. 问“现在几点？”或课程相关问题，展示 AI 问答。
5. 需要演示注入时，在 URL 加 `&liveBuddyMode=demo` 打开事件控制台。
6. 切换到新场次，证明词库、题目和对话不会串场。
