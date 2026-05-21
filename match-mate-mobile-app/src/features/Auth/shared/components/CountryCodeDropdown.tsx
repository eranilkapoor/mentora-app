import React from 'react';
import { Modal, ScrollView, TouchableOpacity, View, Text } from 'react-native';
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
          accessibilityLabel="Close country code dropdown"
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
                    accessibilityLabel={`Country code +${code}`}
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
