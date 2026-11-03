const SHORTS_PATH_PATTERN = /^\/shorts(?:\/|$)/;

export const YOUTUBE_NAVIGATE_FINISH_EVENT = 'yt-navigate-finish';

export const isYoutubeShortsPage = () => SHORTS_PATH_PATTERN.test(location.pathname);
