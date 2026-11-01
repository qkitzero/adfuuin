export interface ServiceDefinition {
  readonly key: string;
  readonly label: string;
  readonly experimental?: boolean;
}

export const SERVICES = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'youtubemusic', label: 'YouTube Music' },
  { key: 'twitch', label: 'Twitch' },
  { key: 'spotify', label: 'Spotify' },
  { key: 'netflix', label: 'Netflix', experimental: true },
  { key: 'primevideo', label: 'Prime Video', experimental: true },
] as const satisfies readonly ServiceDefinition[];

export type ServiceKey = (typeof SERVICES)[number]['key'];

export const isServiceKey = (value: unknown): value is ServiceKey =>
  SERVICES.some(({ key }) => key === value);

export const isExperimentalService = (serviceKey: ServiceKey) =>
  SERVICES.some(
    (service: ServiceDefinition) => service.key === serviceKey && service.experimental === true,
  );

export type ServiceSettings = Record<ServiceKey, boolean>;

export const DEFAULT_SERVICE_ENABLED = true;

export const DEFAULT_SETTINGS = Object.fromEntries(
  SERVICES.map(({ key }) => [key, DEFAULT_SERVICE_ENABLED]),
) as ServiceSettings;
