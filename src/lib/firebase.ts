import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth'

function readFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
}

export function isFirebaseConfigured(): boolean {
  const config = readFirebaseConfig()
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId)
}

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

function ensureFirebase(): { auth: Auth; googleProvider: GoogleAuthProvider } {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* variables to .env')
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(readFirebaseConfig())
    firebaseAuth = getAuth(firebaseApp)
    googleProvider = new GoogleAuthProvider()
    googleProvider.setCustomParameters({ prompt: 'select_account' })

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (clientId) {
      googleProvider.setCustomParameters({ prompt: 'select_account', client_id: clientId })
    }
  }

  return { auth: firebaseAuth!, googleProvider: googleProvider! }
}

export async function signInWithGooglePopup(): Promise<{ user: FirebaseUser; idToken: string }> {
  const { auth, googleProvider: provider } = ensureFirebase()
  const credential = await signInWithPopup(auth, provider)
  const idToken = await credential.user.getIdToken()
  return { user: credential.user, idToken }
}

export async function signOutFirebase(): Promise<void> {
  if (!firebaseAuth) return
  await signOut(firebaseAuth)
}

export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  if (!firebaseAuth?.currentUser) return null
  return firebaseAuth.currentUser.getIdToken(forceRefresh)
}

export function subscribeFirebaseAuth(
  listener: (user: FirebaseUser | null, idToken: string | null) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    return () => undefined
  }

  const { auth } = ensureFirebase()

  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      listener(null, null)
      return
    }

    void user.getIdToken().then((idToken) => listener(user, idToken))
  })
}

export function getFirebaseAuthInstance(): Auth | null {
  if (!isFirebaseConfigured()) return null
  return ensureFirebase().auth
}
