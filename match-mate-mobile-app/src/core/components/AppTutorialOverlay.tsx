import React, { useMemo, useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

export type TutorialTarget =
  'EditProfile' | 'EditPreference' | 'Matches' | 'Chats' | 'PrivacySettings';

interface AppTutorialOverlayProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (target: TutorialTarget) => void;
}

type TutorialStep = {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  routeLabel: string;
  target: TutorialTarget;
};

const OVERLAY_BACKDROP = 'rgba(15, 23, 42, 0.58)';
const SHADOW_COLOR = '#000';
const FALLBACK_STEP: TutorialStep = {
  icon: 'help-circle',
  title: '',
  description: '',
  routeLabel: '',
  target: 'EditProfile',
};

export function AppTutorialOverlay({
  visible,
  onClose,
  onNavigate,
}: AppTutorialOverlayProps): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const steps = useMemo<TutorialStep[]>(
    () => [
      {
        icon: 'user-check',
        title: t('settings.tutorial.steps.profile.title'),
        description: t('settings.tutorial.steps.profile.description'),
        routeLabel: t('settings.tutorial.steps.profile.route'),
        target: 'EditProfile',
      },
      {
        icon: 'sliders',
        title: t('settings.tutorial.steps.preferences.title'),
        description: t('settings.tutorial.steps.preferences.description'),
        routeLabel: t('settings.tutorial.steps.preferences.route'),
        target: 'EditPreference',
      },
      {
        icon: 'heart',
        title: t('settings.tutorial.steps.matches.title'),
        description: t('settings.tutorial.steps.matches.description'),
        routeLabel: t('settings.tutorial.steps.matches.route'),
        target: 'Matches',
      },
      {
        icon: 'message-circle',
        title: t('settings.tutorial.steps.connect.title'),
        description: t('settings.tutorial.steps.connect.description'),
        routeLabel: t('settings.tutorial.steps.connect.route'),
        target: 'Chats',
      },
      {
        icon: 'shield',
        title: t('settings.tutorial.steps.safety.title'),
        description: t('settings.tutorial.steps.safety.description'),
        routeLabel: t('settings.tutorial.steps.safety.route'),
        target: 'PrivacySettings',
      },
    ],
    [t]
  );

  useEffect(() => {
    if (visible) {
      setIndex(0);
    }
  }, [visible]);

  const isLast = index === steps.length - 1;
  const step = steps[index] ?? steps[0] ?? FALLBACK_STEP;

  const goNext = (): void => {
    if (isLast) {
      onClose();
      return;
    }

    setIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = (): void => {
    setIndex((current) => Math.max(current - 1, 0));
  };

  const openCurrentStep = (): void => {
    if (!onNavigate) return;

    onClose();
    onNavigate(step.target);
  };

  const cardMaxHeight = Math.max(320, height - 44);
  const cardMaxWidth = Math.min(520, width - 28);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.divider,
              maxHeight: cardMaxHeight,
              maxWidth: cardMaxWidth,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Feather
                name={step.icon}
                size={24}
                color={theme.colors.primary}
              />
            </View>

            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('settings.tutorial.close')}
              style={styles.closeButton}
            >
              <Feather name="x" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>
              {t('settings.tutorial.eyebrow', {
                current: index + 1,
                total: steps.length,
              })}
            </Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {step.title}
            </Text>
            <Text
              style={[styles.description, { color: theme.colors.textBody }]}
            >
              {step.description}
            </Text>

            <View
              style={[
                styles.routeCard,
                {
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.primaryBorder,
                },
              ]}
            >
              <View style={styles.routeTextWrap}>
                <Text
                  style={[
                    styles.routeEyebrow,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t('settings.tutorial.where_to_go')}
                </Text>
                <Text
                  style={[styles.routeLabel, { color: theme.colors.primary }]}
                >
                  {step.routeLabel}
                </Text>
              </View>

              {onNavigate ? (
                <TouchableOpacity
                  onPress={openCurrentStep}
                  style={[
                    styles.routeButton,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.routeButtonText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {t('settings.tutorial.open')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.dotsRow}>
              {steps.map((item, itemIndex) => (
                <View
                  key={item.title}
                  style={[
                    styles.dot,
                    itemIndex === index ? styles.dotActive : styles.dotInactive,
                    {
                      backgroundColor:
                        itemIndex === index
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={goBack}
              disabled={index === 0}
              style={[
                styles.secondaryButton,
                index === 0 ? styles.disabledButton : null,
                {
                  borderColor: theme.colors.border,
                },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t('settings.tutorial.back')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNext}
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.primary },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: theme.colors.white },
                ]}
              >
                {isLast
                  ? t('settings.tutorial.done')
                  : t('settings.tutorial.next')}
              </Text>
              <Feather
                name={isLast ? 'check' : 'arrow-right'}
                size={16}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 22,
    backgroundColor: OVERLAY_BACKDROP,
  },
  card: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 26,
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  scrollContent: {
    paddingBottom: 2,
  },
  scrollArea: {
    flexShrink: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  routeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeTextWrap: {
    flex: 1,
  },
  routeEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  routeLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  routeButton: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 22,
    marginBottom: 20,
  },
  dot: {
    height: 7,
    borderRadius: 99,
  },
  dotActive: {
    width: 22,
  },
  dotInactive: {
    width: 7,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButton: {
    flex: 1.35,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
