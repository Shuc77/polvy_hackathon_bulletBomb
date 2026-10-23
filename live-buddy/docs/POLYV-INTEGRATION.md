# 保利威观看页集成说明

## 已验证页面

```text
http://localhost:15021/index.html?channelId=8574764&playBackVid=2cfade64310ddaa5a98df5e104accebf_2
```

## 文件位置

| 职责 | 文件 |
| --- | --- |
| 宿主注册 | `src/main.ts` |
| iframe 与事件桥 | `src/live-buddy/host.ts` |
| 字幕术语同步 | `src/live-buddy/term-sync.ts` |
| 宠物 widget 源码 | `live-buddy/src/WidgetApp.tsx` |
| widget 构建配置 | `live-buddy/vite.widget.config.ts` |
| 浏览器产物 | `external/live-buddy` |
| 生产包复制 | `webpack.config.js` |

## 行为

- 宿主读取 `channelId`、`playBackVid`、`sessionId` / `targetSessionId`，并统一补全事件里的场次 ID。
- 默认走真实模式，不加载任何样例数据，只接收字幕、题目和上下文事件。
- URL 加 `liveBuddyMode=demo` 才会载入明确标记为“演示数据”的样例。
- 字幕模块通过 `window.LiveBuddy.injectTerm` 和 `setLiveContext` 推送术语与上下文；术语卡片的「一键提问」调用 `window.LiveBuddy.ask`，自动展开面板并切到「问 AI」。
- 术语同步不弹提示气泡，只在词库中实时累计；新术语会让宠物做一个发现动作。
- 宠物折叠时保持独立锚点；快速聊天围绕宠物中心展开（当前 1.5× 屏幕缩放下视觉约 `510×80`），主面板约 `380×600` 并优先放在宠物旁边。
- 手机端主面板限制为 `320×480`，保留播放器区域可见。
- 宠物面板打开/关闭时，通过 `postMessage` 通知宿主调整 iframe 尺寸。
- 页面事件通过 `window.LiveBuddy` 或 `live-buddy:term` 等 CustomEvent 转发。
- 宠物左键只触发挠痒反馈，右键不会打开界面；快捷栏默认隐藏并仅在悬停时显示。
- 拖动时宿主以 `requestAnimationFrame + translate3d` 移动 iframe，并通知宠物切换奔跑方向。
- 快速聊天内光标位置通过组件状态传给宠物，驱动眼睛轻微跟随。

## 重新构建

```powershell
cd live-buddy
npm install
npm run build:widget

cd ..
npm run dev
```

开发服务器从 `external/` 直接提供 `/live-buddy/widget.html`。

生产包：

```powershell
cd live-buddy
npm run dev:api   # 另开终端，AI 后端

cd ..
npm run build
```

`dist/live-buddy` 会由 `external/live-buddy` 自动复制。
