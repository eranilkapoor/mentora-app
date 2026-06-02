import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'driving_licence'
  | 'voter_id';

const DOCUMENT_TYPE_OPTIONS: SettingsOption<KycDocumentType>[] = [
  {
    value: 'aadhaar',
    label: 'Aadhaar Card',
    description: 'Preferred identity proof for Indian profiles',
  },
  {
    value: 'pan',
    label: 'PAN Card',
    description: 'Government-issued photo identity proof',
  },
  {
    value: 'passport',
    label: 'Passport',
    description: 'Valid passport identity page',
  },
  {
    value: 'driving_licence',
    label: 'Driving Licence',
    description: 'Valid driving licence with photo',
  },
  {
    value: 'voter_id',
    label: 'Voter ID',
    description: 'Election photo identity card',
  },
];

export default function KycVerificationScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { theme } = useTheme();
  const local = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, refetch } = useGetKycStatusQuery();
  const [submitKyc, { isLoading: isSubmitting }] = useSubmitKycMutation();
  const [initiateEkyc] = useInitiateEkycMutation();
  const [documentType, setDocumentType] = useState<KycDocumentType>('aadhaar');
  const [documentTypeOpen, setDocumentTypeOpen] = useState(false);
  const [idProof, setIdProof] = useState<UploadFile | null>(null);
  const [selfie, setSelfie] = useState<UploadFile | null>(null);
  const documentTypeLabel =
    DOCUMENT_TYPE_OPTIONS.find((option) => option.value === documentType)
      ?.label ?? 'Select document';

  const pickImage = useCallback(async (kind: 'id' | 'selfie') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      showError({
        title: 'Permission required',
        message: 'Allow photo access to upload verification documents.',
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
  }, []);

  const submit = useCallback(async () => {
    if (!idProof || !selfie) {
      showError({
        title: 'Documents required',
        message: 'Upload both ID proof and selfie.',
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
        showSuccess({ title: 'Verification submitted' });
        setIdProof(null);
        setSelfie(null);
        void refetch();
      }
    } catch {
      showError({ title: 'Submission failed', message: 'Please try again.' });
    }
  }, [documentType, idProof, refetch, selfie, submitKyc]);

  const startEkyc = useCallback(
    async (provider: 'aadhaar' | 'digilocker') => {
      try {
        const response = await initiateEkyc({ provider }).unwrap();
        if (response.success) {
          showSuccess({
            title: 'Verification started',
            message: 'Provider integration is ready for production keys.',
          });
          void refetch();
        }
      } catch {
        showError({
          title: 'Verification failed',
          message: 'Please try again.',
        });
      }
    },
    [initiateEkyc, refetch]
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
        title="Profile verification"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="check-circle"
          title="Verification status"
          subtitle="Approved KYC unlocks the verified profile badge"
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
          title="Manual document review"
          subtitle="Upload ID proof and a clear selfie for review"
        >
          <SettingsSelectItem
            icon="credit-card"
            label="Document type"
            value={documentTypeLabel}
            sublabel="Choose the ID document you are uploading"
            onPress={() => setDocumentTypeOpen(true)}
          />
          <SettingsSelectItem
            icon="file"
            label="Upload ID proof"
            {...(idProof ? { value: 'Selected' } : {})}
            onPress={() => void pickImage('id')}
          />
          <SettingsSelectItem
            icon="camera"
            label="Upload selfie"
            {...(selfie ? { value: 'Selected' } : {})}
            onPress={() => void pickImage('selfie')}
          />
          <SettingsSelectItem
            icon="send"
            label={isSubmitting ? 'Submitting...' : 'Submit for review'}
            onPress={submit}
            isLast
          />
        </SettingsCard>

        <SettingsCard
          icon="shield"
          title="Aadhaar / DigiLocker eKYC"
          subtitle="Provider-ready flow for high-trust verification"
        >
          <SettingsSelectItem
            icon="credit-card"
            label="Start Aadhaar eKYC"
            sublabel="Requires production provider credentials"
            onPress={() => void startEkyc('aadhaar')}
          />
          <SettingsSelectItem
            icon="archive"
            label="Start DigiLocker eKYC"
            sublabel="Requires production provider credentials"
            onPress={() => void startEkyc('digilocker')}
            isLast
          />
        </SettingsCard>
      </ScrollView>

      <SettingsOptionSheet
        visible={documentTypeOpen}
        title="Document type"
        options={DOCUMENT_TYPE_OPTIONS}
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
