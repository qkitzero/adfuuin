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

export const createAdMuter = (config: AdMuterConfig) => {
  const isEnabled = createServiceToggle(config.serviceKey);

  let isMutedByExtension = false;
  let debounceActive = false;

  const checkForAds = () => {
    if (!isEnabled()) {
      if (isMutedByExtension) {
        void chrome.runtime.sendMessage({ type: MESSAGE_TYPES.UNMUTE_TAB });
        isMutedByExtension = false;
        config.onAdEnd?.();
      }
      return;
    }

    const adShowing = config.detectAd();

    if (adShowing) {
      if (!isMutedByExtension) {
        void chrome.runtime.sendMessage({ type: MESSAGE_TYPES.MUTE_TAB });
        isMutedByExtension = true;
        config.onAdStart?.();
      }
    } else {
      if (isMutedByExtension) {
        void chrome.runtime.sendMessage({ type: MESSAGE_TYPES.UNMUTE_TAB });
        isMutedByExtension = false;
        config.onAdEnd?.();
      }
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
};
