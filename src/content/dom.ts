export const isVisible = (element: Element) =>
  element.checkVisibility({ opacityProperty: true, visibilityProperty: true });

const MEDIA_STATE_EVENTS = ['playing', 'pause', 'ended'];

export const onMediaStateChange = (callback: () => void) => {
  MEDIA_STATE_EVENTS.forEach((type) => document.addEventListener(type, callback, true));
};

export const getTextExcluding = (root: Node, excludedSelector: string) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest(excludedSelector)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });

  let text = '';
  while (walker.nextNode()) {
    text += walker.currentNode.nodeValue ?? '';
  }
  return text;
};
