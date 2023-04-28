import { docEvents } from './doc';
import { playerEvents } from './player';
import { globalEvents } from './global';
import { chatEvents } from './chat';
import { donateEvents } from './donate';
import { interactionEvents } from './interaction';
import { inviteEvents } from './invite';
import { microActivityEvents } from './microActivity';
import { financeEvents } from './finance';
import { connectMicEvents } from './connectMic';
import { portraitEvents } from './portrait';
import { withdrawEvents } from './withdraw';

const modules = {
  doc: docEvents,
  player: playerEvents,
  global: globalEvents,
  chat: chatEvents,
  donate: donateEvents,
  interaction: interactionEvents,
  invite: inviteEvents,
  withdraw: withdrawEvents,
  portrait: portraitEvents,
  microActivity: microActivityEvents,
  finance: financeEvents,
  connectMic: connectMicEvents,
};

type EventModules = typeof modules;

/**
 * 给模块事件加上模块名限定，如 chat 模块 { ALTER_MSG: 'ALTER_MSG' } -> { ALTER_MSG: 'chat.ALTER_MSG' }
 */
function addModuleName(moduleName: string, events: UniversalParams<string>) {
  const moduleEvent: UniversalParams<string> = {};
  Object.keys(events).forEach(event => {
    moduleEvent[event] = `${moduleName}.${events[event]}`;
  });
  return moduleEvent;
}

const newModules: UniversalParams<UniversalParams<string>> = {};
Object.keys(modules).forEach(moduleName => {
  const modName = moduleName as keyof EventModules;
  newModules[modName] = addModuleName(modName, modules[modName]);
});

export default newModules as EventModules;
