import { SettingsNavigationProp } from '@/navigation/types';

export interface CommunicationSettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export type CommunicationPermission =
  'all' | 'matches_only' | 'contacts_only' | 'no_one';

export interface CommunicationSettings {
  whoCanMessage: CommunicationPermission;

  whoCanCall: CommunicationPermission;

  showReadReceipts: boolean;

  showTypingIndicator: boolean;

  autoReplyEnabled: boolean;

  autoReplyMessage?: string;

  allowVoiceCalls: boolean;

  allowVideoCalls: boolean;
}

export interface CommunicationSettingsResponse {
  communication: CommunicationSettings;
}

export interface UpdateCommunicationSettingsPayload extends Partial<CommunicationSettings> {}
