import { useQuery } from 'convex/react';
import { Link, router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { api } from '@/lib/backend';

export default function PollListScreen() {
  const polls = useQuery(api.polls.list, {});
  const me = useQuery(api.users.me, {});
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      {polls === undefined ? (
        <ThemedView style={styles.center}>
          <ActivityIndicator />
        </ThemedView>
      ) : (
        <FlatList
          data={polls}
          keyExtractor={(poll) => poll._id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            me?.name ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.greeting}>
                Hi, {me.name}
              </ThemedText>
            ) : undefined
          }
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          ListEmptyComponent={
            <ThemedView style={styles.center}>
              <ThemedText themeColor="textSecondary">No polls yet. Create the first one.</ThemedText>
            </ThemedView>
          }
          renderItem={({ item }) => (
            <Link href={{ pathname: '/poll/[id]', params: { id: item._id } }} asChild>
              <Pressable accessibilityRole="button">
                {({ pressed }) => (
                  <ThemedView
                    type="backgroundElement"
                    style={[styles.card, pressed && styles.pressed]}>
                    <ThemedText numberOfLines={2}>{item.question}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.options.length} options
                      {item.creatorName ? ` · by ${item.creatorName}` : ''}
                    </ThemedText>
                  </ThemedView>
                )}
              </Pressable>
            </Link>
          )}
        />
      )}
      <ThemedView style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        <Button title="New poll" onPress={() => router.push('/create')} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  list: {
    padding: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexGrow: 1,
  },
  greeting: { marginBottom: Spacing.two },
  separator: { height: Spacing.two },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  pressed: { opacity: 0.7 },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
