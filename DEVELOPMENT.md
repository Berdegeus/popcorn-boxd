# Development Guide

## 🛠️ Setup Instructions

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd popcorn-boxd

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Setup

1. **Install Expo CLI globally (optional)**
   ```bash
   npm install -g expo-cli
   ```

2. **Install Expo Go on your mobile device**
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

3. **Set up simulators/emulators**
   - **iOS**: Install Xcode and Xcode Command Line Tools
   - **Android**: Install Android Studio and configure Android SDK

## 📱 Running the App

### Development Server

```bash
# Start Metro bundler
npm start

# Start with specific options
npm start -- --clear        # Clear cache
npm start -- --tunnel       # Use tunnel connection (for remote testing)
npm start -- --localhost    # Use localhost instead of LAN
```

### Platform-Specific

```bash
# iOS Simulator (macOS only)
npm run ios
npm run ios -- --device     # Run on connected iOS device

# Android Emulator
npm run android
npm run android -- --device # Run on connected Android device

# Web Browser
npm run web
```

## 🏗️ Project Architecture

### Folder Structure Guidelines

#### `/app` - Application Screens (Expo Router)
- File-based routing system
- Each file represents a route
- `_layout.tsx` files configure navigation
- Use `(folder)` syntax for route groups (doesn't appear in URL)

```typescript
// Example: app/user/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function UserScreen() {
  const { id } = useLocalSearchParams();
  return <ThemedView>User {id}</ThemedView>;
}
```

#### `/components` - Reusable Components
- **UI components**: `components/ui/` for basic UI elements
- **Feature components**: `components/` for business logic components
- Always use TypeScript interfaces for props
- Export named functions, not default exports (except screens)

#### `/hooks` - Custom React Hooks
- Prefix with `use` (e.g., `useAuth`, `useFetch`)
- Extract reusable logic from components
- Type return values explicitly

#### `/constants` - App Configuration
- Theme colors and spacing
- API endpoints
- Feature flags
- Environment-specific values

#### `/assets` - Static Files
- Images, fonts, videos
- Use Expo's asset system for optimization
- Reference with `require()` for static bundling

## 💻 Development Workflow

### Creating New Features

1. **Plan the feature**
   - Define screens, components, and data flow
   - Consider mobile UX patterns
   - Plan for both iOS and Android

2. **Create the screen**
   ```bash
   # Example: Add a profile screen
   touch app/profile.tsx
   ```

3. **Build components**
   - Start with UI components
   - Add business logic
   - Extract reusable parts

4. **Add navigation**
   - Update `_layout.tsx` if needed
   - Use `<Link>` or `router.push()` for navigation

5. **Test on platforms**
   - Test on iOS simulator
   - Test on Android emulator
   - Test on physical device

### Code Style Guidelines

#### TypeScript Best Practices
```typescript
// ✅ Good: Explicit types
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function Button({ title, onPress, disabled = false }: ButtonProps) {
  // Implementation
}

// ❌ Bad: Any types
export function Button(props: any) {
  // Implementation
}
```

#### Component Patterns
```typescript
// ✅ Good: Functional component with hooks
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <ThemedView style={styles.container}>
      {/* Component content */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

#### Styling Best Practices
```typescript
// ✅ Good: StyleSheet.create for performance
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

// ❌ Bad: Inline styles (use sparingly)
<View style={{ padding: 16 }}>
```

## 🧪 Testing Strategy

### Manual Testing
```bash
# Test on iOS
npm run ios

# Test on Android
npm run android

# Test on web
npm run web

# Test with Expo Go
npm start
# Scan QR code with Expo Go app
```

### Testing Checklist
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical device (both platforms if possible)
- [ ] Test light and dark modes
- [ ] Test different screen sizes
- [ ] Test offline behavior (if applicable)
- [ ] Test navigation flows
- [ ] Test form validation
- [ ] Test error states

## 📦 Adding Dependencies

### Expo-Compatible Packages
```bash
# Always use expo install for Expo packages
npx expo install expo-camera
npx expo install expo-location
npx expo install @react-navigation/native
```

### Third-Party Packages
```bash
# Check compatibility first
npm install package-name

# Verify it works with Expo
# Some packages may require native code and need EAS Build
```

### Common Dependencies

**UI Libraries:**
- `react-native-reanimated` - Animations (already included)
- `react-native-gesture-handler` - Gestures (already included)
- `expo-linear-gradient` - Gradients
- `expo-blur` - Blur effects

**Data Fetching:**
- `axios` - HTTP client
- `@tanstack/react-query` - Data fetching and caching
- `swr` - Data fetching hooks

**State Management:**
- `zustand` - Lightweight state management
- `@reduxjs/toolkit` - Redux toolkit
- `jotai` - Atomic state management

**Forms:**
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `yup` - Schema validation

## 🐛 Debugging

### Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start --clear

# Reset bundler
npx expo start --reset-cache

# Kill all Metro processes
killall -9 node
```

### iOS Simulator Issues
```bash
# Reset iOS simulator
xcrun simctl erase all

# Rebuild iOS
rm -rf ios/
npx expo prebuild --platform ios
```

### Android Emulator Issues
```bash
# Clear Android build
cd android && ./gradlew clean && cd ..

# Rebuild Android
rm -rf android/
npx expo prebuild --platform android
```

### Common Issues

**"Cannot find module" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
npm run typecheck
# Fix reported issues
```

**Cache issues:**
```bash
# Clear all caches
npx expo start --clear
rm -rf node_modules .expo
npm install
```

## 🚀 Building for Production

### Development Build (for testing native code)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile development

# Build for Android
eas build --platform android --profile development
```

### Production Build
```bash
# Build for app stores
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 🔧 Configuration Files

### `app.json` / `app.config.js`
- App name, icons, splash screen
- Permissions and capabilities
- Build settings
- Environment variables

### `tsconfig.json`
- TypeScript compiler options
- Path aliases (`@/components`)
- Type checking strictness

### `eslint.config.js`
- Code linting rules
- Code style enforcement
- Import ordering

## 📝 Git Workflow

### Commit Messages
```bash
# Format: type(scope): description

feat(auth): add login screen
fix(navigation): resolve tab bar rendering issue
docs(readme): update installation steps
style(home): improve button spacing
refactor(api): simplify fetch logic
test(utils): add unit tests for helpers
```

### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/user-authentication

# Create bugfix branch
git checkout -b fix/navigation-crash

# Merge to main
git checkout main
git merge feature/user-authentication
```

## 🎯 AI Development Tips

When working with AI assistants (ChatGPT, Codex, etc.):

1. **Be specific about platform requirements**
   - "Create a button component for React Native"
   - "Add iOS-specific haptic feedback"

2. **Reference existing patterns**
   - "Follow the pattern in `components/themed-text.tsx`"
   - "Use the same navigation approach as the explore screen"

3. **Specify TypeScript types**
   - "Create an interface for user data"
   - "Type the navigation props"

4. **Ask for mobile-specific considerations**
   - "Add proper touch targets for mobile"
   - "Consider iOS safe area insets"

5. **Request testing guidance**
   - "How should I test this on Android?"
   - "What edge cases should I consider?"

## 📞 Support & Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Forums](https://forums.expo.dev/)
- [Expo Discord](https://chat.expo.dev/)
- [Stack Overflow - expo tag](https://stackoverflow.com/questions/tagged/expo)
