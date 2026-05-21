import Toast from 'react-native-toast-message';

type ToastPosition = 'top' | 'bottom';

interface ToastOptions {
  title: string;
  message?: string;
  position?: ToastPosition;
  visibilityTime?: number;
}

const DEFAULT_POSITION: ToastPosition = 'top';
const DEFAULT_DURATION = 3000;

export const showSuccess = ({
  title,
  message,
  position = DEFAULT_POSITION,
  visibilityTime = DEFAULT_DURATION,
}: ToastOptions): void => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position,
    visibilityTime,
  });
};

export const showError = ({
  title,
  message,
  position = DEFAULT_POSITION,
  visibilityTime = 4000,
}: ToastOptions): void => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position,
    visibilityTime,
  });
};

export const showInfo = ({
  title,
  message,
  position = DEFAULT_POSITION,
  visibilityTime = DEFAULT_DURATION,
}: ToastOptions): void => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position,
    visibilityTime,
  });
};

export const showWarning = ({
  title,
  message,
  position = DEFAULT_POSITION,
  visibilityTime = DEFAULT_DURATION,
}: ToastOptions): void => {
  Toast.show({
    type: 'warning',
    text1: title,
    text2: message,
    position,
    visibilityTime,
  });
};

export const hideToast = (): void => {
  Toast.hide();
};