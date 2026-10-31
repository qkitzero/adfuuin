import { logger } from '../shared/logger';
import { MESSAGE_TYPES, type Message } from '../shared/messages';
import { finishAd, resetStats, startAd } from './adStats';

const tabQueues = new Map<number, Promise<void>>();

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

const muteTab = async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId);
  if (isMutedByThisExtension(tab.mutedInfo)) return true;
  if (tab.mutedInfo?.muted) return false;
  await chrome.tabs.update(tabId, { muted: true });
  return true;
};

const unmuteTab = async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId);
  if (!isMutedByThisExtension(tab.mutedInfo)) return;
  await chrome.tabs.update(tabId, { muted: false });
};

const buildResumeUrl = (pageUrl: string, senderUrl: string | undefined, time: number) => {
  if (!senderUrl || time <= 0) return null;
  try {
    const url = new URL(pageUrl);
    if (url.origin !== new URL(senderUrl).origin) return null;
    url.searchParams.set('t', String(time));
    return url.toString();
  } catch {
    return null;
  }
};

const logStatsError = (err: unknown) => {
  logger.error('Failed to update ad stats:', err);
};

const startAdSafely = (tabId: number, serviceKey: unknown) =>
  startAd(tabId, serviceKey).catch(logStatsError);

const finishAdSafely = (tabId: number) => finishAd(tabId).catch(logStatsError);

chrome.tabs.onRemoved.addListener((tabId) => {
  void enqueue(tabId, () => finishAdSafely(tabId));
});

chrome.tabs.onReplaced.addListener((_addedTabId, removedTabId) => {
  void enqueue(removedTabId, () => finishAdSafely(removedTabId));
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.mutedInfo && !isMutedByThisExtension(changeInfo.mutedInfo)) {
    void enqueue(tabId, () => finishAdSafely(tabId));
  }
});

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: unknown) => void,
  ) => {
    if (message.type === MESSAGE_TYPES.RESET_STATS) {
      if (sender.url?.startsWith(chrome.runtime.getURL(''))) {
        resetStats().catch(logStatsError);
      }
      return;
    }

    if (!sender.tab || sender.tab.id === undefined) {
      return;
    }

    const tabId = sender.tab.id;

    switch (message.type) {
      case MESSAGE_TYPES.MUTE_TAB:
        enqueue(tabId, async () => {
          if (await muteTab(tabId)) {
            await startAdSafely(tabId, message.payload.serviceKey);
          }
        }).catch((err) => {
          logger.error('Failed to mute tab:', err);
        });
        break;
      case MESSAGE_TYPES.UNMUTE_TAB:
        enqueue(tabId, async () => {
          await finishAdSafely(tabId);
          await unmuteTab(tabId);
        }).catch((err) => {
          logger.error('Failed to unmute tab:', err);
        });
        break;
      case MESSAGE_TYPES.RELOAD_TAB:
        enqueue(tabId, async () => {
          await finishAdSafely(tabId);
          const tab = await chrome.tabs.get(tabId);
          const { time, url } = message.payload;
          const shouldUnmute = isMutedByThisExtension(tab.mutedInfo);
          const resumeUrl = buildResumeUrl(url, sender.url, time);
          if (resumeUrl) {
            await chrome.tabs.update(tabId, {
              url: resumeUrl,
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
