# 术语词库

当前医学赛道使用 `medical.generated.json`（由 `医学专业名词大全.csv` 导入），并自动合并 `sample.json` 中独有的演示词条。外贸、职场赛道仍使用 `sample.json`。

## 字幕数据来源与接入边界

保利威的“字幕生成回调”和观看 SDK 的“实时字幕事件”不是同一条链路：

- [字幕生成回调](https://help.polyv.net/live/api/callback/subtitle_callback.md)是在字幕文件生成完成后，向业务服务器 POST `srtUrl`、`language`、`isOriginal`、`source` 等文件信息，不逐句推送直播字幕，不能用来驱动实时外挂字幕。
- 直播实时字幕优先监听观看 SDK 的 `SubtitleEvents.SubtitleRealTimeCC` 与 `SubtitleEvents.SubtitleTranslate`；同时每秒增量拉取一次 SDK 字幕历史接口作为兜底，避免部分直播/伪直播场景 WebSocket 字幕帧漏发时只能刷新才更新。
- 官方播放器目前只显示原声字幕，翻译字幕主要在聊天室展示；本插件通过外部字幕层消费翻译事件，但翻译事件是否可用仍取决于频道字幕配置。
- 实时字幕不受拉流延迟影响，官方 FAQ 明确说明字幕可能比人声先出现，因此事件到达时间只能用于近似时移定位，不能当作严格音画同步时间。
- 直播中暂不支持切换原声语言或翻译目标语言；连麦和伪直播场景也不支持实时字幕。

## CSV 导入

```powershell
node scripts/import-medical-csv.js "E:\polyv_demo\医学专业名词大全.csv"
```

脚本会生成：

- `medical.generated.json`：前端直接使用的词库
- `medical.conflicts.md`：多义缩写报告，按 category 分组

CSV 字段映射：

| CSV 字段 | JSON 字段 | 说明 |
| --- | --- | --- |
| `main_term` | `canonical` | 标准术语 |
| `abbr` | `aliases` | 缩写，自动并入别名 |
| `match_aliases` | `aliases` | 用中文分号 `；` 分隔，自动拆分 |
| `zh_def` | `zh` | 中文释义 |
| `en_def` | `en` | 英文释义 |
| `remark` | `note` | 备注 |
| `category` | `category` | 子领域，用于卡片展示和冲突判断 |
| `priority` | `priority` | 数字越小优先级越高，1 最高 |

## 大小写规则

术语匹配严格区分大小写。`CT` 不会命中 `ct`，`PD-1` 不会命中 `pd-1`；如果需要同时匹配不同大小写，请在 `aliases` 中分别列出。

## 多义缩写怎么处理

同一别名命中多个术语时，匹配器不会再“后写入覆盖”，而是保留全部候选：

1. `canonical` 与字幕原文完全一致时优先；
2. 其次比较 `priority`，数字小的优先；
3. 仍相同则按 `id` 稳定排序；
4. 卡片里会显示「可能含义」按钮，可手动切换并查看各自释义。

例如：

- `CHD` → 冠心病（p1）/ 先天性心脏病（p2）
- `AR` → 抗生素耐药 / 不良反应 / 过敏性鼻炎
- `高尿酸血症` → 精确命中「高尿酸血症」，同时保留候选「痛风」

如果业务上可以确定某个子领域，建议在 URL 中固定赛道，或在导入前把该子领域的 `priority` 调高，减少默认选中错误。

## 本地切换赛道

在观看页地址后加参数：

```text
&termTrack=medical
&termTrack=trade
&termTrack=workplace
```

## 模拟字幕

在能够正常打开频道的观看页地址后加：

```text
&termDemo=1&termTrack=medical
```

会强制挂载外挂字幕层，并按播放器当前时间每 6 秒切换一句内置演示字幕，不依赖频道是否正在直播、是否已开启实时字幕。拖动进度条时字幕会跟随播放时间切换，适合先验证高亮、卡片、提问和时移交互。回放页如果存在回放字幕列表，会优先使用真实回放字幕。

示例：

```text
http://localhost:15021/index.html?channelId=8569666&playBackVid=66f08e45e98a408a9d093918377deaf3_6&termDemo=1&termTrack=medical
```

## 直播、时移与点播的时间轴

三种场景使用同一套“播放器时间驱动”原则，但数据来源不同：

| 场景 | 数据来源 | 同步方式 | 能力边界 |
| --- | --- | --- | --- |
| 直播实时 | `SubtitleRealTimeCC` / `SubtitleTranslate` + 每秒字幕历史增量 | 事件到达立即渲染；历史增量兜底新字幕；`TimeUpdate` 只判断是否仍在直播边缘 | WebSocket 正常时毫秒级；漏发时最多约 1 秒补上 |
| 直播时移 | 本次观看期间收到的字幕 + `getSubtitlesList()` 最近历史 | `TimeUpdate.currentTime` 落在哪句的时间区间就显示哪句 | 本次观看开始后的内容可精准回看；进入直播间之前的历史，SDK 公开字段不保证带绝对时间，只能对最近 10 句做近似定位 |
| 回放 / 点播 | `PlaybackTarget.subtitleList` 中的 SRT | SRT 解析一次，按 `start/end` 建时间轴，`TimeUpdate` 或播放器信息变化时二分查找 | 支持任意时长视频；拖动、暂停、倍速都以播放器时间为准 |

长视频不会在每个 `TimeUpdate` 里遍历整段字幕：字幕列表只在切换视频或字幕列表变化时加载、解析、排序一次，之后每次定位是 `O(log N)`。如果拖动到没有字幕的空档，会隐藏字幕而不是继续显示上一句。

直播时移的更大历史范围（例如观众刚进入直播间就拖回 40 分钟前）需要把字幕连同绝对时间持久化到本地服务；当前纯前端 MVP 不承诺这一段，演示时建议先播放一段时间再回看。

## 已知风险

- 词库中有较多单字/两字别名（如「胃」「肝」「肺」），中文没有天然词边界，可能出现短词误命中。建议后续按业务补充更长的标准词，或维护停用词表。
- 当前最多高亮 8 个术语/行；大词库下如果某句术语过密，会优先保留更长的匹配。
- 直播实时字幕事件没有绝对时间字段；当前通过 SDK 内部字幕历史接口做增量兜底。本工程合入时使用 `@polyv/live-watch-sdk` 2.19.0（类型声明中已有该接口；不可用时自动退回 `initSubtitleList` 与实时事件）。升级 SDK 时需要回归 `__getSubtitlesHistory` 是否仍然可用。
