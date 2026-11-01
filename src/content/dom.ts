export const isVisible = (element: Element) =>
  element.checkVisibility({ opacityProperty: true, visibilityProperty: true });

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
