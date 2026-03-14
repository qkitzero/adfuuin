import { createAdMuter } from './createAdMuter';

const AD_KEYWORDS = ['広告', 'Advertisement', 'Audio Ad', 'Spotify'];

createAdMuter({
  serviceKey: 'spotify',
  detectAd: () => {
    return AD_KEYWORDS.some((keyword) => document.title.includes(keyword));
  },
  getObserveTarget: () => document.body,
});
