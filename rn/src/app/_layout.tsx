import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient, useConvexAuth, useQuery } from 'convex/react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, useColorScheme } from 'react-native';

import { AnonymousSignIn } from '@/components/anonymous-sign-in';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/backend';
import { secureStorage } from '@/lib/secure-storage';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  // Not meaningful outside the browser.
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ConvexAuthProvider
      client={convex}
      // expo-secure-store has no web implementation; fall back to the default localStorage there.
      storage={Platform.OS === 'web' ? undefined : secureStorage}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnonymousSignIn />
        <Routes />
      </ThemeProvider>
    </ConvexAuthProvider>
  );
}

function Routes() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me, isAuthenticated ? {} : 'skip');

  // Until we know whether this user has a name, render no navigator at all. That avoids flashing
  // the wrong screen. This also covers the moment between launch and the anonymous sign-in.
  if (isLoading || !isAuthenticated || me === undefined) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const hasName = me?.name != null;

  return (
    <Stack
      screenOptions={{
        // On iOS 26+ the header is transparent by default and floats over the screen, so content
        // starts under it. An opaque header is laid out above the content instead.
        headerTransparent: false,
      }}>
      <Stack.Protected guard={!hasName}>
        <Stack.Screen name="name" options={{ title: 'Welcome' }} />
      </Stack.Protected>
      <Stack.Protected guard={hasName}>
        <Stack.Screen name="index" options={{ title: 'Live polls' }} />
        <Stack.Screen name="create" options={{ title: 'New poll' }} />
        <Stack.Screen name="poll/[id]" options={{ title: 'Poll' }} />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
