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

export function ChildSafetyScreen({
  navigation,
}: StaticPageScreenProps): React.ReactElement {
  return (
    <StaticPageWebViewScreen
      navigation={navigation}
      slug="child-safety"
      titleKey="settings.support_center.child_safety"
    />
  );
}

export function AiTutorDisclaimerScreen({
  navigation,
}: StaticPageScreenProps): React.ReactElement {
  return (
    <StaticPageWebViewScreen
      navigation={navigation}
      slug="ai-tutor-disclaimer"
      titleKey="settings.support_center.ai_tutor_disclaimer"
    />
  );
}

export function RefundPolicyScreen({
  navigation,
}: StaticPageScreenProps): React.ReactElement {
  return (
    <StaticPageWebViewScreen
      navigation={navigation}
      slug="refund-policy"
      titleKey="settings.support_center.refund_policy"
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

export function AccountDeletionScreen({
  navigation,
}: StaticPageScreenProps): React.ReactElement {
  return (
    <StaticPageWebViewScreen
      navigation={navigation}
      slug="account-deletion"
      titleKey="settings.support_center.account_deletion"
    />
  );
}
