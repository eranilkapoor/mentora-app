import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  | 'faqs'
  | 'account-deletion';

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
  const { theme, isDark, accessibility } = useTheme();
  const { i18n, t } = useTranslation();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [webHtml, setWebHtml] = useState<string | null>(null);

  const pageUrl = useMemo(() => {
    const themeName = isDark ? 'dark' : 'light';
    const language = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const normalizedLanguage = language.split('-')[0] ?? 'en';
    const params = new URLSearchParams({
      theme: themeName,
      lang: normalizedLanguage,
      fontSize: accessibility.fontSize,
      boldText: String(accessibility.boldText),
      highContrast: String(accessibility.highContrastMode),
      reduceMotion: String(accessibility.reduceAnimations),
    });

    return `${getApiOrigin()}/${slug}?${params.toString()}`;
  }, [accessibility, i18n.language, i18n.resolvedLanguage, isDark, slug]);

  const handleRetry = (): void => {
    setHasError(false);
    setIsLoading(true);
    setWebHtml(null);
    webViewRef.current?.reload();
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let isActive = true;
    setIsLoading(true);
    setHasError(false);
    setWebHtml(null);

    fetch(pageUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Static page failed with ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        if (!isActive) return;
        setWebHtml(html);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isActive) return;
        setIsLoading(false);
        setHasError(true);
      });

    return () => {
      isActive = false;
    };
  }, [pageUrl]);

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
          {Platform.OS === 'web'
            ? React.createElement('iframe', {
                srcDoc: webHtml ?? '',
                title: t(titleKey),
                sandbox: '',
                referrerPolicy: 'no-referrer',
                style: {
                  border: 0,
                  flex: 1,
                  height: '100%',
                  width: '100%',
                  backgroundColor: theme.colors.backgroundPage,
                },
              })
            : null}
          {Platform.OS !== 'web' ? (
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
          ) : null}
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
