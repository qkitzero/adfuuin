import { useEffect, useState } from 'react';
import {
  DEFAULT_SERVICE_ENABLED,
  DEFAULT_SETTINGS,
  isExperimentalService,
  SERVICES,
  type ServiceKey,
  type ServiceSettings,
} from '../shared/services';
import {
  EMPTY_STATS,
  formatAdCount,
  formatDuration,
  normalizeStats,
  STATS_STORAGE_KEY,
  summarizeStats,
  type Stats,
  type StatsPeriod,
} from '../shared/stats';
import { StatsSummary } from './StatsSummary';

export const Popup = () => {
  const [settings, setSettings] = useState<ServiceSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [period, setPeriod] = useState<StatsPeriod>('week');

  useEffect(() => {
    chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
      setSettings(result as ServiceSettings);
    });

    chrome.storage.local.get(STATS_STORAGE_KEY, (result) => {
      setStats(normalizeStats(result[STATS_STORAGE_KEY]));
    });

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName !== 'local') return;
      if (STATS_STORAGE_KEY in changes) {
        setStats(normalizeStats(changes[STATS_STORAGE_KEY].newValue));
      }
      if (!SERVICES.some(({ key }) => key in changes)) return;
      setSettings((prev) => {
        const next = { ...prev };
        for (const { key } of SERVICES) {
          if (key in changes) {
            next[key] = (changes[key].newValue as boolean | undefined) ?? DEFAULT_SERVICE_ENABLED;
          }
        }
        return next;
      });
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const handleToggle = (key: ServiceKey) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    void chrome.storage.local.set({ [key]: newValue });
  };

  const periodStats = summarizeStats(stats, period, new Date());

  return (
    <div className="w-80 p-5 bg-white space-y-4">
      <h1 className="text-xl font-bold text-gray-800 tracking-tight">Adfuuin</h1>

      <StatsSummary stats={periodStats} period={period} onPeriodChange={setPeriod} />

      <ul className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        {SERVICES.map(({ key, label }) => (
          <li key={key} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`w-2 h-2 shrink-0 rounded-full transition-colors duration-300 ${
                  settings[key]
                    ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]'
                    : 'bg-gray-300'
                }`}
              />
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`whitespace-nowrap text-sm font-medium transition-colors duration-300 ${
                      settings[key] ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                  {isExperimentalService(key) && (
                    <span
                      title="Ad detection for this service has not been confirmed by users yet"
                      className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700"
                    >
                      Experimental
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 tabular-nums">
                  {formatDuration(periodStats[key]?.ms ?? 0)} ·{' '}
                  {formatAdCount(periodStats[key]?.count ?? 0)}
                </span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings[key]}
              onClick={() => handleToggle(key)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-all duration-300 ease-in-out ${
                settings[key]
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                  : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                  settings[key] ? 'translate-x-6 scale-110' : 'translate-x-1 scale-100'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
