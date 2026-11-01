import { createAdMuter } from './createAdMuter';
import { getTextExcluding, isVisible } from './dom';

const PLAYER_SELECTOR = '#dv-web-player, .dv-player-fullscreen';
const VIDEO_SELECTOR = 'video';
const AD_TIMER_SELECTOR = [
  '[class*="atvwebplayersdk-ad-timer"]',
  '.atvwebplayersdk-adtimeindicator-text',
].join(', ');
const EXCLUDED_SELECTOR = [
  '.atvwebplayersdk-go-ad-free-button',
  '.atvwebplayersdk-skipelement-button',
  '.atvwebplayersdk-ad-resume-message',
].join(', ');
const FALLBACK_EXCLUDED_SELECTOR = [
  EXCLUDED_SELECTOR,
  '.atvwebplayersdk-captions-overlay',
  'script',
  'style',
].join(', ');
const AD_TEXT_PATTERN = /(?:^|[^a-z])(?:ad|広告)\s*\d:[0-5]\d(?![:\d])/i;
const MAX_AD_TEXT_LENGTH = 20;

const findPlayer = () => document.querySelector(PLAYER_SELECTOR);

const hasAdTimer = (player: Element) =>
  Array.from(player.querySelectorAll(AD_TIMER_SELECTOR)).some(
    (element) =>
      !element.closest(EXCLUDED_SELECTOR) &&
      isVisible(element) &&
      getTextExcluding(element, EXCLUDED_SELECTOR).trim() !== '',
  );

const hasAdText = (player: Element) =>
  Array.from(player.querySelectorAll('*')).some((element) => {
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
    return (
      text.length <= MAX_AD_TEXT_LENGTH &&
      AD_TEXT_PATTERN.test(text) &&
      !element.closest(FALLBACK_EXCLUDED_SELECTOR) &&
      isVisible(element)
    );
  });

createAdMuter({
  serviceKey: 'primevideo',
  detectAd: () => {
    const player = findPlayer();
    if (!player?.querySelector(VIDEO_SELECTOR)) return false;
    return hasAdTimer(player) || hasAdText(player);
  },
  getObserveTarget: () => (findPlayer() ? document.body : null),
  observerOptions: {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  },
});
