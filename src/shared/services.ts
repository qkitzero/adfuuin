export const SERVICES = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'youtubemusic', label: 'YouTube Music' },
  { key: 'twitch', label: 'Twitch' },
  { key: 'spotify', label: 'Spotify' },
] as const;

export type ServiceKey = (typeof SERVICES)[number]['key'];

export type ServiceSettings = Record<ServiceKey, boolean>;

export const DEFAULT_SERVICE_ENABLED = true;

export const DEFAULT_SETTINGS = Object.fromEntries(
  SERVICES.map(({ key }) => [key, DEFAULT_SERVICE_ENABLED]),
) as ServiceSettings;
