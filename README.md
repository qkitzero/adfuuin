# Adfuuin

A Chrome extension that doesn't block ads, but minimizes stress — by automatically muting tabs when ads play on streaming platforms.

## How It Works

Adfuuin monitors supported streaming sites for ad playback using DOM observation and content scripts. When an ad is detected, the extension mutes the tab automatically and unmutes it when the ad ends. No ads are blocked, no content is modified — just silence during ads.

## Supported Services

| Service | Detection Method |
|---------|-----------------|
| **YouTube** | Detects `.ad-showing` class on the video player. Also tracks playback position and reloads to resume where you left off. |
| **Twitch** | Detects ad-related DOM elements (`video-ad-label`, `ad-countdown-container`, `.ad-showing`). |
| **Spotify** | Detects ad-related keywords in the document title (e.g. "Advertisement", "Audio Ad"). |

Each service can be individually enabled or disabled from the popup UI.

## Installation

1. Download the latest `adfuuin-vX.X.X.zip` from the [Releases](https://github.com/qkitzero/adfuuin/releases) page and extract it.
2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the extracted folder.

## Development

```sh
npm install
npm run dev
```

Other available scripts:

```sh
npm run lint       # Run ESLint
npm run lint:fix   # Auto-fix lint issues
npm run format     # Format code with Prettier
```

## Privacy

Adfuuin requests only two permissions:

- **tabs** — to mute/unmute and reload tabs when ads are detected.
- **storage** — to save your per-service toggle preferences locally.

The extension:

- Stores only boolean on/off settings per service in `chrome.storage.local`.
- Does **not** collect, transmit, or share any user data.
- Does **not** make any external network requests.
- Runs content scripts only on matching domains (`youtube.com`, `twitch.tv`, `open.spotify.com`).

## Contributing

Contributions are welcome! To get started:

1. Fork the repository and create a feature branch.
2. Run `npm install` to set up the development environment.
3. Make your changes and ensure they pass linting (`npm run lint`).
4. Submit a pull request.

Please keep PRs focused — the project enforces a limit of 15 files and 500 lines (in `src/`) per PR.

## License

This project is licensed under the [MIT License](LICENSE).
