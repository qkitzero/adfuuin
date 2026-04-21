import { MESSAGE_TYPES } from '../shared/messages';
import { createAdMuter } from './createAdMuter';

const AD_SELECTOR = '.ad-showing';
const VIDEO_SELECTOR = 'video';
const RELOAD_DELAY_MS = 7000;
const TIME_TRACKING_INTERVAL_MS = 1000;

let reloadTimer: number | null = null;
let lastKnownTime = 0;
let timeTracker: number | null = null;
let trackedVideo: HTMLVideoElement | null = null;

const handleVideoLoadStart = () => {
  lastKnownTime = 0;
};

const startTimeTracking = () => {
  stopTimeTracking();
  timeTracker = setInterval(() => {
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
    clearInterval(timeTracker);
    timeTracker = null;
  }
};

const clearReloadTimer = () => {
  if (reloadTimer !== null) {
    clearTimeout(reloadTimer);
    reloadTimer = null;
  }
};

createAdMuter({
  serviceKey: 'youtube',
  detectAd: () => {
    return !!document.querySelector(AD_SELECTOR) && !!document.querySelector(VIDEO_SELECTOR);
  },
  getObserveTarget: () => document.getElementById('movie_player'),
  onAdStart: () => {
    const savedTime = lastKnownTime;

    reloadTimer = setTimeout(() => {
      void chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.RELOAD_TAB,
        payload: { time: savedTime },
      });
      clearReloadTimer();
    }, RELOAD_DELAY_MS);
  },
  onAdEnd: () => {
    clearReloadTimer();
  },
});

startTimeTracking();
