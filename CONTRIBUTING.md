# Contributing to Adfuuin

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v24 (see `.nvmrc`)
- npm

### Getting Started

```sh
git clone https://github.com/qkitzero/adfuuin.git
cd adfuuin
npm install
npm run dev
```

### Available Scripts

| Script           | Description                  |
|------------------|------------------------------|
| `npm run dev`    | Start development server     |
| `npm run build`  | Build for production         |
| `npm run lint`   | Run ESLint                   |
| `npm run lint:fix` | Auto-fix lint issues       |
| `npm run format` | Format code with Prettier    |

### Loading the Extension Locally

1. Run `npm run build` to generate the build output.
2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the generated `dist` folder.

## Branch Naming

Create branches from `main` using the following format:

```
feature/<issue-number>
```

Example: `feature/64`

## Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Use one of the following prefixes:

| Prefix       | Description                        |
|--------------|------------------------------------|
| `feat:`      | New feature                        |
| `fix:`       | Bug fix                            |
| `docs:`      | Documentation changes              |
| `refactor:`  | Code restructuring (no behavior change) |
| `build:`     | Build system or dependency updates |
| `chore:`     | Maintenance tasks                  |

Include the issue/PR number in the commit message:

```
feat: add mute support for new platform (#70)
```

## Pull Request Process

1. **Fork** the repository and create a feature branch (`feature/<issue-number>`).
2. Make your changes and verify they pass linting:
   ```sh
   npm run lint
   npm run format
   ```
3. Commit your changes following the commit conventions above.
4. **Push** your branch and open a pull request against `main`.
5. Fill in the PR description with a summary of your changes.

### PR Size Limits

To keep reviews manageable, the project enforces the following limits per PR:

- **15 files** maximum
- **500 lines** maximum in `src/`
- **100 lines** maximum outside `src/`

`package-lock.json` is excluded from these limits.

## Code Style

- **Formatter**: Prettier (config in `.prettierrc`)
- **Linter**: ESLint with TypeScript support (config in `eslint.config.mjs`)

Both are enforced automatically. Run `npm run format` and `npm run lint:fix` before committing to avoid issues.
