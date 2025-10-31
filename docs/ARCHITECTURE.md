# Architecture Documentation

## Overview
Popcorn Boxd is a React Native mobile application bootstrapped with Expo. The app embraces declarative UI through React components, Expo-managed native tooling, and TypeScript-first development practices. Core data flows rely on React Context for lightweight shared state, while persistent preferences are stored with AsyncStorage. Navigation is orchestrated via Expo Router (React Navigation under the hood) to keep routing colocated with the `app/` directory structure.

## Technology Stack & Rationale

### Core Runtime
- **Expo SDK 54 + React Native 0.81.5** – Provides a managed workflow for shipping iOS, Android, and Web builds with a unified project configuration. Expo ensures consistent native module support and simplifies OTA updates.
- **React 19.1.0** – Declarative view layer with concurrent features for responsive UI rendering.
- **TypeScript 5.9** – Enforces type safety across screens, hooks, and utilities, enabling reliable refactors as the feature set grows.

### Navigation & State
- **Expo Router 6.0 / React Navigation** – File-based routing keeps navigation logic colocated with screens. Stack + tab navigators mirror the folder hierarchy and provide instant deep linking support while leveraging the mature React Navigation ecosystem for transitions and gestures.
- **React Context API** – Provides lightweight global state for cross-cutting concerns such as theme, session, and feature flags without introducing external dependencies prematurely. Future service integrations can layer on dedicated providers without refactoring the existing tree.
- **AsyncStorage** – Persists user preferences and cached session metadata locally, ensuring a seamless offline experience and support for restoring UI state on relaunch. Keys are namespaced per feature to simplify eventual migrations to SecureStore for sensitive payloads.

### UI, Styling, and Accessibility
- **React Native StyleSheet** – Generates optimized styles during runtime, keeping UI performant on mobile devices.
- **Expo Symbols** – Supplies platform-consistent iconography with vector support out of the box.
- **Themed Components (`ThemedText`, `ThemedView`)** – Centralize light/dark palette usage defined in `constants/theme.ts` so accessibility updates propagate from a single source of truth.

### Tooling & Quality
- **ESLint** – Enforces lint rules to maintain consistent code style.
- **Metro Bundler** – Handles bundling, HMR, and asset management for React Native builds.
- **Jest + React Native Testing Library (planned)** – Provide unit and component test coverage as features mature.

## Functional Requirements Mapping

| ID    | Requirement | Primary Screen/Component |
|-------|-------------|--------------------------|
| **RF01** | Present a personalized hero experience with call-to-action content on launch. | `app/(tabs)/index.tsx` (HomeScreen) leveraging `ParallaxScrollView` and `HelloWave`. |
| **RF02** | Offer persistent bottom-tab navigation between core sections. | `app/(tabs)/_layout.tsx` configuring the Expo Router tab navigator. |
| **RF03** | Surface exploration content and developer resources in an interactive list. | `app/(tabs)/explore.tsx` with `Collapsible` accordions and themed text. |
| **RF04** | Provide deep links to external resources that open in system browser. | `components/external-link.tsx` used within `app/(tabs)/explore.tsx`. |
| **RF05** | Ensure UI honors light/dark themes consistently across views. | `components/themed-text.tsx`, `components/themed-view.tsx`, and theme tokens in `constants/theme.ts`. |
| **RF06** | Expose contextual quick actions via modal presentation. | `app/modal.tsx` wired through Expo Router stack navigation. |
| **RF07** | Maintain accessible, reusable layout primitives for future feature cards and lists. | `components/ui/collapsible.tsx`, `components/ui/icon-symbol.tsx`, shared styling utilities. |

Each requirement is validated through manual QA scenarios and will be backed by automated tests (unit/UI) as functionality evolves. Accessibility heuristics (color contrast, focus order) are verified alongside the functional scenarios for every release.

## Project Structure

```
popcorn-boxd/
├── app/                      # Application routes (Expo Router)
│   ├── (tabs)/              # Tab navigation group
│   │   ├── _layout.tsx     # Tab navigator configuration
│   │   ├── index.tsx       # Home screen
│   │   └── explore.tsx     # Explore screen
│   ├── _layout.tsx         # Root layout (navigation container)
│   └── modal.tsx           # Example modal screen
│
├── components/              # Reusable React components
│   ├── ui/                 # Low-level UI components
│   │   ├── collapsible.tsx
│   │   └── icon-symbol.tsx
│   ├── themed-text.tsx     # Theme-aware Text wrapper
│   ├── themed-view.tsx     # Theme-aware View wrapper
│   ├── hello-wave.tsx      # Feature components
│   ├── parallax-scroll-view.tsx
│   └── external-link.tsx
│
├── constants/              # Configuration and constants
│   └── theme.ts           # Color schemes and theme values
│
├── hooks/                  # Custom React hooks
│   ├── use-color-scheme.ts     # Device color scheme detection
│   ├── use-color-scheme.web.ts # Web-specific implementation
│   └── use-theme-color.ts      # Theme color selector
│
├── assets/                 # Static assets
│   └── images/            # Images, icons, splash screens
│
├── scripts/               # Build and utility scripts
│   └── reset-project.js  # Project reset script
│
└── docs/                  # Documentation
    └── ARCHITECTURE.md   # This file
```

## Key Architectural Decisions

### 1. File-Based Routing (Expo Router)

**Why**: Simplifies navigation management, reduces boilerplate, improves type safety.

**How it works**:
- Files in `app/` directory automatically become routes
- File name determines the route path
- `_layout.tsx` files configure navigation structure
- Dynamic routes use `[param]` syntax

```
app/
├── index.tsx              → /
├── about.tsx              → /about
├── user/[id].tsx          → /user/:id
└── (tabs)/                → Route group (doesn't affect URL)
    ├── _layout.tsx        → Tab navigator
    └── home.tsx           → /home (within tabs)
```

### 2. Themed Components

**Why**: Consistent dark/light mode support across the app.

**Components**:
- `ThemedView`: Container with theme-aware background
- `ThemedText`: Text with theme-aware colors and typography

**Usage**:
```typescript
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export function MyComponent() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Hello</ThemedText>
    </ThemedView>
  );
}
```

### 3. TypeScript Throughout

**Why**: Better developer experience, fewer runtime errors, improved AI assistance.

**Practices**:
- All files use `.tsx` or `.ts` extensions
- Props interfaces for all components
- Strict type checking enabled
- Path aliases configured (`@/` for root)

### 4. Component Organization

**Principles**:
- **Screens**: In `app/` directory (Expo Router convention)
- **Reusable components**: In `components/`
- **UI primitives**: In `components/ui/`
- **Business logic**: Extract to hooks or utilities

### 5. Styling Strategy

**Approach**:
- Use `StyleSheet.create()` for performance
- Theme colors defined in `constants/theme.ts`
- Support both light and dark modes
- Consistent spacing using 4px/8px grid

**Example**:
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

## Navigation Flow

```
Root Layout (_layout.tsx)
└── Tab Navigator ((tabs)/_layout.tsx)
    ├── Home (index.tsx)
    └── Explore (explore.tsx)
```

### Navigation Types

1. **Stack Navigation**: Default for all routes
2. **Tab Navigation**: Bottom tabs via `(tabs)` group
3. **Modal Navigation**: Push/present modals

## Data Flow

### State Management
- **Local State**: `useState`, `useReducer`
- **Global State**: Context API modules that wrap providers around `_layout.tsx` to expose app-wide settings, session data, and theme overrides.
- **Persistent State**: AsyncStorage helpers for caching lightweight entities such as onboarding flags or recently viewed content.
- **Server State**: React Query or SWR (when remote APIs are introduced).

### Props Flow
```
Screen (app/*)
  ↓ props
Feature Component (components/*)
  ↓ props
UI Component (components/ui/*)
```

## Theme System

### Color Scheme
Defined in `constants/theme.ts`:
- Light mode colors
- Dark mode colors
- Semantic color names

### Usage
```typescript
import { useThemeColor } from '@/hooks/use-theme-color';

export function MyComponent() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Use colors
}
```

## Performance Considerations

### Optimization Strategies
1. **StyleSheet.create()**: Pre-computes styles
2. **React.memo()**: Prevent unnecessary re-renders
3. **useMemo/useCallback**: Memoize expensive computations
4. **FlatList**: Virtualized lists for long content
5. **Image optimization**: Use Expo Image component

### Bundle Size
- Tree shaking enabled
- No unused dependencies
- Lazy loading for large components (when needed)

## Platform Differences

### iOS vs Android
- Handle platform-specific UI patterns
- Test on both platforms
- Use Platform API when needed
- Consider safe area insets (iOS)

### Web Support
- Expo Router supports web out of the box
- Platform-specific files: `.ios.tsx`, `.android.tsx`, `.web.tsx`
- Web-specific hooks (e.g., `use-color-scheme.web.ts`)

## Error Handling

### Strategy
1. **Component Level**: Error boundaries for crashes
2. **Network Level**: Handle API errors gracefully
3. **User Feedback**: Show clear error messages
4. **Logging**: Console logs in development, analytics in production

## Testing Strategy

### Accessibility & Manual Testing
- **TalkBack / VoiceOver auditing** on each release candidate to validate focus order, role announcements, and actionable feedback.
- **Touch target sizing** adheres to a minimum of 44x44pt (Apple HIG) / 48x48dp (Material) for interactive elements. Shared button and list item components enforce these constraints via `minHeight` and `minWidth` styles.
- **Color contrast** validated against WCAG AA; themed palettes in `constants/theme.ts` document contrast ratios.
- **Dynamic Type / Font Scaling** verified by testing with large text settings and ensuring `allowFontScaling` remains true for ThemedText derivatives unless documented otherwise.

### Automated Testing (current & planned)
- Snapshot/unit tests with Jest for UI primitives and utility hooks.
- Component interaction tests with React Native Testing Library to validate accessibility roles and async flows.
- E2E smoke suites (Detox or Maestro) post-MVP to automate navigation and accessibility sanity checks.

## Build & Deployment

### Development
```bash
npm start           # Start Metro bundler
npm run ios         # Run on iOS
npm run android     # Run on Android
npm run web         # Run on web
```

### Production
```bash
eas build --platform all     # Build for iOS and Android
eas submit                   # Submit to app stores
```

## Future Considerations

### Potential Additions
- **State Management**: Zustand or Redux Toolkit
- **API Client**: Axios with React Query
- **Authentication**: Expo AuthSession
- **Storage**: Expo SecureStore / AsyncStorage
- **Analytics**: Expo Analytics or Firebase
- **Crash Reporting**: Sentry or Bugsnag
- **Testing**: Jest + React Native Testing Library
- **CI/CD**: GitHub Actions + EAS Build

### Scalability
- Folder structure supports growth
- Can add feature-based organization
- Can split into modules/packages if needed
- TypeScript enables safe refactoring

### Roadmap & External Integrations
- **Auth Backend (Firebase Auth / Supabase Auth)**: Introduce secure email/password and social login flows. Authentication context providers will wrap `_layout.tsx`, and token persistence will leverage AsyncStorage + SecureStore.
- **Cloud Data (Firestore / Supabase Postgres)**: Replace static sample data with dynamic catalog content, enabling favorites and watchlists synchronized across devices. Data hooks will adopt React Query for caching and optimistic updates.
- **Remote Config & Feature Flags**: Use Firebase Remote Config or Supabase Edge Functions to toggle experimental features without redeploying the client.
- **Analytics & Crash Reporting**: Extend telemetry through Firebase Analytics or Supabase log drains, combined with Sentry for error capture.
- **CI/CD Enhancements**: Automate build/test pipelines via GitHub Actions, running Jest, lint, and Detox suites before triggering EAS Build promotions.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
