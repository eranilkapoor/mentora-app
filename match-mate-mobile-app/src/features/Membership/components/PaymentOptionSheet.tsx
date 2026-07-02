import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import type { PaymentGateway } from '@matchmate/api-contract';
import { membershipStyles } from '../Membership.styles';
import { DisplayPlan } from '../Membership.types';

type PaymentOption = {
  gateway: PaymentGateway;
  icon: string;
  labelKey: string;
  descriptionKey: string;
};

const WEB_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    gateway: 'razorpay',
    icon: 'credit-card',
    labelKey: 'membership.checkout.razorpay',
    descriptionKey: 'membership.checkout.razorpay_sub',
  },
  {
    gateway: 'stripe',
    icon: 'shield',
    labelKey: 'membership.checkout.stripe',
    descriptionKey: 'membership.checkout.stripe_sub',
  },
];

const getNativePaymentOption = (): PaymentOption => ({
  gateway: Platform.OS === 'ios' ? 'apple_iap' : 'google_play',
  icon: Platform.OS === 'ios' ? 'smartphone' : 'shopping-bag',
  labelKey:
    Platform.OS === 'ios'
      ? 'membership.checkout.apple'
      : 'membership.checkout.google',
  descriptionKey: 'membership.checkout.store_sub',
});

interface Props {
  visible: boolean;
  selectedPlanItem: DisplayPlan | null;
  isCreatingOrder: boolean;
  onClose: () => void;
  onContinue: (gateway: PaymentGateway) => void;
}

export function PaymentOptionSheet({
  visible,
  selectedPlanItem,
  isCreatingOrder,
  onClose,
  onContinue,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme, reduceAnimations, screenReaderOptimized } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const paymentOptions = useMemo(
    () =>
      Platform.OS === 'ios' || Platform.OS === 'android'
        ? [getNativePaymentOption()]
        : WEB_PAYMENT_OPTIONS,
    []
  );
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>(
    paymentOptions[0]?.gateway ?? 'razorpay'
  );

  return (
    <Modal
      visible={visible}
      animationType={reduceAnimations ? 'none' : 'slide'}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <View
        style={styles.checkoutOverlay}
        accessibilityViewIsModal={screenReaderOptimized}
      >
        <View
          style={[
            styles.checkoutSheet,
            { paddingBottom: Math.max(28, insets.bottom + 16) },
          ]}
        >
          <View style={styles.checkoutHandle} />
          <View style={styles.checkoutHeader}>
            <View style={styles.checkoutHeaderCopy}>
              <Text style={styles.checkoutTitle}>
                {t('membership.checkout.title')}
              </Text>
              <Text style={styles.checkoutSubtitle}>
                {t('membership.checkout.subtitle')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutClose}
              activeOpacity={0.85}
              disabled={isCreatingOrder}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Feather name="x" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {selectedPlanItem ? (
            <View style={styles.checkoutPlanBox}>
              <View>
                <Text style={styles.checkoutPlanLabel}>
                  {t('membership.checkout.selected_plan')}
                </Text>
                <Text style={styles.checkoutPlanName}>
                  {selectedPlanItem.name}
                </Text>
              </View>
              <Text style={styles.checkoutPlanPrice}>
                {selectedPlanItem.price}
              </Text>
            </View>
          ) : null}

          <View style={styles.checkoutOptionList}>
            {paymentOptions.map((option) => {
              const isSelected = option.gateway === selectedGateway;
              return (
                <TouchableOpacity
                  key={option.gateway}
                  style={[
                    styles.checkoutOption,
                    isSelected && styles.checkoutOptionActive,
                  ]}
                  activeOpacity={0.85}
                  disabled={isCreatingOrder}
                  onPress={() => setSelectedGateway(option.gateway)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={t(option.labelKey)}
                >
                  <View style={styles.checkoutOptionIcon}>
                    <Feather
                      name={option.icon as never}
                      size={18}
                      color={
                        isSelected
                          ? theme.colors.primary
                          : theme.colors.textMuted
                      }
                    />
                  </View>
                  <View style={styles.checkoutOptionCopy}>
                    <Text style={styles.checkoutOptionTitle}>
                      {t(option.labelKey)}
                    </Text>
                    <Text style={styles.checkoutOptionSub}>
                      {t(option.descriptionKey)}
                    </Text>
                  </View>
                  <Feather
                    name={isSelected ? 'check-circle' : 'circle'}
                    size={20}
                    color={
                      isSelected ? theme.colors.primary : theme.colors.textMuted
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutContinueButton,
              isCreatingOrder && styles.ctaButtonDisabled,
            ]}
            activeOpacity={0.85}
            disabled={isCreatingOrder || !selectedPlanItem?.source?._id}
            onPress={() => onContinue(selectedGateway)}
            accessibilityRole="button"
            accessibilityLabel={t('membership.checkout.continue')}
          >
            {isCreatingOrder ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.checkoutContinueText}>
                {t('membership.checkout.continue')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
