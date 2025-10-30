# Architecture Documentation

## Overview
Popcorn Boxd is a React Native mobile application built with Expo, following modern React patterns and mobile-first design principles.

## Tech Stack

### Core
- **React Native**: 0.81.5 - Cross-platform mobile framework
- **Expo SDK**: 54 - Development platform and tooling
- **TypeScript**: 5.9 - Static type checking
- **React**: 19.1.0 - UI library

### Navigation
- **Expo Router**: 6.0 - File-based routing system
- Built on React Navigation
- Supports stack, tabs, and drawer navigation
- Type-safe routing with TypeScript

### UI & Styling
- **React Native StyleSheet** - Component styling
- **Expo Symbols** - Icon system
- Custom themed components for dark/light mode support

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript**: Static type checking
- **Metro Bundler**: JavaScript bundler

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
- **Global State**: Context API (or Zustand if needed)
- **Server State**: React Query or SWR (when added)

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

### Manual Testing
- iOS Simulator
- Android Emulator
- Physical devices
- Expo Go app

### Automated Testing (future)
- Unit tests: Jest
- Component tests: React Native Testing Library
- E2E tests: Detox or Maestro

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

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
