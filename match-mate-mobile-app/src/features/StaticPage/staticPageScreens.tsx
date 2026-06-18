import React from 'react';
import StaticPageWebViewScreen from './StaticPageWebView.screen';

type StaticPageScreenProps = {
  navigation: {
    goBack: () => void;
  };
};

export function PrivacyPolicyScreen({
  navigation,
}: StaticPageScreenProps): React.ReactElement {
  return (
    <StaticPageWebViewScreen
      navigation={navigation}
      slug="privacy-policy"
      titleKey="settings.privacy_policy"
    />
  );
}

export function TermsConditionsScreen({
  navigation,
}: StaticPageScreenProps): React.ReactElement {
  return (
    <StaticPageWebViewScreen
      navigation={navigation}
      slug="terms-conditions"
      titleKey="settings.terms_conditions"
    />
  );
}

export function CommunityGuidelinesScreen({
  navigation,
}: StaticPageScreenProps): React.ReactElement {
  return (
    <StaticPageWebViewScreen
      navigation={navigation}
      slug="community-guidelines"
      titleKey="settings.support_center.community_guidelines"
    />
  );
}

export function FaqsScreen({
  navigation,
}: StaticPageScreenProps): React.ReactElement {
  return (
    <StaticPageWebViewScreen
      navigation={navigation}
      slug="faqs"
      titleKey="settings.support_center.faqs"
    />
  );
}
