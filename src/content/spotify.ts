import { createAdMuter } from './createAdMuter';

const AD_KEYWORDS = ['広告', 'Advertisement', 'Audio Ad'];

createAdMuter({
  serviceKey: 'spotify',
  detectAd: () => {
    return AD_KEYWORDS.some((keyword) => document.title.includes(keyword));
  },
  // Observe the whole <head> so a replaced <title> element is still detected.
  getObserveTarget: () => document.head,
  observerOptions: {
    childList: true,
    characterData: true,
    subtree: true,
  },
});
