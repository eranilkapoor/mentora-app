import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { loginStyles } from '../Login.styles';
import { PhoneFormProps } from '../Login.types';
import { CountryCodeDropdown } from './CountryCodeDropdown';
import { OTP_LENGTH, PHONE_MAX_LENGTH } from '@/core/constants';

export function PhoneForm({
  errors,
  loading,
  phone,
  otp,
  otpSent,
  countryCode,
  showCountryCodeDropdown,
  onPhoneChange,
  onOtpChange,
  onGetOtp,
  onVerifyOtp,
  onResendOtp,
  onToggleDropdown,
  onCloseDropdown,
  onSelectCountryCode,
}: PhoneFormProps): React.ReactElement {
  const styles = useThemedStyles(loginStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      {/* Phone number input */}
      <Text style={styles.label}>{t('auth.fields.phone')}</Text>
      <View style={[styles.phoneRow, errors.phone && styles.inputError]}>
        <TouchableOpacity
          style={styles.countryCodeBtn}
          onPress={onToggleDropdown}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('auth.actions.select_country_code')}
          accessibilityState={{ expanded: showCountryCodeDropdown }}
        >
          <Text style={styles.countryCodeText}>+{countryCode}</Text>
          <Feather
            name="chevron-down"
            size={14}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>

        <CountryCodeDropdown
          visible={showCountryCodeDropdown}
          onClose={onCloseDropdown}
          selectedCode={countryCode}
          onSelectCode={onSelectCountryCode}
        />

        <TextInput
          style={[styles.input, styles.phoneInput]}
          placeholder={t('auth.placeholders.phone')}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={onPhoneChange}
          editable={!loading && !otpSent}
          maxLength={PHONE_MAX_LENGTH}
          returnKeyType="done"
          onSubmitEditing={!otpSent ? onGetOtp : undefined}
          accessibilityLabel={t('auth.fields.phone')}
        />
      </View>
      {errors.phone ? (
        <Text style={styles.errorText}>{errors.phone}</Text>
      ) : null}

      {/* Get OTP button */}
      {!otpSent ? (
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={onGetOtp}
          disabled={loading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('auth.actions.get_otp')}
          accessibilityState={{ disabled: loading }}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>
                {t('auth.actions.get_otp')}
              </Text>
              <Feather name="send" size={16} color={theme.colors.white} />
            </>
          )}
        </TouchableOpacity>
      ) : (
        <>
          {/* OTP sent banner */}
          <View style={styles.otpInfoBanner}>
            <Feather
              name="check-circle"
              size={14}
              color={theme.colors.success}
            />
            <Text style={styles.otpInfoText}>
              {t('auth.otp.sent_to', { code: countryCode, phone })}
            </Text>
          </View>

          {/* OTP input */}
          <Text style={[styles.label, styles.labelSpacing]}>
            {t('auth.fields.otp')}
          </Text>
          <TextInput
            style={[styles.otpInput, errors.otp && styles.inputError]}
            placeholder={t('auth.placeholders.otp')}
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
            value={otp}
            onChangeText={onOtpChange}
            editable={!loading}
            maxLength={OTP_LENGTH}
            returnKeyType="done"
            onSubmitEditing={onVerifyOtp}
            accessibilityLabel={t('auth.fields.otp')}
          />
          {errors.otp ? (
            <Text style={styles.errorText}>{errors.otp}</Text>
          ) : null}

          {/* Verify button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={onVerifyOtp}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('auth.actions.verify_sign_in')}
            accessibilityState={{ disabled: loading }}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  {t('auth.actions.verify_sign_in')}
                </Text>
                <Feather
                  name="arrow-right"
                  size={18}
                  color={theme.colors.white}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <TouchableOpacity
            style={styles.resendRow}
            onPress={onResendOtp}
            disabled={loading}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('auth.actions.resend_otp')}
          >
            <Feather name="refresh-cw" size={13} color={theme.colors.link} />
            <Text style={styles.resendText}>
              {t('auth.actions.resend_otp')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );
}