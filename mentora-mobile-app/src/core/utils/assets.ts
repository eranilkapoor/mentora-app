import { Asset } from 'expo-asset';

type BundledAssetModule = Parameters<typeof Asset.fromModule>[0];

export const resolveBundledAssetUri = (
  assetModule: BundledAssetModule
): string => Asset.fromModule(assetModule).uri;
