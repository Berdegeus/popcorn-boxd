# Popcorn Boxd 🍿

A React Native mobile application built with Expo. This project is designed to be AI-friendly for development with ChatGPT, Codex, and other AI assistants.

## 📋 Project Overview

**Tech Stack:**
- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9
- Expo Router (file-based routing)
- React 19.1.0

**Purpose:** AI-assisted mobile app development from scratch

## 🚀 Quick Start

### Prerequisites
- Node.js (LTS version recommended)
- npm or yarn
- Expo Go app (for testing on physical devices)
- Xcode (for iOS development on macOS)
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Development Commands

```bash
# Start with specific platform
npm run android    # Open on Android emulator/device
npm run ios        # Open on iOS simulator/device
npm run web        # Open in web browser

# Code quality
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking

# Reset to blank project
npm run reset-project
```

## 📁 Project Structure

```
popcorn-boxd/
├── app/                    # Main application code (Expo Router)
│   ├── (tabs)/            # Tab-based navigation screens
│   │   ├── _layout.tsx    # Tab navigator layout
│   │   ├── index.tsx      # Home screen
│   │   └── explore.tsx    # Explore screen
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Example modal screen
├── components/            # Reusable React components
│   ├── ui/               # UI-specific components
│   ├── themed-text.tsx   # Theme-aware Text component
│   └── themed-view.tsx   # Theme-aware View component
├── constants/            # App constants and configurations
│   └── theme.ts          # Theme colors and values
├── hooks/                # Custom React hooks
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── assets/               # Images, fonts, and other static files
│   └── images/          # Image assets
├── scripts/              # Build and utility scripts
├── docs/                 # Project documentation (AI context)
└── package.json          # Dependencies and scripts
```

## 🎨 Architecture & Patterns

### File-Based Routing
This project uses [Expo Router](https://docs.expo.dev/router/introduction/) for navigation:
- Files in `app/` directory automatically become routes
- `_layout.tsx` files define navigation structure
- `(tabs)` creates a tab navigator group
- Route parameters: `app/user/[id].tsx` → `/user/123`

### Component Structure
- **Themed Components**: Use `themed-text.tsx` and `themed-view.tsx` for automatic dark/light mode support
- **Custom Hooks**: Leverage `useColorScheme()` and `useThemeColor()` for theme consistency
- **UI Components**: Place reusable UI elements in `components/ui/`

### Styling
- Use StyleSheet.create() for performance
- Define theme colors in `constants/theme.ts`
- Support both light and dark modes

## 🤖 AI Development Guidelines

### When Building Features:
1. **Use TypeScript**: Always type props, state, and return values
2. **Follow Expo Router conventions**: Place screens in `app/` directory
3. **Use themed components**: Prefer ThemedText/ThemedView over raw Text/View
4. **Mobile-first**: Consider touch targets, gestures, and mobile UX patterns
5. **Cross-platform**: Test on both iOS and Android when possible

### Code Style:
- Functional components with hooks (no class components)
- Use arrow functions for component definitions
- Destructure props in function parameters
- Keep components small and focused (single responsibility)
- Use TypeScript interfaces for props

### Common Patterns:
```typescript
// Component template
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>{title}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

## 📦 Adding Dependencies

```bash
# Expo-compatible packages (preferred)
npx expo install package-name

# Regular npm packages
npm install package-name
```

**Note**: Always use `expo install` for Expo SDK packages to ensure version compatibility.

## 🧪 Testing

```bash
# Run in Expo Go (easiest)
npm start → scan QR code with Expo Go app

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android
```

## 🔧 Troubleshooting

```bash
# Clear cache and restart
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎯 Project Goals

This repository is optimized for AI-assisted development. Key objectives:
- Clear, documented project structure
- TypeScript for better AI code completion
- Consistent patterns and conventions
- Comprehensive inline documentation
- Easy onboarding for AI coding assistants
