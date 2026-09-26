export const MESSAGE_TYPES = {
  MUTE_TAB: 'MUTE_TAB',
  UNMUTE_TAB: 'UNMUTE_TAB',
  RELOAD_TAB: 'RELOAD_TAB',
} as const;

export type Message =
  | { type: typeof MESSAGE_TYPES.MUTE_TAB }
  | { type: typeof MESSAGE_TYPES.UNMUTE_TAB }
  | { type: typeof MESSAGE_TYPES.RELOAD_TAB; payload: { time: number } };

export const sendMessage = (message: Message) => {
  void chrome.runtime.sendMessage(message);
};
