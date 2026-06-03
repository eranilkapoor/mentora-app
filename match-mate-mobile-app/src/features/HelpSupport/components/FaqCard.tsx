import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { FaqItem } from '../HelpSupport.types';
import { helpSupportStyles } from '../HelpSupport.styles';
import { TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';

export function FaqCard({
  faq,
  index,
  expanded,
  onToggle,
  isLast,
}: {
  faq: FaqItem;
  index: number;
  expanded: boolean;
  onToggle: (i: number) => void;
  isLast: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const question = t(faq.question);

  return (
    <View style={[styles.faqContainer, isLast && styles.faqContainerLast]}>
      <TouchableOpacity
        onPress={() => onToggle(index)}
        style={[styles.faqHeader, expanded && styles.faqHeaderActive]}
        accessibilityRole="button"
        accessibilityLabel={question}
        accessibilityState={{ expanded }}
      >
        <View
          style={[
            styles.faqIconWrapper,
            expanded && styles.faqIconWrapperActive,
          ]}
        >
          <Feather
            name={faq.icon}
            size={13}
            color={expanded ? theme.colors.primary : theme.colors.textMuted}
          />
        </View>
        <Text
          style={[styles.faqQuestion, expanded && styles.faqQuestionActive]}
        >
          {question}
        </Text>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={expanded ? theme.colors.primary : theme.colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && <Text style={styles.faqAnswer}>{t(faq.answer)}</Text>}
    </View>
  );
}
