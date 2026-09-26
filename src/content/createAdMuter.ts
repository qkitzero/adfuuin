import { MESSAGE_TYPES } from '../shared/messages';
import { createServiceToggle } from './serviceToggle';

interface AdMuterConfig {
  serviceKey: string;
  detectAd: () => boolean;
  getObserveTarget: () => Node | null;
  observerOptions?: MutationObserverInit;
  onAdStart?: () => void;
  onAdEnd?: () => void;
}

const DEBOUNCE_DELAY_MS = 100;
const PAGESHOW_CHECK_DELAY_MS = 500;

export const createAdMuter = (config: AdMuterConfig) => {
  const isEnabled = createServiceToggle(config.serviceKey);

  let isMutedByExtension = false;
  let debounceActive = false;

  const mute = () => {
    if (isMutedByExtension) return;
    void chrome.runtime.sendMessage({ type: MESSAGE_TYPES.MUTE_TAB });
    isMutedByExtension = true;
    config.onAdStart?.();
  };

  const unmute = () => {
    if (!isMutedByExtension) return;
    void chrome.runtime.sendMessage({ type: MESSAGE_TYPES.UNMUTE_TAB });
    isMutedByExtension = false;
    config.onAdEnd?.();
  };

  const checkForAds = () => {
    if (isEnabled() && config.detectAd()) {
      mute();
    } else {
      unmute();
    }
  };

  const observeTarget = (targetNode: Node) => {
    const observer = new MutationObserver(() => {
      if (debounceActive) return;
      debounceActive = true;
      checkForAds();
      setTimeout(() => {
        debounceActive = false;
      }, DEBOUNCE_DELAY_MS);
    });

    observer.observe(
      targetNode,
      config.observerOptions ?? {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      },
    );
  };

  const targetNode = config.getObserveTarget();

  if (targetNode) {
    observeTarget(targetNode);
  } else {
    // SPA pages (e.g. YouTube) may render the target long after the content script runs,
    // so wait for it instead of giving up after a fixed number of retries.
    const targetWaiter = new MutationObserver(() => {
      const node = config.getObserveTarget();
      if (node) {
        targetWaiter.disconnect();
        observeTarget(node);
      }
    });

    targetWaiter.observe(document.documentElement, { childList: true, subtree: true });
  }

  // The muted state is lost when the page unloads, so unmute before leaving to avoid
  // keeping the tab muted on the next page.
  window.addEventListener('pagehide', unmute);

  // Restored from the back/forward cache: the tab was unmuted on pagehide, so check again.
  // Delay the check so the unmute sent by the previous page is handled first.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      setTimeout(checkForAds, PAGESHOW_CHECK_DELAY_MS);
    }
  });
};
