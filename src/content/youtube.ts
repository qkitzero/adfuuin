import { MESSAGE_TYPES } from '../shared/messages';
import { createAdMuter } from './createAdMuter';

const AD_SELECTOR = '.ad-showing';
const VIDEO_SELECTOR = 'video';
const RELOAD_DELAY_MS = 1000;

let reloadTimer: number | null = null;

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
    const videoElement = document.querySelector<HTMLVideoElement>(VIDEO_SELECTOR);
    if (!videoElement) return;

    reloadTimer = setTimeout(() => {
      void chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.RELOAD_TAB,
        payload: { time: Math.floor(videoElement.currentTime) },
      });
      clearReloadTimer();
    }, RELOAD_DELAY_MS);
  },
  onAdEnd: () => {
    clearReloadTimer();
  },
});
