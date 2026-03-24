import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

export interface SetCredentialsPayload {
  token: string;
  user: User;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    setProfileCompleted: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isProfileCompleted = action.payload;
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, setProfileCompleted, logout } =
  authSlice.actions;
export default authSlice.reducer;
