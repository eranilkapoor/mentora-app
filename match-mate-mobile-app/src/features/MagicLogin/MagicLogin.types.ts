import { AuthNavigationProp } from '@/navigation/types';

export interface MagicLoginScreenProps {
  navigation: AuthNavigationProp;
  route: { params?: { token?: string } };
}
