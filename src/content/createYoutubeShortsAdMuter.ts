import { createAdMuter } from './createAdMuter';
import { onMediaStateChange } from './dom';
import { isYoutubeShortsPage, YOUTUBE_NAVIGATE_FINISH_EVENT } from './youtubeShortsPage';

const SHORTS_CONTAINER_SELECTOR = 'ytd-shorts';
const REEL_WRAPPER_SELECTOR = '.reel-video-in-sequence-new, .reel-video-in-sequence';
const REEL_SELECTOR = `${REEL_WRAPPER_SELECTOR}, ytd-reel-video-renderer`;
const ACTIVE_REEL_SELECTOR = [
  'ytd-reel-video-renderer[is-active]',
  '.reel-video-in-sequence-new[is-active]',
  '.reel-video-in-sequence[is-active]',
].join(', ');
const AD_SLOT_SELECTOR = 'ytd-ad-slot-renderer';
const SHORTS_PLAYER_AD_SELECTOR = '#shorts-player.ad-showing';
const VIDEO_SELECTOR = 'video';

const findShortsContainer = () => document.querySelector(SHORTS_CONTAINER_SELECTOR);

const toReelRoot = (element: Element) => element.closest(REEL_WRAPPER_SELECTOR) ?? element;

const findActiveReels = (container: Element) => {
  const activeReels = Array.from(container.querySelectorAll(ACTIVE_REEL_SELECTOR));
  if (activeReels.length > 0) return activeReels.map(toReelRoot);

  return Array.from(container.querySelectorAll<HTMLVideoElement>(VIDEO_SELECTOR))
    .filter((video) => !video.paused && !video.ended)
    .map((video) => video.closest(REEL_SELECTOR))
    .filter((reel): reel is Element => reel !== null)
    .map(toReelRoot);
};

const isAdReel = (reel: Element) =>
  reel.closest(AD_SLOT_SELECTOR) !== null || reel.querySelector(AD_SLOT_SELECTOR) !== null;

const startShortsAdMuter = () => {
  const { recheck } = createAdMuter({
    serviceKey: 'youtubeshorts',
    detectAd: () => {
      if (!isYoutubeShortsPage()) return false;
      const container = findShortsContainer();
      if (!container) return false;
      if (container.querySelector(SHORTS_PLAYER_AD_SELECTOR)) return true;
      return findActiveReels(container).some(isAdReel);
    },
    getObserveTarget: findShortsContainer,
    observerOptions: {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'is-active'],
    },
  });

  onMediaStateChange(recheck);
  return recheck;
};

export const createYoutubeShortsAdMuter = () => {
  let recheck: (() => void) | null = null;

  const handleNavigation = () => {
    if (recheck) {
      recheck();
    } else if (isYoutubeShortsPage()) {
      recheck = startShortsAdMuter();
    }
  };

  handleNavigation();
  document.addEventListener(YOUTUBE_NAVIGATE_FINISH_EVENT, handleNavigation);
};
