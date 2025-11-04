# Styling System

The project now relies on a centralized design system. This document describes the
core pieces you should use when building new UI or migrating existing screens.

## Theme + Tokens

- Theme definition lives in `constants/theme.ts` and exposes:
  - `colors`: semantic palette covering backgrounds, surfaces, text, status tones, borders, etc.
  - `spacing`, `radii`, `durations`, and `typography`: shared design tokens.
  - `components`: preset sizes for high-usage primitives such as buttons and text fields.
- `themes.light` and `themes.dark` provide the full token set per color mode.

## Provider + Hooks

- `DesignSystemProvider` (configured in `app/_layout.tsx`) keeps the active theme in
  context and syncs with the system color scheme by default.
- `useAppTheme()` returns the full `Theme` object so you can read tokens directly.
- `makeStyles((theme) => ({ ... }))` produces a themed `useStyles` hook that wraps
  `StyleSheet.create` and memoizes automatically.
- `useThemeColor(overrides, colorName)` remains available for simple overrides when
  you only need a single color token.

## Component Patterns

- Base primitives (`ThemedText`, `ThemedView`, `Button`, `TextField`, `FormMessage`)
  have been updated to consume the design system and should be preferred whenever
  possible.
- Screens should avoid inline `StyleSheet.create` declarations that hardcode values.
  Instead, define `const useStyles = makeStyles(...)` at the bottom of the file and
  call `const styles = useStyles()` inside the component.
- When you need ad-hoc colors (e.g., translucent backgrounds), pick the closest tone
  from the palette and apply opacity rather than introducing new hex codes.

## Migration Checklist

1. Replace static `StyleSheet.create` usage with `makeStyles` and tokens where feasible.
2. Remove direct imports from `constants/theme` unless you need the entire token map;
   prefer the hooks above to respect dynamic theme switching.
3. Use `ThemedView/ThemedText` wrappers before introducing raw `View/Text` so colors
   respond to theme changes consistently.
4. Keep spacing and typography consistent by leaning on `theme.spacing.*` and
   `theme.typography.*` entries. Avoid magic numbers unless there is no reasonable token.

## Next Steps

- Audit the remaining components/screens for hardcoded values and migrate them using
  the same pattern gradually.
- Consider extracting frequently reused layout patterns (e.g., cards, list items)
  into dedicated shared components once more screens are migrated.
- If future requirements include user-controlled theming, expose `setColorScheme`
  (available on `DesignSystemContext`) through UI controls or settings.
