const checkForAds = (() => {
  const AD_SELECTOR = '.ad-showing';
  const VIDEO_SELECTOR = 'video';
  const MUTE_MESSAGE_TYPE = 'MUTE_TAB';
  const UNMUTE_MESSAGE_TYPE = 'UNMUTE_TAB';
  const RELOAD_TAB_MESSAGE_TYPE = 'RELOAD_TAB';
  const RELOAD_DELAY_MS = 2000;

  let isMutedByExtension = false;

  let adStartTime: number | null = null;
  let reloadTimer: number | null = null;

  const clearReloadTimer = () => {
    if (reloadTimer !== null) {
      clearTimeout(reloadTimer);
      reloadTimer = null;
    }
  };

  return () => {
    const adShowing = document.querySelector(AD_SELECTOR);
    const videoElement = document.querySelector<HTMLVideoElement>(VIDEO_SELECTOR);

    if (adShowing && videoElement) {
      if (!isMutedByExtension) {
        chrome.runtime.sendMessage({ type: MUTE_MESSAGE_TYPE });
        isMutedByExtension = true;
      }

      if (adStartTime === null) {
        adStartTime = Date.now();

        reloadTimer = setTimeout(() => {
          chrome.runtime.sendMessage({ type: RELOAD_TAB_MESSAGE_TYPE });
          clearReloadTimer();
        }, RELOAD_DELAY_MS);
      }
    } else {
      if (isMutedByExtension) {
        chrome.runtime.sendMessage({ type: UNMUTE_MESSAGE_TYPE });
        isMutedByExtension = false;
      }

      if (adStartTime !== null) {
        adStartTime = null;
        clearReloadTimer();
      }
    }
  };
})();

const startObserving = () => {
  const playerNode = document.getElementById('movie_player');

  if (playerNode) {
    const observer = new MutationObserver(() => {
      checkForAds();
    });

    observer.observe(playerNode, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  } else {
    setTimeout(startObserving, 500);
  }
};

startObserving();
