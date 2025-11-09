# Repository Guidelines

## Project Structure & Module Organization
- Library source lives in `src/` (TypeScript hooks, Zustand store, platform bridges). Unit tests sit in `src/__tests__/`.
- Native shims reside in `ios/` and `android/`. Keep edits in sync with the public TypeScript API.
- Built artifacts are generated into `lib/` via Bob; never edit files there directly.
- The `example/` workspace is a React Native app used for manual QA. Docs and specs are in `docs/` plus `spec-*.md`.

## Build, Test, and Development Commands
- `yarn prepare` runs `bob build` to emit CommonJS, ESM, and type bundles into `lib/`.
- `yarn test` executes Jest in JSDOM. Use `yarn test --watch` for focused runs.
- `yarn lint` lints all JS/TS files with the React Native ESLint config; `yarn typecheck` runs `tsc --noEmit`.
- `yarn check` chains lint, types, prepare, and test. Run locally before raising a PR.
- `yarn example start|ios|android` boots the showcase app from the workspace root.

## Coding Style & Naming Conventions
- Follow the configured ESLint (`@react-native/eslint-config`) and Prettier (tab width 2, semicolons enabled) rules; run `yarn lint --fix && yarn prettier . --write` if needed.
- Use PascalCase for React components, camelCase for hooks/utilities (e.g., `useAudioQueue`), and SCREAMING_SNAKE_CASE for environment constants.
- Keep platform-specific files suffixed with `.ios.ts`, `.android.ts`, or `.native.tsx` where platform divergence is required.

## Testing Guidelines
- Write Jest specs beside source or under `src/__tests__` with filenames ending in `.test.ts[x]`.
- Prefer React Testing Library or plain Jest mocks; avoid snapshot churn unless documenting UI regressions.
- Target meaningful coverage for audio state reducers and native bridge adapters; add regression tests for reported issues before fixing.

## Commit & Pull Request Guidelines
- Commit messages should follow Conventional Commits (enforced via Commitlint and Lefthook). Scope by surface area, e.g., `feat(player): support bookmarking`.
- Keep commits focused; include failing/ignored tests only with a linked follow-up.
- PRs target `main`, reference the Linear ticket in the title (`ENG-123 short summary`), and describe problem, solution, verification (`yarn check`, platform QA), plus any screenshots for UI-facing changes.

## Automation & Release Tips
- Lefthook runs ESLint and TypeScript pre-commit; fix staged files or skip with `SKIP=lint git commit` only in emergencies.
- Releases go through `yarn release` (release-it) after `yarn check`. Follow the generated changelog prompts and verify the example app builds on both platforms first.
