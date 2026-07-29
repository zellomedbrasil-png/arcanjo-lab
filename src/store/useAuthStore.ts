import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const SYSTEM_PASSWORD = '87325702';
// Key versioning forces immediate logout across all existing sessions/devices
const AUTH_KEY = 'arcanjo_system_auth_v2';

interface AuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (password: string) => {
        if (password.trim() === SYSTEM_PASSWORD) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false });
      },
    }),
    {
      name: AUTH_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
