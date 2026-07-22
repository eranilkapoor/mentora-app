import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchDetailStyles } from '../MatchDetail.styles';

interface Props {
  matchScore: number;
  canViewDetails: boolean;
}

export function MatchScoreBar({
  matchScore,
  canViewDetails,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.matchScoreBar}>
      <View style={styles.matchScoreLeft}>
        <View style={styles.matchScoreIconWrapper}>
          <Feather name="heart" size={18} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={styles.matchScoreLabel}>
            {t('match_detail.match_score')}
          </Text>
          <Text style={styles.matchScoreValue}>{matchScore}%</Text>
        </View>
      </View>

      <View style={styles.matchScoreDivider} />

      <View style={styles.matchScoreLeft}>
        <View style={styles.matchScoreIconWrapper}>
          <Feather name="shield" size={18} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={styles.matchScoreLabel}>
            {t('match_detail.details_access')}
          </Text>
          <Text style={styles.matchScoreValue}>
            {canViewDetails
              ? t('match_detail.details_open')
              : t('match_detail.details_limited')}
          </Text>
        </View>
      </View>
    </View>
  );
}
