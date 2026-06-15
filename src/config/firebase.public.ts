/**
 * Public Firebase web client config (not secret — enforced via Firebase Auth domains + rules).
 * Env vars override these defaults for other Firebase projects / environments.
 */
export const firebasePublicConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCU2bRIq276Ysg3qgYrrg2jK9PMUeX2B5Q',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'mohasti.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'mohasti',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'mohasti.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '46433633650',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:46433633650:web:5cb42de6584fadfd7c49eb',
} as const

export const googleOAuthClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  '401076929268-uvl7nuo83j73shk1kc7irnqo0us6ra5p.apps.googleusercontent.com'
