import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../core/types/api';

// ─── TYPES ─────────────────────────────────────────────────
interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
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
  isHydrated: false,
};

// ─── SLICE ─────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 🔹 Full login (token + user)
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isHydrated = true;
    },
    // 🔹 After fetching profile
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // 🔹 Profile completion update
    setProfileCompleted: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isProfileCompleted = action.payload;
      }
    },
    // 🔹 Logout
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
    setHydrated: (state) => {
      // ✅ add this action
      state.isHydrated = true;
    },
  },
  extraReducers: (builder) => {
    // ✅ redux-persist fires this action when rehydration is complete
    builder.addCase('persist/REHYDRATE', (state) => {
      state.isHydrated = true;
    });
  },
});

// ─── EXPORTS ───────────────────────────────────────────
export const {
  setCredentials,
  setUser,
  setProfileCompleted,
  logout,
  setHydrated,
} = authSlice.actions;
export default authSlice.reducer;
