import { DEFAULT_SERVICE_ENABLED, type ServiceKey } from '../shared/services';

export const createServiceToggle = (
  serviceKey: ServiceKey,
  onChange?: (enabled: boolean) => void,
) => {
  // Treat the service as disabled until the stored setting is loaded, so a disabled service is
  // never muted during startup. onChange is called once the real value is known.
  let enabled = false;

  chrome.storage.local.get(serviceKey, (result: { [key: string]: boolean | undefined }) => {
    enabled = result[serviceKey] ?? DEFAULT_SERVICE_ENABLED;
    onChange?.(enabled);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !(serviceKey in changes)) return;
    enabled = (changes[serviceKey].newValue as boolean | undefined) ?? DEFAULT_SERVICE_ENABLED;
    onChange?.(enabled);
  });

  return () => enabled;
};
