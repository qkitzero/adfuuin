import { createAdMuter } from './createAdMuter';
import { isVisible } from './dom';

const AD_CONTAINER_SELECTOR = '[data-uia="ads-info-container"]';
const AD_TIME_SELECTOR = '[data-uia="ads-info-time"]';
const PAUSE_AD_SELECTOR = '[data-uia^="pause-ad"]';
const VIDEO_SELECTOR = 'video';
const DIGIT_PATTERN = /\d/;

const isPauseAd = (element: Element) => element.closest(PAUSE_AD_SELECTOR) !== null;

const findAdElements = (selector: string) =>
  Array.from(document.querySelectorAll(selector)).filter((element) => !isPauseAd(element));

createAdMuter({
  serviceKey: 'netflix',
  detectAd: () => {
    if (!document.querySelector(VIDEO_SELECTOR)) return false;
    return (
      findAdElements(AD_CONTAINER_SELECTOR).some(isVisible) ||
      findAdElements(AD_TIME_SELECTOR).some(
        (element) => DIGIT_PATTERN.test(element.textContent ?? '') && isVisible(element),
      )
    );
  },
  getObserveTarget: () => document.body,
  observerOptions: {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  },
});
