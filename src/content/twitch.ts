import { createServiceToggle } from './serviceToggle';

const isEnabled = createServiceToggle('twitch');

const checkForAds = (() => {
  const AD_SELECTORS = [
    '[data-a-target="video-ad-label"]',
    '[data-a-target="ad-countdown-container"]',
    '.ad-showing',
  ];

  const VIDEO_SELECTOR = 'video';
  const MUTE_MESSAGE_TYPE = 'MUTE_TAB';
  const UNMUTE_MESSAGE_TYPE = 'UNMUTE_TAB';

  let isMutedByExtension = false;

  return () => {
    if (!isEnabled()) {
      if (isMutedByExtension) {
        chrome.runtime.sendMessage({ type: UNMUTE_MESSAGE_TYPE });
        isMutedByExtension = false;
      }
      return;
    }

    const adShowing = AD_SELECTORS.some((selector) => document.querySelector(selector));
    const videoElement = document.querySelector(VIDEO_SELECTOR);

    if (adShowing && videoElement) {
      if (!isMutedByExtension) {
        chrome.runtime.sendMessage({ type: MUTE_MESSAGE_TYPE });
        isMutedByExtension = true;
      }
    } else {
      if (isMutedByExtension) {
        chrome.runtime.sendMessage({ type: UNMUTE_MESSAGE_TYPE });
        isMutedByExtension = false;
      }
    }
  };
})();

const startObserving = () => {
  const targetNode = document.body;

  if (targetNode) {
    const observer = new MutationObserver(() => {
      checkForAds();
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  } else {
    setTimeout(startObserving, 500);
  }
};

startObserving();
