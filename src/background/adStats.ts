import { isServiceKey, type ServiceKey } from '../shared/services';
import { normalizeStats, recordAd, STATS_STORAGE_KEY } from '../shared/stats';

const ACTIVE_ADS_KEY = 'activeAds';

interface ActiveAd {
  serviceKey: ServiceKey;
  startedAt: number;
}

type ActiveAds = Record<string, ActiveAd>;

let queue: Promise<void> = Promise.resolve();

const enqueue = (task: () => Promise<void>) => {
  const result = queue.then(task);
  queue = result.catch(() => {});
  return result;
};

const getActiveAds = async () => {
  const result = await chrome.storage.session.get(ACTIVE_ADS_KEY);
  return (result[ACTIVE_ADS_KEY] as ActiveAds | undefined) ?? {};
};

const addToStats = async (serviceKey: ServiceKey, durationMs: number) => {
  const result = await chrome.storage.local.get(STATS_STORAGE_KEY);
  const stats = normalizeStats(result[STATS_STORAGE_KEY]);
  const next = recordAd(stats, serviceKey, durationMs, new Date());
  if (next === stats) return;
  await chrome.storage.local.set({ [STATS_STORAGE_KEY]: next });
};

export const startAd = (tabId: number, serviceKey: unknown) =>
  enqueue(async () => {
    if (!isServiceKey(serviceKey)) return;
    const activeAds = await getActiveAds();
    if (activeAds[tabId]) return;
    activeAds[tabId] = { serviceKey, startedAt: Date.now() };
    await chrome.storage.session.set({ [ACTIVE_ADS_KEY]: activeAds });
  });

export const finishAd = (tabId: number) =>
  enqueue(async () => {
    const activeAds = await getActiveAds();
    const activeAd = activeAds[tabId];
    if (!activeAd) return;
    delete activeAds[tabId];
    await chrome.storage.session.set({ [ACTIVE_ADS_KEY]: activeAds });
    await addToStats(activeAd.serviceKey, Date.now() - activeAd.startedAt);
  });

export const resetStats = () => enqueue(() => chrome.storage.local.remove(STATS_STORAGE_KEY));
