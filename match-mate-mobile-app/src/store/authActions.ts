import { AppDispatch } from './index';
import { setAuth, setCredentials, logout } from './authSlice';
import { Storage } from './authHelpers';
import { AuthService } from '../services/authService';

type User = {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isProfileCompleted: boolean;
  membership?: {
    tier: 'free' | 'premium';
  };
};

// ✅ Login
export const loginUser =
  (token: string, user: User) => async (dispatch: AppDispatch) => {
    await Storage.setToken(token);
    dispatch(setCredentials({ token, user }));
  };

// ✅ Restore session
export const restoreSession = () => async (dispatch: AppDispatch) => {
  const token = await Storage.getToken();

  if (token) {
    dispatch(setAuth({ token }));

    // 🔥 Fetch user (VERY IMPORTANT)
    try {
      const { data } = await AuthService.verifyUser();
      dispatch(setCredentials({ token, user: data.data as User }));
    } catch {
      await Storage.removeToken();
      dispatch(logout());
    }
  }
};

// ✅ Logout
export const logoutUser = () => async (dispatch: AppDispatch) => {
  await Storage.removeToken();
  dispatch(logout());
};
