const originalAddEventListener = window.addEventListener.bind(window);

window.addEventListener = ((
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) => {
  if (type === 'beforeunload') return;
  originalAddEventListener(type, listener, options);
}) as typeof window.addEventListener;

Object.defineProperty(window, 'onbeforeunload', {
  configurable: true,
  get: () => null,
  set: () => {},
});
