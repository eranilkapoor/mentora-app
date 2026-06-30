import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import {
  SettingsOption,
  SettingsOptionSheet,
} from '@/core/components/settings/SettingsOptionSheet';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsNavigationProp } from '@/navigation/types';
import { showError, showSuccess } from '@/core/utils/toast';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import {
  useGetKycStatusQuery,
  useInitiateEkycMutation,
  useSubmitKycMutation,
} from '@/store/services/kycApi.service';

type Props = {
  navigation: SettingsNavigationProp;
};

type UploadFile = { uri: string; name: string; type: string };
type KycDocumentType =
  'aadhaar' | 'pan' | 'passport' | 'driving_licence' | 'voter_id';

export default function KycVerificationScreen({
  navigation,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const styles = useThemedStyles(sharedSettingsStyles);
  const { theme } = useTheme();
  const local = useMemo(() => createStyles(theme), [theme]);
  const documentTypeOptions = useMemo<SettingsOption<KycDocumentType>[]>(
    () => [
      {
        value: 'aadhaar',
        label: t('settings.kyc.document_aadhaar'),
        description: t('settings.kyc.document_aadhaar_sub'),
      },
      {
        value: 'pan',
        label: t('settings.kyc.document_pan'),
        description: t('settings.kyc.document_pan_sub'),
      },
      {
        value: 'passport',
        label: t('settings.kyc.document_passport'),
        description: t('settings.kyc.document_passport_sub'),
      },
      {
        value: 'driving_licence',
        label: t('settings.kyc.document_driving_licence'),
        description: t('settings.kyc.document_driving_licence_sub'),
      },
      {
        value: 'voter_id',
        label: t('settings.kyc.document_voter_id'),
        description: t('settings.kyc.document_voter_id_sub'),
      },
    ],
    [t]
  );
  const { data, isLoading, refetch } = useGetKycStatusQuery();
  const [submitKyc, { isLoading: isSubmitting }] = useSubmitKycMutation();
  const [initiateEkyc] = useInitiateEkycMutation();
  const [documentType, setDocumentType] = useState<KycDocumentType>('aadhaar');
  const [documentTypeOpen, setDocumentTypeOpen] = useState(false);
  const [idProof, setIdProof] = useState<UploadFile | null>(null);
  const [selfie, setSelfie] = useState<UploadFile | null>(null);
  const documentTypeLabel =
    documentTypeOptions.find((option) => option.value === documentType)
      ?.label ?? t('settings.kyc.select_document');

  const pickImage = useCallback(
    async (kind: 'id' | 'selfie') => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        showError({
          title: t('settings.kyc.permission_required_title'),
          message: t('settings.kyc.permission_required_message'),
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName ?? `${kind}-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      };

      if (kind === 'id') setIdProof(file);
      else setSelfie(file);
    },
    [t]
  );

  const submit = useCallback(async () => {
    if (!idProof || !selfie) {
      showError({
        title: t('settings.kyc.documents_required_title'),
        message: t('settings.kyc.documents_required_message'),
      });
      return;
    }

    try {
      const response = await submitKyc({
        idProof,
        selfie,
        documentType,
      }).unwrap();
      if (response.success) {
        showSuccess({ title: t('settings.kyc.submitted_title') });
        setIdProof(null);
        setSelfie(null);
        void refetch();
      }
    } catch {
      showError({
        title: t('settings.kyc.submission_failed_title'),
        message: t('common.try_again_message'),
      });
    }
  }, [documentType, idProof, refetch, selfie, submitKyc, t]);

  const startEkyc = useCallback(
    async (provider: 'aadhaar' | 'digilocker') => {
      try {
        const response = await initiateEkyc({ provider }).unwrap();
        if (response.success) {
          showSuccess({
            title: t('settings.kyc.started_title'),
            message: t('settings.kyc.started_message'),
          });
          void refetch();
        }
      } catch {
        showError({
          title: t('settings.kyc.failed_title'),
          message: t('common.try_again_message'),
        });
      }
    },
    [initiateEkyc, refetch, t]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  const status = data.data?.status ?? 'not_started';

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.kyc.title')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="check-circle"
          title={t('settings.kyc.status_title')}
          subtitle={t('settings.kyc.status_subtitle')}
        >
          <View style={local.statusBox}>
            <Text style={local.status}>{status.replace(/_/g, ' ')}</Text>
            {data.data?.rejectionReason ? (
              <Text style={local.help}>{data.data.rejectionReason}</Text>
            ) : null}
          </View>
        </SettingsCard>

        <SettingsCard
          icon="upload"
          title={t('settings.kyc.manual_review_title')}
          subtitle={t('settings.kyc.manual_review_subtitle')}
        >
          <SettingsSelectItem
            icon="credit-card"
            label={t('settings.kyc.document_type')}
            value={documentTypeLabel}
            sublabel={t('settings.kyc.document_type_sub')}
            onPress={() => setDocumentTypeOpen(true)}
          />
          <SettingsSelectItem
            icon="file"
            label={t('settings.kyc.upload_id')}
            {...(idProof ? { value: t('common.selected') } : {})}
            onPress={() => void pickImage('id')}
          />
          <SettingsSelectItem
            icon="camera"
            label={t('settings.kyc.upload_selfie')}
            {...(selfie ? { value: t('common.selected') } : {})}
            onPress={() => void pickImage('selfie')}
          />
          <SettingsSelectItem
            icon="send"
            label={
              isSubmitting
                ? t('settings.kyc.submitting')
                : t('settings.kyc.submit_for_review')
            }
            onPress={submit}
            isLast
          />
        </SettingsCard>

        <SettingsCard
          icon="shield"
          title={t('settings.kyc.ekyc_title')}
          subtitle={t('settings.kyc.ekyc_subtitle')}
        >
          <SettingsSelectItem
            icon="credit-card"
            label={t('settings.kyc.start_aadhaar')}
            sublabel={t('settings.kyc.requires_provider')}
            onPress={() => void startEkyc('aadhaar')}
          />
          <SettingsSelectItem
            icon="archive"
            label={t('settings.kyc.start_digilocker')}
            sublabel={t('settings.kyc.requires_provider')}
            onPress={() => void startEkyc('digilocker')}
            isLast
          />
        </SettingsCard>
      </ScrollView>

      <SettingsOptionSheet
        visible={documentTypeOpen}
        title={t('settings.kyc.document_type')}
        options={documentTypeOptions}
        selectedValue={documentType}
        onSelect={setDocumentType}
        onClose={() => setDocumentTypeOpen(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    statusBox: { padding: 14 },
    status: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
      textTransform: 'capitalize',
    },
    help: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 6,
    },
  });
