import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams, type ErrorBoundaryProps } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, type Id } from '@/lib/backend';
import { errorMessage } from '@/lib/errors';

// A malformed id (e.g. from a hand-edited deep link) makes the query throw during render.
export function ErrorBoundary(_: ErrorBoundaryProps) {
  return <PollNotFound />;
}

function PollNotFound() {
  return (
    <ThemedView style={styles.center}>
      <ThemedText type="subtitle">Poll not found</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.centerText}>
        It may have been removed, or the link is wrong.
      </ThemedText>
      <Button title="Back to polls" onPress={() => router.replace('/')} />
    </ThemedView>
  );
}

export default function PollScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pollId = id as Id<'polls'>;
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { isAuthenticated } = useConvexAuth();
  const poll = useQuery(api.polls.get, { id: pollId });
  const results = useQuery(api.votes.results, { pollId });
  const myVote = useQuery(api.votes.myVote, { pollId });
  const castVote = useMutation(api.votes.cast);

  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  if (poll === undefined) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }
  if (poll === null) {
    return <PollNotFound />;
  }

  const counts = new Map((results ?? []).map((r) => [r.option, r.count]));
  const total = (results ?? []).reduce((sum, r) => sum + r.count, 0);

  async function vote(option: string) {
    if (option === myVote || voting) return;
    setError(null);
    setVoting(true);
    try {
      await castVote({ pollId, option });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setVoting(false);
    }
  }

  async function share() {
    if (!poll) return;
    const url = Linking.createURL(`poll/${pollId}`);
    try {
      await Share.share({ message: `${poll.question}\n${url}` });
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <ThemedView style={styles.flex}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
        <ThemedText type="subtitle">{poll.question}</ThemedText>
        {poll.creatorName ? (
          <ThemedText type="small" themeColor="textSecondary">
            by {poll.creatorName}
          </ThemedText>
        ) : null}

        {poll.options.map((option) => {
          const count = counts.get(option) ?? 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const selected = option === myVote;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: !isAuthenticated || voting }}
              disabled={!isAuthenticated || voting}
              onPress={() => vote(option)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: selected ? theme.accent : 'transparent',
                },
                pressed && styles.pressed,
              ]}>
              <ThemedView
                style={[
                  styles.bar,
                  { width: `${percent}%`, backgroundColor: selected ? theme.accentSoft : theme.backgroundSelected },
                ]}
              />
              <ThemedView style={styles.optionRow}>
                <ThemedText style={styles.optionLabel}>
                  {selected ? '✓ ' : ''}
                  {option}
                </ThemedText>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {count} · {percent}%
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}

        <ThemedText type="small" themeColor="textSecondary">
          {total} {total === 1 ? 'vote' : 'votes'}
          {myVote ? ' · tap another option to change your vote' : ' · tap an option to vote'}
        </ThemedText>

        {error ? (
          <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
            {error}
          </ThemedText>
        ) : null}

        <Button title="Share" variant="secondary" onPress={share} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  centerText: { textAlign: 'center' },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  option: {
    minHeight: 52,
    borderRadius: Spacing.three,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  bar: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: 'transparent',
  },
  optionLabel: { flex: 1 },
});
