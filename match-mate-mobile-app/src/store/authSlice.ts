import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── TYPES ─────────────────────────────────────────────────

export interface User {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isProfileCompleted: boolean;
  membership?: {
    tier: 'free' | 'premium';
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean; // 🔥 for restore session
}

// ─── PAYLOADS ──────────────────────────────────────────

export interface SetAuthPayload {
  token: string;
}

export interface SetCredentialsPayload {
  token: string;
  user: User;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false, // 🔥 important for app start
};

// ─── SLICE ─────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 🔹 Restore token only
    setAuth: (state, action: PayloadAction<SetAuthPayload>) => {
      state.token = action.payload.token;
      state.loading = false;
    },
    // 🔹 Full login (token + user)
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
    },
    // 🔹 After fetching profile
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
    },
    // 🔹 Profile completion update
    setProfileCompleted: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isProfileCompleted = action.payload;
      }
    },
    // 🔹 Stop loading (after restore)
    finishLoading: (state) => {
      state.loading = false;
    },
    // 🔹 Logout
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.loading = false;
    },
  },
});

// ─── EXPORTS ───────────────────────────────────────────

export const {
  setAuth,
  setCredentials,
  setUser,
  setProfileCompleted,
  finishLoading,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
