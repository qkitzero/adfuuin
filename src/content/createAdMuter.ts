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

const MAX_RETRY_COUNT = 20;

export const createAdMuter = (config: AdMuterConfig) => {
  const isEnabled = createServiceToggle(config.serviceKey);

  let isMutedByExtension = false;

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

  const startObserving = (retryCount = 0) => {
    const targetNode = config.getObserveTarget();

    if (targetNode) {
      const observer = new MutationObserver(() => {
        checkForAds();
      });

      observer.observe(
        targetNode,
        config.observerOptions ?? {
          childList: true,
          subtree: true,
          attributes: true,
        },
      );
    } else if (retryCount < MAX_RETRY_COUNT) {
      setTimeout(() => startObserving(retryCount + 1), 500);
    }
  };

  startObserving();
};
