import React from 'react';
import { CountryCodeDropdownProps } from '../Register.types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { registerStyles } from '../Register.styles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Modal, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { COUNTRY_CODES } from '@/core/constants';
import Feather from 'react-native-vector-icons/Feather';

export const CountryCodeDropdown = React.memo<CountryCodeDropdownProps>(
  ({ visible, onClose, selectedCode, onSelectCode }) => {
    const styles = useThemedStyles(registerStyles);
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
        >
          <View style={styles.modalDropdown}>
            <ScrollView keyboardShouldPersistTaps="handled">
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
                  accessibilityRole="button"
                  accessibilityLabel={`Country code ${code}`}
                >
                  <Text
                    style={[
                      styles.countryCodeItemText,
                      selectedCode === code && styles.countryCodeItemTextActive,
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
      </Modal>
    );
  }
);

CountryCodeDropdown.displayName = 'CountryCodeDropdown';
