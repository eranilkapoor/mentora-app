import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { FaqItem } from '../HelpSupport.types';
import { helpSupportStyles } from '../HelpSupportScreen.styles';
import { TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

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

  return (
    <View style={[styles.faqContainer, isLast && styles.faqContainerLast]}>
      <TouchableOpacity
        onPress={() => onToggle(index)}
        style={[styles.faqHeader, expanded && styles.faqHeaderActive]}
        accessibilityRole="button"
        accessibilityLabel={faq.question}
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
            color={expanded ? Colors.primary : Colors.textMuted}
          />
        </View>
        <Text
          style={[styles.faqQuestion, expanded && styles.faqQuestionActive]}
        >
          {faq.question}
        </Text>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={expanded ? Colors.primary : Colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
    </View>
  );
}
