import { Alert, Platform } from 'react-native';

interface ConfirmOptions {
  title: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;

  destructive?: boolean;

  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export const showConfirm = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmOptions): void => {
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
