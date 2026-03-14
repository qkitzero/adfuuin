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
      case 'MUTE_TAB':
        chrome.tabs.update(tabId, { muted: true }).catch((err) => {
          console.error('Failed to mute tab:', err);
        });
        break;
      case 'UNMUTE_TAB':
        chrome.tabs.update(tabId, { muted: false }).catch((err) => {
          console.error('Failed to unmute tab:', err);
        });
        break;
      case 'RELOAD_TAB':
        chrome.tabs.reload(tabId).catch((err) => {
          console.error('Failed to reload tab:', err);
        });
        break;
    }
  },
);
