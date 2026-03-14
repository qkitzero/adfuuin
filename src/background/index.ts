import { MESSAGE_TYPES } from '../shared/messages';

chrome.runtime.onMessage.addListener(
  (
    message: { type: string; payload?: unknown },
    sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: unknown) => void,
  ) => {
    if (!sender.tab || sender.tab.id === undefined) {
      return;
    }

    const tabId = sender.tab.id;

    switch (message.type) {
      case MESSAGE_TYPES.MUTE_TAB:
        chrome.tabs.update(tabId, { muted: true }).catch((err) => {
          console.error('Failed to mute tab:', err);
        });
        break;
      case MESSAGE_TYPES.UNMUTE_TAB:
        chrome.tabs.update(tabId, { muted: false }).catch((err) => {
          console.error('Failed to unmute tab:', err);
        });
        break;
      case MESSAGE_TYPES.RELOAD_TAB:
        chrome.tabs
          .get(tabId)
          .then(async (tab) => {
            if (!tab.url) {
              await chrome.tabs.reload(tabId);
              return;
            }
            const url = new URL(tab.url);
            const time = (message.payload as { time?: number })?.time;
            if (time !== undefined && time > 0) {
              url.searchParams.set('t', String(time));
            }
            await chrome.tabs.update(tabId, { url: url.toString() });
          })
          .catch((err) => {
            console.error('Failed to reload tab:', err);
          });
        break;
    }
  },
);
