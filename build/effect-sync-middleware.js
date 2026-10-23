/**
 * @file 多设备时间轴同步端点（仅开发服务器）
 * @desc 局域网演示时，观看页由同一个 `webpack-dev-server` 提供。它没有业务后端，
 *   所以这里用内存记一份「按频道 + 视频分组」的编排，让同一场直播/回放的
 *   多台设备看到同一套时间轴：
 *
 *   - `PUT /__effect-sync?key=...` 发布一份配置（base64 文本）
 *   - `GET /__effect-sync?key=...` 读取最新配置与版本号
 *
 *   版本号由服务端自增，客户端据此判断「有没有别人改过」。
 *   生产静态部署没有这个端点，客户端探测失败后会退回分享链接。
 *
 *   ★ 这是开发工具，不是业务后端：没有鉴权、只存内存、服务重启即清空。
 *   仅用于局域网演示，不要暴露到公网。
 */

const fs = require('fs');
const path = require('path');

/** 单个配置的最大体积。导出的 base64 通常只有几 KB，1 MB 足够兜底 */
const MAX_BODY_BYTES = 1024 * 1024;

/** 最多记多少个 key。演示场景下频道 + 视频不会太多，超出按写入顺序淘汰 */
const MAX_KEYS = 50;

/** key 的最大长度，避免异常请求占满内存 */
const MAX_KEY_LENGTH = 200;

/** 本次开发服务器进程的标识。客户端据此区分「服务重启」与「迟到的旧响应」 */
const SERVER_EPOCH = Date.now();

/**
 * 落盘位置
 * @desc 开发服务器重启（改 webpack 配置、Ctrl+C 重开）后配置还在，
 *   演示时不用让作者重新打开工作台发布一次。目录已在 .gitignore 里。
 */
const STATE_FILE = path.resolve(__dirname, '../.tmp-build/effect-sync-state.json');

/** @type {Map<string, { version: number, payload: string, updatedAt: number }>} */
const store = new Map();

function loadState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

    if (!parsed || typeof parsed !== 'object') {
      return;
    }

    Object.keys(parsed).forEach(key => {
      const item = parsed[key];

      if (
        !item ||
        typeof item.version !== 'number' ||
        typeof item.payload !== 'string' ||
        item.payload.length > MAX_BODY_BYTES
      ) {
        return;
      }

      store.set(key.slice(0, MAX_KEY_LENGTH), {
        version: item.version,
        payload: item.payload,
        updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : 0,
      });
    });
  } catch {
    // 没有存档或文件损坏都从空开始
  }
}

function saveState() {
  try {
    const data = {};

    store.forEach((item, key) => {
      data[key] = item;
    });

    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(data));
  } catch {
    // 写不进去不影响当前会话，内存里那份仍然有效
  }
}

loadState();

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function keyOf(reqUrl) {
  const key = reqUrl.searchParams.get('key') || '';

  return key.slice(0, MAX_KEY_LENGTH);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', chunk => {
      size += chunk.length;

      if (size > MAX_BODY_BYTES) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * 创建中间件
 * @returns {(req: import('http').IncomingMessage, res: import('http').ServerResponse, next: () => void) => void}
 */
function createEffectSyncMiddleware() {
  return function effectSyncMiddleware(req, res, next) {
    const reqUrl = new URL(req.url || '/', 'http://localhost');

    if (reqUrl.pathname !== '/__effect-sync') {
      next();
      return;
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const key = keyOf(reqUrl);

    if (!key) {
      sendJson(res, 400, { error: 'missing key' });
      return;
    }

    if (req.method === 'GET') {
      const item = store.get(key);

      sendJson(res, 200, {
        version: item?.version || 0,
        payload: item?.payload || null,
        updatedAt: item?.updatedAt || 0,
        epoch: SERVER_EPOCH,
      });
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      readBody(req)
        .then(body => {
          let payload;

          try {
            payload = JSON.parse(body);
          } catch {
            sendJson(res, 400, { error: 'invalid json' });
            return;
          }

          if (!payload || typeof payload.payload !== 'string') {
            sendJson(res, 400, { error: 'payload must be a string' });
            return;
          }

          const previous = store.get(key);
          const version = (previous?.version || 0) + 1;

          // 先删再写，把这个 key 挪到 Map 的末尾；否则它可能是最早的一条，
          // 在下面的淘汰里刚更新完就被删掉
          store.delete(key);
          store.set(key, {
            version,
            payload: payload.payload,
            updatedAt: Date.now(),
          });

          // Map 按插入顺序迭代；配置数量很少，直接淘汰最早的一条
          if (store.size > MAX_KEYS) {
            const oldestKey = store.keys().next().value;
            store.delete(oldestKey);
          }

          saveState();
          sendJson(res, 200, { version, epoch: SERVER_EPOCH });
        })
        .catch(error => {
          if (!res.headersSent) {
            sendJson(res, 413, { error: error.message || 'bad request' });
          }
        });
      return;
    }

    sendJson(res, 405, { error: 'method not allowed' });
  };
}

module.exports = createEffectSyncMiddleware;

/**
 * 也可以脱离 webpack 单独跑（例如用 nginx 把 /__effect-sync 反代过来）：
 *
 *   node build/effect-sync-middleware.js
 *
 * 端口默认 15022，可用 `EFFECT_SYNC_PORT` 覆盖。
 */
if (require.main === module) {
  const http = require('http');
  const port = Number(process.env.EFFECT_SYNC_PORT) || 15022;
  const middleware = createEffectSyncMiddleware();

  http
    .createServer((req, res) =>
      middleware(req, res, () => sendJson(res, 404, { error: 'not found' })),
    )
    .listen(port, '0.0.0.0', () => {
      // eslint-disable-next-line no-console
      console.info(`[effect-sync] listening on http://0.0.0.0:${port}/__effect-sync`);
    });
}
