import type { ServiceKey } from './services';

export const MESSAGE_TYPES = {
  MUTE_TAB: 'MUTE_TAB',
  UNMUTE_TAB: 'UNMUTE_TAB',
  RELOAD_TAB: 'RELOAD_TAB',
  RESET_STATS: 'RESET_STATS',
} as const;

export type Message =
  | { type: typeof MESSAGE_TYPES.MUTE_TAB; payload: { serviceKey: ServiceKey } }
  | { type: typeof MESSAGE_TYPES.UNMUTE_TAB }
  | { type: typeof MESSAGE_TYPES.RELOAD_TAB; payload: { time: number; url: string } }
  | { type: typeof MESSAGE_TYPES.RESET_STATS };

export const sendMessage = (message: Message) => {
  void chrome.runtime.sendMessage(message);
};
