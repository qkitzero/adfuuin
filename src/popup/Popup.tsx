import { useEffect, useState } from 'react';

type ServiceKey = 'youtube' | 'twitch' | 'spotify';

const SERVICES: { key: ServiceKey; label: string }[] = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'twitch', label: 'Twitch' },
  { key: 'spotify', label: 'Spotify' },
];

const DEFAULT_SETTINGS: Record<ServiceKey, boolean> = {
  youtube: true,
  twitch: true,
  spotify: true,
};

export const Popup = () => {
  const [settings, setSettings] = useState<Record<ServiceKey, boolean>>(DEFAULT_SETTINGS);

  useEffect(() => {
    chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
      setSettings(result as Record<ServiceKey, boolean>);
    });
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
