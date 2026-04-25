import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

// Typed ref so navigate/reset calls outside React tree are type-safe
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
