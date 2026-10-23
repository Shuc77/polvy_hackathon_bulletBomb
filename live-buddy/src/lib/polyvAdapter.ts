import { appConfig, getPolyvWatchUrl, runtimeMode } from '../config';

/**
 * Real watch-page integration stays isolated from the pet UI.
 * The host page can call this bridge directly, or dispatch matching CustomEvents.
 */
export const polyvAdapter = {
  appId: appConfig.appId,
  channelId: appConfig.channelId,
  targetSessionId: appConfig.targetSessionId,
  mode: runtimeMode,
  watchUrl: getPolyvWatchUrl(),
  hasRealChannel: Boolean(appConfig.channelId),
};

export const LIVE_BUDDY_EVENTS = {
  term: 'live-buddy:term',
  question: 'live-buddy:question',
  context: 'live-buddy:context',
  session: 'live-buddy:session',
  mode: 'live-buddy:mode',
  open: 'live-buddy:open',
  close: 'live-buddy:close',
} as const;
