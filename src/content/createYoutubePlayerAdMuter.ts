import { MESSAGE_TYPES, sendMessage } from '../shared/messages';
import type { ServiceKey } from '../shared/services';
import { createAdMuter } from './createAdMuter';

const AD_SELECTOR = '.ad-showing';
const VIDEO_SELECTOR = 'video';
const RELOAD_DELAY_MS = 7000;
const TIME_TRACKING_INTERVAL_MS = 1000;
const RELOAD_COOLDOWN_MS = 60000;
const LAST_RELOAD_AT_KEY = 'adfuuin:lastReloadAt';

const getLastReloadAt = () => {
  try {
    return Number(sessionStorage.getItem(LAST_RELOAD_AT_KEY)) || 0;
  } catch {
    return 0;
  }
};

const setLastReloadAt = (time: number) => {
  try {
    sessionStorage.setItem(LAST_RELOAD_AT_KEY, String(time));
    return true;
  } catch {
    return false;
  }
};

const isInReloadCooldown = () => {
  const elapsed = Date.now() - getLastReloadAt();
  return elapsed >= 0 && elapsed < RELOAD_COOLDOWN_MS;
};

interface YoutubePlayerAdMuterOptions {
  reloadOnAd?: boolean;
}

export const createYoutubePlayerAdMuter = (
  serviceKey: ServiceKey,
  { reloadOnAd = true }: YoutubePlayerAdMuterOptions = {},
) => {
  let reloadTimer: number | null = null;
  let lastKnownTime = 0;
  let timeTracker: number | null = null;
  let trackedVideo: HTMLVideoElement | null = null;

  const handleVideoLoadStart = () => {
    lastKnownTime = 0;
  };

  const startTimeTracking = () => {
    stopTimeTracking();
    timeTracker = window.setInterval(() => {
      if (document.querySelector(AD_SELECTOR)) return;
      const video = document.querySelector<HTMLVideoElement>(VIDEO_SELECTOR);
      if (video) {
        if (video !== trackedVideo) {
          trackedVideo?.removeEventListener('loadstart', handleVideoLoadStart);
          video.addEventListener('loadstart', handleVideoLoadStart);
          trackedVideo = video;
          lastKnownTime = 0;
        }
        lastKnownTime = Math.floor(video.currentTime);
      }
    }, TIME_TRACKING_INTERVAL_MS);
  };

  const stopTimeTracking = () => {
    if (timeTracker !== null) {
      window.clearInterval(timeTracker);
      timeTracker = null;
    }
  };

  const clearReloadTimer = () => {
    if (reloadTimer !== null) {
      window.clearTimeout(reloadTimer);
      reloadTimer = null;
    }
  };

  createAdMuter({
    serviceKey,
    detectAd: () => {
      return !!document.querySelector(AD_SELECTOR) && !!document.querySelector(VIDEO_SELECTOR);
    },
    getObserveTarget: () => document.getElementById('movie_player'),
    onAdStart: () => {
      if (!reloadOnAd || isInReloadCooldown()) return;

      const savedTime = lastKnownTime;
      const savedUrl = location.href;

      reloadTimer = window.setTimeout(() => {
        setLastReloadAt(Date.now());
        sendMessage({
          type: MESSAGE_TYPES.RELOAD_TAB,
          payload: { time: savedTime, url: savedUrl },
        });
        clearReloadTimer();
      }, RELOAD_DELAY_MS);
    },
    onAdEnd: () => {
      clearReloadTimer();
    },
    onEnabledChange: (enabled) => {
      if (enabled && reloadOnAd) {
        startTimeTracking();
      } else {
        stopTimeTracking();
        lastKnownTime = 0;
      }
    },
  });
};
