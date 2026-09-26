import { useEffect, useState } from 'react';
import {
  DEFAULT_SERVICE_ENABLED,
  DEFAULT_SETTINGS,
  SERVICES,
  type ServiceKey,
  type ServiceSettings,
} from '../shared/services';

export const Popup = () => {
  const [settings, setSettings] = useState<ServiceSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
      setSettings(result as ServiceSettings);
    });

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName !== 'local') return;
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

  return (
    <div className="p-6 min-w-64 bg-white space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Adfuuin</h1>

      <ul className="space-y-2">
        {SERVICES.map(({ key, label }) => (
          <li key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  settings[key]
                    ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]'
                    : 'bg-gray-300'
                }`}
              />
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  settings[key] ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
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
