import { useCallback } from 'react';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { showConfirm } from '@/core/utils/confirm';
import { navigationRef } from '@/navigation/navigationRef';

export function useUpgradePrompt(): (featureName?: string) => void {
  const { t } = useTranslation();

  return useCallback(
    (featureName?: string): void => {
      showConfirm({
        title: t('membership.locked_feature.title', {
          defaultValue: 'Premium feature',
        }),
        message: featureName
          ? t('membership.locked_feature.named_message', {
              defaultValue:
                '{{feature}} is not included in your current plan. Upgrade to unlock it.',
              feature: featureName,
            })
          : t('membership.locked_feature.message', {
              defaultValue:
                'This option is not included in your current plan. Upgrade to unlock it.',
            }),
        confirmText: t('membership.locked_feature.view_plans', {
          defaultValue: 'View plans',
        }),
        cancelText: t('common.cancel'),
        onConfirm: () => {
          if (!navigationRef.isReady()) return;
          navigationRef.dispatch(
            CommonActions.navigate('App', {
              screen: 'Tabs',
              params: { screen: 'Membership' },
            })
          );
        },
      });
    },
    [t]
  );
}
