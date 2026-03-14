export const createServiceToggle = (serviceKey: string) => {
  let enabled = true;

  chrome.storage.local.get(serviceKey, (result: { [key: string]: boolean }) => {
    enabled = result[serviceKey] ?? true;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[serviceKey]) {
      enabled = changes[serviceKey].newValue as boolean;
    }
  });

  return () => enabled;
};
