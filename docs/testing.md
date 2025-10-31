# Testing Guide

This document consolidates the automated and manual steps required to verify the app's accessibility and core user flows.

## Automated checks

Run these commands before every release candidate to catch regressions early:

- `npm run lint:check` – validates code quality with ESLint.
- `npm run typecheck` – ensures the TypeScript types are still valid.
- `npm test` – executes the Jest suite for utility helpers.

## Manual accessibility checklist

Complete this checklist on both Android (TalkBack) and iOS (VoiceOver) simulators/emulators. Mark each item once it has been verified in the latest build.

- [x] **Screen reader labels** – All interactive elements announce a descriptive label; custom components expose `accessibilityLabel` or `accessibilityRole` as needed.
- [x] **Focus order** – Using only the screen reader's swipe gestures, focus moves logically through the onboarding, library, and playback screens without skipping actionable items.
- [x] **Keyboard navigation** – Hardware keyboard (or simulator tab navigation) can reach every focusable control, including bottom tabs and floating actions.
- [x] **Hit target size** – Buttons and touchable components meet the 44×44 pt (iOS) / 48×48 dp (Android) minimum target area.
- [x] **Dynamic content announcements** – Status messages (e.g., saving favorites, loading states) provide announcements via `accessibilityLiveRegion` or `aria-live` equivalents.
- [x] **Color and contrast** – Text and icons maintain a contrast ratio of at least 4.5:1 against the background.

## Screen reader test procedure

1. Launch the latest development build on the target simulator.
2. Enable TalkBack (Android) or VoiceOver (iOS).
3. Navigate through the primary flow:
   - Authentication or onboarding
   - Browsing the catalog and opening a title detail
   - Starting playback and interacting with playback controls
4. Confirm every control exposes an accessible label, announces its state, and supports double-tap activation.
5. Toggle between screens using the tab navigator and ensure focus lands on a meaningful element after each transition.
6. Disable the screen reader once complete and document any issues discovered.

## Core flow smoke test

Perform the following steps after major changes or before shipping:

1. `npm run start` to launch the Expo development server.
2. Open the app in the desired simulator.
3. Sign in or progress through onboarding.
4. Browse the catalog, open a movie/series detail page, and add it to favorites.
5. Start playback, interact with pause/play and seek controls, and verify captions/subtitles (if available).
6. Return to the home screen and confirm recently played content is listed correctly.

Record test results in the release notes or issue tracker, referencing this document for traceability.
