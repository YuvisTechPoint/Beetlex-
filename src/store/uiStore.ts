import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  darkMode: boolean
  sidebarOpen: boolean
  notificationSoundsEnabled: boolean
  signInOpen: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setNotificationSoundsEnabled: (value: boolean) => void
  openSignIn: () => void
  closeSignIn: () => void
  setSignInOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      darkMode: false,
      sidebarOpen: true,
      notificationSoundsEnabled: true,
      signInOpen: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (value) => set({ darkMode: value }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setNotificationSoundsEnabled: (value) => set({ notificationSoundsEnabled: value }),
      openSignIn: () => set({ signInOpen: true }),
      closeSignIn: () => set({ signInOpen: false }),
      setSignInOpen: (open) => set({ signInOpen: open }),
    }),
    { name: 'beetlex-ui' },
  ),
)
