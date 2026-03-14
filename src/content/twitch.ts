import { createAdMuter } from './createAdMuter';

const AD_SELECTORS = [
  '[data-a-target="video-ad-label"]',
  '[data-a-target="ad-countdown-container"]',
  '.ad-showing',
];
const VIDEO_SELECTOR = 'video';

createAdMuter({
  serviceKey: 'twitch',
  detectAd: () => {
    return (
      AD_SELECTORS.some((selector) => document.querySelector(selector)) &&
      !!document.querySelector(VIDEO_SELECTOR)
    );
  },
  getObserveTarget: () => document.body,
});
