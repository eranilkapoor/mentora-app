import React from 'react';
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from '../MatchList.styles';

interface Props {
  visible: boolean;
  matchName: string;
  matchPhotoUrl: string;
  myPhotoUrl: string;
  onStartChat: () => void;
  onContinueBrowsing: () => void;
  onClose: () => void;
}

export function MatchSuccessModal({
  visible,
  matchName,
  matchPhotoUrl,
  myPhotoUrl,
  onStartChat,
  onContinueBrowsing,
  onClose,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme, reduceAnimations, screenReaderOptimized } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType={
        reduceAnimations ? 'none' : Platform.OS === 'web' ? 'fade' : 'slide'
      }
      transparent
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.matchSuccessOverlay}
        onPress={onContinueBrowsing}
        accessibilityViewIsModal={screenReaderOptimized}
      >
        <Pressable style={styles.matchSuccessSheet} onPress={() => {}}>
          <View style={styles.matchSuccessBadge}>
            <Feather name="heart" size={22} color={theme.colors.white} />
          </View>

          <Text style={styles.matchSuccessTitle}>
            {t('matches.match_success_title')}
          </Text>
          <Text style={styles.matchSuccessMessage}>
            {t('matches.match_success_message', { name: matchName })}
          </Text>

          <View style={styles.matchSuccessPhotosRow}>
            <Image
              source={{ uri: myPhotoUrl }}
              style={styles.matchSuccessPhoto}
              resizeMode="cover"
              accessibilityLabel={t('matches.match_success_you_photo')}
            />
            <View style={styles.matchSuccessConnector}>
              <Feather name="heart" size={14} color={theme.colors.primary} />
            </View>
            <Image
              source={{ uri: matchPhotoUrl }}
              style={styles.matchSuccessPhoto}
              resizeMode="cover"
              accessibilityLabel={t('matches.match_success_partner_photo', {
                name: matchName,
              })}
            />
          </View>

          <TouchableOpacity
            style={styles.matchSuccessPrimaryCta}
            onPress={onStartChat}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Feather
              name="message-circle"
              size={16}
              color={theme.colors.white}
            />
            <Text style={styles.matchSuccessPrimaryText}>
              {t('matches.match_success_start_chat')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.matchSuccessSecondaryCta}
            onPress={onContinueBrowsing}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.matchSuccessSecondaryText}>
              {t('matches.match_success_continue')}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
