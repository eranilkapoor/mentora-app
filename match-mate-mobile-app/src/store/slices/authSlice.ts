import { User } from '@/core/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── TYPES ─────────────────────────────────────────────────
interface AuthState {
  access_token: string | null;
  user: User | null;
}

// ─── PAYLOADS ──────────────────────────────────────────
export interface SetAuthPayload {
  access_token: string;
}

export interface SetCredentialsPayload {
  access_token: string;
  user: User;
}

const initialState: AuthState = {
  access_token: null,
  user: null,
};

// ─── SLICE ─────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 🔹 Full login (access_token + user)
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.access_token = action.payload.access_token;
      state.user = action.payload.user;
    },
    // 🔹 After fetching profile
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // 🔹 Profile completion update
    setProfileCompleted: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isOnboardingCompleted = action.payload;
      }
    },
    // 🔹 Logout
    logout: (state) => {
      state.access_token = null;
      state.user = null;
    },
  },
});

// ─── EXPORTS ───────────────────────────────────────────
export const { setCredentials, setUser, setProfileCompleted, logout } =
  authSlice.actions;
export default authSlice.reducer;
