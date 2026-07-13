import { User } from '@/core/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── TYPES ─────────────────────────────────────────────────
interface AuthState {
  accessToken: string | null;
  user: User | null;
  onboardingCompletionPending: boolean;
}

// ─── PAYLOADS ──────────────────────────────────────────
export interface SetAuthPayload {
  accessToken: string;
}

export interface SetCredentialsPayload {
  accessToken: string;
  user: User;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  onboardingCompletionPending: false,
};

// ─── SLICE ─────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 🔹 Full login (accessToken + user)
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    // 🔹 After fetching profile
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    // 🔹 Profile completion update
    setProfileCompleted: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isOnboardingCompleted = action.payload;
      }
    },
    setOnboardingCompletionPending: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompletionPending = action.payload;
    },
    // 🔹 Logout
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.onboardingCompletionPending = false;
    },
  },
});

// ─── EXPORTS ───────────────────────────────────────────
export const {
  setCredentials,
  setUser,
  setProfileCompleted,
  setOnboardingCompletionPending,
  logout,
  setAccessToken,
} = authSlice.actions;
export default authSlice.reducer;
