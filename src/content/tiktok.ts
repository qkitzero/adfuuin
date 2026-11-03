import { createAdMuter } from './createAdMuter';
import { onMediaStateChange } from './dom';

const FEED_ITEM_SELECTOR = '[data-e2e="feed-video"]';
const PLAYER_WRAPPER_SELECTOR = '[id^="xgwrapper-"]';
const CINEMA_OVERLAY_SELECTOR = '[data-e2e="anchoring-chrome-host"]';
const OVERLAY_ITEM_ID_ATTRIBUTE = 'data-more-menu-item-id';
const AD_SELECTOR = ['[data-e2e="ad-tag"]', '[data-e2e="ttam-ads-cta"]'].join(', ');
const VIDEO_SELECTOR = 'video';

const getVisibleArea = (element: Element) => {
  const rect = element.getBoundingClientRect();
  const width = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
  const height = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return width > 0 && height > 0 ? width * height : 0;
};

const findPlayingVideo = () => {
  let best: HTMLVideoElement | null = null;
  let bestArea = 0;
  for (const video of document.querySelectorAll<HTMLVideoElement>(VIDEO_SELECTOR)) {
    if (video.paused || video.ended) continue;
    const area = getVisibleArea(video);
    if (area > bestArea) {
      best = video;
      bestArea = area;
    }
  }
  return best;
};

const getItemId = (video: HTMLVideoElement) => {
  const wrapper = video.closest(PLAYER_WRAPPER_SELECTOR);
  return wrapper ? wrapper.id.split('-').at(-1) : undefined;
};

const findItemScope = (video: HTMLVideoElement) => {
  const item = video.closest(FEED_ITEM_SELECTOR);
  if (!item) return null;
  return item.closest('article') ?? item;
};

const isCinemaOverlayForItem = (overlay: Element, itemId: string | undefined) => {
  if (!itemId) return false;
  const owners = [
    overlay,
    ...Array.from(overlay.querySelectorAll(`[${OVERLAY_ITEM_ID_ATTRIBUTE}]`)),
  ];
  return owners.some((owner) => owner.getAttribute(OVERLAY_ITEM_ID_ATTRIBUTE) === itemId);
};

const { recheck } = createAdMuter({
  serviceKey: 'tiktok',
  detectAd: () => {
    const video = findPlayingVideo();
    if (!video) return false;
    if (findItemScope(video)?.querySelector(AD_SELECTOR)) return true;
    const itemId = getItemId(video);
    return Array.from(document.querySelectorAll(CINEMA_OVERLAY_SELECTOR)).some(
      (overlay) => isCinemaOverlayForItem(overlay, itemId) && overlay.querySelector(AD_SELECTOR),
    );
  },
  getObserveTarget: () => document.body,
  observerOptions: {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-e2e', OVERLAY_ITEM_ID_ATTRIBUTE],
  },
});

onMediaStateChange(recheck);
