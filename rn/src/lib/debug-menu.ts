import type { DebugPlugin } from '@pj21/debug-menu';
import { convexPlugin } from '@pj21/debug-menu/convex';
import { infoPlugin } from '@pj21/debug-menu/info';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const debugPlugins: DebugPlugin[] = [
  convexPlugin({ title: 'Network' }),
  infoPlugin({
    items: () => ({
      version: Constants.expoConfig?.version ?? 'unknown',
      platform: `${Platform.OS} ${Platform.Version}`,
      convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL ?? 'unset',
    }),
  }),
];
