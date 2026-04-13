import { useThemedStyles } from "@/core/theme/useThemedStyles";
import { chatListStyles } from "../ChatListScreen.styles";
import { View } from "react-native";

export function SkeletonList(): React.ReactElement {
  const styles = useThemedStyles(chatListStyles);
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonLines}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
          </View>
        </View>
      ))}
    </>
  );
}