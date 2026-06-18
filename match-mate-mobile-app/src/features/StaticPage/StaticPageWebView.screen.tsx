import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { getApiOrigin } from '@/core/utils/config';
import { staticPageWebViewStyles } from './StaticPageWebView.styles';

export type StaticPageSlug =
  | 'privacy-policy'
  | 'terms-conditions'
  | 'community-guidelines'
  | 'faqs';

type NavigationLike = {
  goBack: () => void;
};

type Props = {
  navigation: NavigationLike;
  titleKey: string;
  slug: StaticPageSlug;
};

export default function StaticPageWebViewScreen({
  navigation,
  titleKey,
  slug,
}: Props): React.ReactElement {
  const styles = useThemedStyles(staticPageWebViewStyles);
  const { theme, isDark } = useTheme();
  const { i18n, t } = useTranslation();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const pageUrl = useMemo(() => {
    const themeName = isDark ? 'dark' : 'light';
    const language = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const normalizedLanguage = language.split('-')[0] ?? 'en';
    return `${getApiOrigin()}/${slug}?theme=${themeName}&lang=${encodeURIComponent(
      normalizedLanguage
    )}`;
  }, [i18n.language, i18n.resolvedLanguage, isDark, slug]);

  const handleRetry = (): void => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack onBackPress={navigation.goBack} title={t(titleKey)} />

      {hasError ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Feather name="wifi-off" size={22} color={theme.colors.error} />
          </View>
          <Text style={styles.errorTitle}>{t('common.error_title')}</Text>
          <Text style={styles.errorMessage}>{t('common.try_again')}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.webView}>
          <WebView
            ref={webViewRef}
            source={{ uri: pageUrl }}
            style={styles.webView}
            containerStyle={styles.webView}
            startInLoadingState
            javaScriptEnabled={false}
            domStorageEnabled={false}
            sharedCookiesEnabled={false}
            thirdPartyCookiesEnabled={false}
            setSupportMultipleWindows={false}
            originWhitelist={['http://*', 'https://*']}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
          {isLoading ? (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}
