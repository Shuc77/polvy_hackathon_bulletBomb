import type { RuntimeMode } from './types';

const query = new URLSearchParams(window.location.search);

export const appConfig = {
  appId: query.get('appId') || import.meta.env.VITE_POLYV_APP_ID || 'hmpc5skuwx',
  channelId: query.get('channelId') || import.meta.env.VITE_POLYV_CHANNEL_ID || '',
  targetSessionId:
    query.get('targetSessionId') ||
    query.get('sessionId') ||
    import.meta.env.VITE_POLYV_TARGET_SESSION_ID ||
    '',
};

const requestedMode = query.get('mode');
export const runtimeMode: RuntimeMode =
  requestedMode === 'demo'
    ? 'demo'
    : requestedMode === 'live' || Boolean(appConfig.channelId)
      ? 'live'
      : 'demo';

export const seedDemoData =
  query.get('seed') === 'demo' || query.get('mode') === 'demo';

export const initialSessionId =
  appConfig.targetSessionId || (runtimeMode === 'demo' ? 'demo-ai-growth-20261023' : '');

export const aiEndpoint =
  query.get('apiUrl') || import.meta.env.VITE_AI_API_URL || '/api/chat';

export function getPolyvWatchUrl(): string {
  if (!appConfig.channelId) return '';
  const base = `https://live.polyv.cn/watch/${encodeURIComponent(appConfig.channelId)}`;
  return appConfig.targetSessionId
    ? `${base}/${encodeURIComponent(appConfig.targetSessionId)}`
    : base;
}
