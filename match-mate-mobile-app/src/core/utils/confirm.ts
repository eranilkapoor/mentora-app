import { Alert, Platform } from 'react-native';

export interface ConfirmOptions {
  title: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;

  destructive?: boolean;

  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

type ConfirmPresenter = (options: ConfirmOptions) => void;

let confirmPresenter: ConfirmPresenter | null = null;

export const registerConfirmPresenter = (
  presenter: ConfirmPresenter | null
): void => {
  confirmPresenter = presenter;
};

export const showConfirm = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmOptions): void => {
  if (confirmPresenter) {
    confirmPresenter({
      title,
      ...(message ? { message } : {}),
      confirmText,
      cancelText,
      destructive,
      ...(onConfirm ? { onConfirm } : {}),
      ...(onCancel ? { onCancel } : {}),
    });
    return;
  }

  // Web
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(
      message ? `${title}\n\n${message}` : title
    );

    if (confirmed) {
      void onConfirm?.();
    } else {
      onCancel?.();
    }

    return;
  }

  // Native
  Alert.alert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: destructive ? 'destructive' : 'default',
      onPress: () => {
        void onConfirm?.();
      },
    },
  ]);
};
