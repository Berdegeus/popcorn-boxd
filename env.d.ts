declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_TMDB_API_KEY?: string;
    }
  }
}

declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '@/assets/images/*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '@/assets/images/react-logo.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}
