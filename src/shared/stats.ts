import { SERVICES, type ServiceKey } from './services';

export const STATS_STORAGE_KEY = 'stats';

const MIN_AD_DURATION_MS = 1000;
const MAX_AD_DURATION_MS = 10 * 60 * 1000;
const RETENTION_DAYS = 90;
const WEEK_DAYS = 7;

export interface ServiceStat {
  ms: number;
  count: number;
}

export type ServiceStats = Partial<Record<ServiceKey, ServiceStat>>;

export interface Stats {
  daily: Record<string, ServiceStats>;
  total: ServiceStats;
}

export const STATS_PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: '7 days' },
  { key: 'all', label: 'All time' },
] as const;

export type StatsPeriod = (typeof STATS_PERIODS)[number]['key'];

export const EMPTY_STATS: Stats = { daily: {}, total: {} };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const normalizeServiceStats = (value: unknown) => {
  const result: ServiceStats = {};
  if (!isRecord(value)) return result;
  for (const { key } of SERVICES) {
    const stat = value[key];
    if (isRecord(stat) && isFiniteNumber(stat.ms) && isFiniteNumber(stat.count)) {
      result[key] = { ms: stat.ms, count: stat.count };
    }
  }
  return result;
};

export const normalizeStats = (value: unknown): Stats => {
  if (!isRecord(value)) return EMPTY_STATS;
  const daily = isRecord(value.daily)
    ? Object.fromEntries(
        Object.entries(value.daily).map(([day, dayStats]) => [
          day,
          normalizeServiceStats(dayStats),
        ]),
      )
    : {};
  return { daily, total: normalizeServiceStats(value.total) };
};

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const daysAgoKey = (now: Date, days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return toDateKey(date);
};

const addStat = (stats: ServiceStats, key: ServiceKey, ms: number, count: number) => {
  const current = stats[key] ?? { ms: 0, count: 0 };
  return { ...stats, [key]: { ms: current.ms + ms, count: current.count + count } };
};

export const recordAd = (
  stats: Stats,
  serviceKey: ServiceKey,
  durationMs: number,
  now: Date,
): Stats => {
  if (!(durationMs >= MIN_AD_DURATION_MS)) return stats;

  const ms = Math.min(Math.round(durationMs), MAX_AD_DURATION_MS);
  const today = toDateKey(now);
  const cutoff = daysAgoKey(now, RETENTION_DAYS - 1);
  const daily = Object.fromEntries(Object.entries(stats.daily).filter(([day]) => day >= cutoff));
  daily[today] = addStat(daily[today] ?? {}, serviceKey, ms, 1);

  return { daily, total: addStat(stats.total, serviceKey, ms, 1) };
};

export const summarizeStats = (stats: Stats, period: StatsPeriod, now: Date): ServiceStats => {
  if (period === 'all') return stats.total;

  const from = daysAgoKey(now, period === 'today' ? 0 : WEEK_DAYS - 1);

  return Object.entries(stats.daily)
    .filter(([day]) => day >= from)
    .reduce<ServiceStats>(
      (acc, [, dayStats]) =>
        SERVICES.reduce((sum, { key }) => {
          const stat = dayStats[key];
          return stat ? addStat(sum, key, stat.ms, stat.count) : sum;
        }, acc),
      {},
    );
};

export const sumStats = (stats: ServiceStats): ServiceStat =>
  SERVICES.reduce(
    (sum, { key }) => ({
      ms: sum.ms + (stats[key]?.ms ?? 0),
      count: sum.count + (stats[key]?.count ?? 0),
    }),
    { ms: 0, count: 0 },
  );

export const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const formatAdCount = (count: number) => `${count} ${count === 1 ? 'ad' : 'ads'}`;
