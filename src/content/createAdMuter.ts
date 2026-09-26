import { MESSAGE_TYPES, sendMessage } from '../shared/messages';
import type { ServiceKey } from '../shared/services';
import { createServiceToggle } from './serviceToggle';

interface AdMuterConfig {
  serviceKey: ServiceKey;
  detectAd: () => boolean;
  getObserveTarget: () => Node | null;
  observerOptions?: MutationObserverInit;
  onAdStart?: () => void;
  onAdEnd?: () => void;
  onEnabledChange?: (enabled: boolean) => void;
}

const THROTTLE_DELAY_MS = 100;
const PAGESHOW_CHECK_DELAY_MS = 500;

export const createAdMuter = (config: AdMuterConfig) => {
  const isEnabled = createServiceToggle(config.serviceKey, (enabled) => {
    config.onEnabledChange?.(enabled);
    scheduleCheck();
  });

  let isMutedByExtension = false;
  let throttleTimer: number | null = null;
  let hasPendingCheck = false;

  const mute = () => {
    if (isMutedByExtension) return;
    sendMessage({ type: MESSAGE_TYPES.MUTE_TAB });
    isMutedByExtension = true;
    config.onAdStart?.();
  };

  const unmute = () => {
    if (!isMutedByExtension) return;
    sendMessage({ type: MESSAGE_TYPES.UNMUTE_TAB });
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

  const scheduleCheck = () => {
    if (throttleTimer !== null) {
      hasPendingCheck = true;
      return;
    }

    checkForAds();

    throttleTimer = window.setTimeout(() => {
      throttleTimer = null;
      if (hasPendingCheck) {
        hasPendingCheck = false;
        scheduleCheck();
      }
    }, THROTTLE_DELAY_MS);
  };

  const observeTarget = (targetNode: Node) => {
    const observer = new MutationObserver(scheduleCheck);

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
    const targetWaiter = new MutationObserver(() => {
      const node = config.getObserveTarget();
      if (node) {
        targetWaiter.disconnect();
        observeTarget(node);
      }
    });

    targetWaiter.observe(document.documentElement, { childList: true, subtree: true });
  }

  window.addEventListener('pagehide', unmute);

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      setTimeout(checkForAds, PAGESHOW_CHECK_DELAY_MS);
    }
  });
};
