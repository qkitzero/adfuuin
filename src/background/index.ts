import { logger } from '../shared/logger';
import { MESSAGE_TYPES } from '../shared/messages';

const tabQueues = new Map<number, Promise<void>>();

// Tasks read the tab's mute state before updating it, so run them one at a time per tab
// to keep a quick mute/unmute sequence from acting on a stale state.
const enqueue = (tabId: number, task: () => Promise<void>) => {
  const result = (tabQueues.get(tabId) ?? Promise.resolve()).then(task);
  const settled = result.catch(() => {});
  tabQueues.set(tabId, settled);
  void settled.then(() => {
    if (tabQueues.get(tabId) === settled) {
      tabQueues.delete(tabId);
    }
  });
  return result;
};

const isMutedByThisExtension = (mutedInfo?: chrome.tabs.MutedInfo) =>
  mutedInfo?.muted === true &&
  mutedInfo.reason === 'extension' &&
  mutedInfo.extensionId === chrome.runtime.id;

// Leave tabs the user has already muted as they are.
const muteTab = async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId);
  if (tab.mutedInfo?.muted) return;
  await chrome.tabs.update(tabId, { muted: true });
};

// Only unmute if this extension muted the tab, so a mute set by the user is kept.
const unmuteTab = async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId);
  if (!isMutedByThisExtension(tab.mutedInfo)) return;
  await chrome.tabs.update(tabId, { muted: false });
};

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
        enqueue(tabId, () => muteTab(tabId)).catch((err) => {
          logger.error('Failed to mute tab:', err);
        });
        break;
      case MESSAGE_TYPES.UNMUTE_TAB:
        enqueue(tabId, () => unmuteTab(tabId)).catch((err) => {
          logger.error('Failed to unmute tab:', err);
        });
        break;
      case MESSAGE_TYPES.RELOAD_TAB:
        enqueue(tabId, async () => {
          const tab = await chrome.tabs.get(tabId);
          const time = (message.payload as { time?: number })?.time;
          // Keep the tab muted if the user muted it, not this extension.
          const shouldUnmute = isMutedByThisExtension(tab.mutedInfo);
          // sender.url is available without the "tabs" permission, unlike tab.url.
          if (sender.url && time !== undefined && time > 0) {
            const url = new URL(sender.url);
            url.searchParams.set('t', String(time));
            await chrome.tabs.update(tabId, {
              url: url.toString(),
              ...(shouldUnmute && { muted: false }),
            });
          } else {
            if (shouldUnmute) {
              await chrome.tabs.update(tabId, { muted: false });
            }
            await chrome.tabs.reload(tabId);
          }
        }).catch((err) => {
          logger.error('Failed to reload tab:', err);
        });
        break;
    }
  },
);
