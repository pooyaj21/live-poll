import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/backend';
import { errorMessage } from '@/lib/errors';

const MIN_OPTIONS = 2;

/** Mirrors the checks in backend `polls.create`. Returns an error message or null. */
function validate(question: string, options: string[]): string | null {
  const trimmedOptions = options.map((option) => option.trim());
  if (question.trim() === '') return "Question can't be empty";
  if (trimmedOptions.length < MIN_OPTIONS) return 'A poll needs at least 2 options';
  if (trimmedOptions.some((option) => option === '')) return "Options can't be empty";
  if (new Set(trimmedOptions).size !== trimmedOptions.length) {
    return 'Options must be different from each other';
  }
  return null;
}

export default function CreatePollScreen() {
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const createPoll = useMutation(api.polls.create);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((option, i) => (i === index ? value : option)));
  }

  async function submit() {
    const problem = validate(question, options);
    setError(problem);
    if (problem) return;

    setSubmitting(true);
    try {
      const id = await createPoll({
        question: question.trim(),
        options: options.map((option) => option.trim()),
      });
      router.replace({ pathname: '/poll/[id]', params: { id } });
    } catch (e) {
      setError(errorMessage(e));
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
      style={styles.flex}>
      <ThemedView style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + Spacing.four },
          ]}>
          <ThemedText type="smallBold">Question</ThemedText>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="What do you want to ask?"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            multiline
            editable={!submitting}
          />

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Options
          </ThemedText>
          {options.map((option, index) => (
            <ThemedView key={index} style={styles.optionRow}>
              <TextInput
                value={option}
                onChangeText={(value) => updateOption(index, value)}
                placeholder={`Option ${index + 1}`}
                placeholderTextColor={theme.textSecondary}
                style={[inputStyle, styles.optionInput]}
                editable={!submitting}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove option ${index + 1}`}
                disabled={options.length <= MIN_OPTIONS || submitting}
                onPress={() => setOptions((current) => current.filter((_, i) => i !== index))}
                style={[styles.removeButton, options.length <= MIN_OPTIONS && styles.disabled]}>
                <ThemedText themeColor="textSecondary">✕</ThemedText>
              </Pressable>
            </ThemedView>
          ))}

          <Button
            title="Add option"
            variant="secondary"
            disabled={submitting}
            onPress={() => setOptions((current) => [...current, ''])}
          />

          {error ? (
            <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
              {error}
            </ThemedText>
          ) : null}

          <Button title="Create poll" loading={submitting} onPress={submit} />
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  sectionLabel: { marginTop: Spacing.two },
  input: {
    minHeight: 48,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  optionInput: { flex: 1 },
  removeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.3 },
});
