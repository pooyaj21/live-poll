import { useMutation } from 'convex/react';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/backend';
import { errorMessage } from '@/lib/errors';

const MAX_NAME_LENGTH = 50;

/**
 * Shown once, until the user has a name. When `users.me` reports a name, the root layout's
 * protected-route guard removes this screen and the app takes over, so there is no navigation here.
 */
export default function NameScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const setName = useMutation(api.users.setName);

  const [name, setNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (trimmed === '') {
      setError("Name can't be empty");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await setName({ name: trimmed });
    } catch (e) {
      setError(errorMessage(e));
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <ThemedView style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
          <ThemedText type="subtitle">What&apos;s your name?</ThemedText>
          <ThemedText themeColor="textSecondary">
            It&apos;s shown next to the polls you create.
          </ThemedText>

          <TextInput
            value={name}
            onChangeText={setNameInput}
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            maxLength={MAX_NAME_LENGTH}
            autoCapitalize="words"
            autoComplete="name"
            autoCorrect={false}
            returnKeyType="done"
            editable={!submitting}
            onSubmitEditing={submit}
          />

          {error ? (
            <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
              {error}
            </ThemedText>
          ) : null}

          <Button title="Continue" loading={submitting} onPress={submit} />
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  input: {
    minHeight: 48,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
