import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { homeStyles } from './Home.styles';
import { HomeMatchProfile, HomeScreenProps } from './Home.types';
import { useHomeData } from './hooks/useHomeData';
import { useHomeActions } from './hooks/useHomeActions';
import { ProfileCard } from './components/ProfileCard';
import { HomeListHeader } from './components/HomeListHeader';
import { HomeEmpty } from './components/HomeEmpty';

export default function HomeScreen({
  navigation,
}: HomeScreenProps): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    profiles,
    myMatches,
    isFetching,
    page,
    setPage,
    hasNextPage,
    refetch,
    refetchMatches,
    refetchShortlisted,
    refetchSentInterests,
  } = useHomeData(query);

  const { handlePrimaryAction, handleShortlist, handleRefresh } =
    useHomeActions(navigation);

  const onRefresh = useCallback(async () => {
    await handleRefresh(
      page,
      refetch,
      refetchMatches,
      refetchShortlisted,
      refetchSentInterests,
      setRefreshing,
      setPage
    );
  }, [
    page,
    handleRefresh,
    refetch,
    refetchMatches,
    refetchShortlisted,
    refetchSentInterests,
    setPage,
  ]);

  const loadMore = useCallback(() => {
    if (isFetching || !hasNextPage) return;
    setPage((p) => p + 1);
  }, [hasNextPage, isFetching, setPage]);

  const renderProfile: ListRenderItem<HomeMatchProfile> = useCallback(
    ({ item }) => (
      <ProfileCard
        item={item}
        onPrimaryAction={() => {
          void handlePrimaryAction(item);
        }}
        onView={() =>
          navigation.navigate('MatchDetails', { userId: item.userId })
        }
        onShortlist={() => {
          void handleShortlist(item);
        }}
      />
    ),
    [handlePrimaryAction, handleShortlist, navigation]
  );

  const ListHeader = useCallback(
    () => (
      <HomeListHeader
        profiles={profiles}
        matchCount={myMatches?.data?.length ?? 0}
        onSeeAll={() => navigation.getParent()?.navigate('Matches')}
      />
    ),
    [myMatches?.data?.length, navigation, profiles]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        enableSearch
        searchPlaceholder={t('home.search_placeholder')}
        onSearchChange={setQuery}
        actions={[
          {
            icon: 'bell',
            badge: true,
            onPress: () => navigation.navigate('Notifications'),
          },
        ]}
      />

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderProfile}
        ListHeaderComponent={ListHeader}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <View style={styles.listFooter}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void onRefresh();
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={isFetching ? null : <HomeEmpty />}
      />
    </SafeAreaView>
  );
}
