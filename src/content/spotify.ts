import { createServiceToggle } from './serviceToggle';

const isEnabled = createServiceToggle('spotify');

const checkForAds = (() => {
  const AD_KEYWORDS = ['広告', 'Advertisement', 'Audio Ad', 'Spotify'];

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

    const pageTitle = document.title;

    const adShowing = AD_KEYWORDS.some((keyword) => pageTitle.includes(keyword));

    if (adShowing) {
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
      characterData: true,
    });
  } else {
    setTimeout(startObserving, 500);
  }
};

startObserving();
