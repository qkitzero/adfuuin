const originalAddEventListener = window.addEventListener.bind(window);

window.addEventListener = ((...args: Parameters<typeof window.addEventListener>) => {
  if (args[0] === 'beforeunload') return;
  originalAddEventListener(...args);
}) as typeof window.addEventListener;

Object.defineProperty(window, 'onbeforeunload', {
  configurable: true,
  get: () => null,
  set: () => {},
});
