import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextInput,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTranslation } from 'react-i18next';
import { headerStyles } from './Header.styles';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type HeaderAction = {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress?: () => void;
  badge?: boolean;
  accessibilityLabel?: string;
};

interface HeaderProps {
  title?: string;
  subtitle?: string;

  showBack?: boolean;
  onBackPress?: () => void;

  leftComponent?: React.ReactNode;
  avatarUri?: string;

  actions?: HeaderAction[];

  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;

  containerStyle?: StyleProp<ViewStyle>;
}

// ─────────────────────────────────────────────
// Action Button
// ─────────────────────────────────────────────

interface ActionButtonProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress?: () => void;
  badge?: boolean;
  label?: string;
  color: string;
  styles: ReturnType<typeof headerStyles>;
}

const ActionButton = React.memo(
  ({ icon, onPress, badge, label, color, styles }: ActionButtonProps) => (
    <TouchableOpacity
      style={styles.iconBtn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? icon}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <Feather name={icon} size={18} color={color} />
      {badge ? <View style={styles.badge} /> : null}
    </TouchableOpacity>
  )
);

ActionButton.displayName = 'ActionButton';

// ─────────────────────────────────────────────
// Header Component
// ─────────────────────────────────────────────

export default function Header({
  title,
  subtitle,
  showBack,
  onBackPress,
  leftComponent,
  avatarUri,
  actions = [],
  enableSearch = false,
  searchPlaceholder,
  onSearchChange,
  containerStyle,
}: HeaderProps): React.ReactElement {
  const styles = useThemedStyles(headerStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');

  // 🔙 Back handler fallback
  const handleBack = useCallback(() => {
    onBackPress?.();
  }, [onBackPress]);

  // 🔍 Search change handler
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      onSearchChange?.(text);
    },
    [onSearchChange]
  );

  const clearSearch = useCallback(() => {
    setSearchText('');
    onSearchChange?.('');
  }, [onSearchChange]);

  // ───────────────────────────────────────────
  // LEFT SECTION
  // ───────────────────────────────────────────

  const renderLeft = () => {
    if (isSearching) {
      return (
        <View style={styles.searchContainer}>
          <Feather name="search" size={16} color={theme.colors.textMuted} />

          <TextInput
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder={searchPlaceholder ?? t('common.search')}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
            autoFocus
            returnKeyType="search"
            accessibilityLabel={t('common.search')}
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              accessibilityRole="button"
              accessibilityLabel={t('common.clear')}
            >
              <Feather name="x" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setIsSearching(false)}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <Feather
              name="chevron-left"
              size={20}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      );
    }

    if (leftComponent) return leftComponent;

    return (
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.go_back')}
          >
            <Feather
              name="arrow-left"
              size={18}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        )}

        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
            accessibilityLabel={t('common.avatar')}
          />
        ) : null}

        <View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    );
  };

  // ───────────────────────────────────────────
  // ACTIONS
  // ───────────────────────────────────────────

  const finalActions = useMemo(() => {
    if (!enableSearch) return actions;

    return [
      {
        icon: 'search' as const,
        onPress: () => setIsSearching(true),
        accessibilityLabel: t('common.search'),
      },
      ...actions,
    ];
  }, [actions, enableSearch, t]);

  const renderAction = useCallback(
    (action: HeaderAction, index: number) => (
      <ActionButton
        key={`${action.icon}-${index}`}
        icon={action.icon}
        onPress={action.onPress}
        badge={action.badge}
        label={action.accessibilityLabel}
        color={theme.colors.textSecondary}
        styles={styles}
      />
    ),
    [theme.colors.textSecondary, styles]
  );

  // ───────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────

  return (
    <View style={[styles.header, containerStyle]}>
      {renderLeft()}

      {!isSearching && (
        <View style={styles.right}>{finalActions.map(renderAction)}</View>
      )}
    </View>
  );
}
