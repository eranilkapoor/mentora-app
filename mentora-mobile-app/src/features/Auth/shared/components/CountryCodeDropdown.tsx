import React from 'react';
import { Modal, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { authSharedStyles } from '../auth.styles';
import { CountryCodeDropdownProps } from '../auth.types';
import { COUNTRY_CODES } from '@/core/constants';

export const CountryCodeDropdown = React.memo<CountryCodeDropdownProps>(
  ({ visible, onClose, selectedCode, onSelectCode }) => {
    const styles = useThemedStyles(authSharedStyles);
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('auth.actions.close_country_code_dropdown')}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalDropdown}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {COUNTRY_CODES.map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={[
                      styles.countryCodeItem,
                      selectedCode === code && styles.countryCodeItemActive,
                    ]}
                    onPress={() => {
                      onSelectCode(code);
                      onClose();
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('auth.actions.country_code_label', {
                      code,
                    })}
                    accessibilityState={{ selected: selectedCode === code }}
                  >
                    <Text
                      style={[
                        styles.countryCodeItemText,
                        selectedCode === code &&
                          styles.countryCodeItemTextActive,
                      ]}
                    >
                      +{code}
                    </Text>
                    {selectedCode === code && (
                      <Feather
                        name="check"
                        size={14}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }
);

CountryCodeDropdown.displayName = 'CountryCodeDropdown';
