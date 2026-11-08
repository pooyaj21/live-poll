# 01 — Live poll · React Native

## Setup

Follow "Shared setup → App" and "Connect the app" in the [root README](../../README.md).

## Packages

```bash
npx expo install expo-crypto expo-secure-store
```

Set the deep link scheme in `app.json`: `"scheme": "convexlab"`

## Screens

| File | What it does |
|---|---|
| `app/index.tsx` | List of polls (`useQuery(api.polls.list)`) in a `FlatList` + "New poll" button |
| `app/create.tsx` | Form: question + dynamic option inputs. Wrapped in `KeyboardAvoidingView`. Calls `polls.create`, then navigates to the poll. |
| `app/poll/[id].tsx` | Question, tap an option to vote, live result bars, "Share" button (`Share.share` with the deep link) |

## Checklist

- [ ] Provider set up, app connects (no red screen)
- [ ] Poll list renders and updates when you create a poll in the dashboard
- [ ] Create form works and validates
- [ ] Voting works; result bars update live
- [ ] Device id generated once and stored in secure store
- [ ] Server error ("Already voted") shown to the user nicely
- [ ] Loading state while `useQuery` returns `undefined`

## Mobile tests

- [ ] Two simulators open on the same poll; vote on one, watch the other
- [ ] Deep link on iOS simulator:
  - Expo Go: `xcrun simctl openurl booted "exp://127.0.0.1:8081/--/poll/<id>"`
  - Dev build: `xcrun simctl openurl booted "convexlab://poll/<id>"`
- [ ] Deep link on Android emulator: `adb shell am start -a android.intent.action.VIEW -d "convexlab://poll/<id>"` (dev build)
- [ ] Background the app 1 minute, vote from the other device, resume: are results current?
