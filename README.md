# 01 — Live poll

**Goal:** create a poll, share it with a deep link, watch votes update live on every device.

**Time:** about 2 hours

## Convex concepts you'll learn

- `convex/schema.ts`: defining tables
- `query` and `mutation`
- `useQuery` reactivity: UI updates without refetching
- Argument validators: `v.string()`, `v.id("polls")`, `v.array(...)`

## The puzzle

Do you store a vote **counter** on the poll, or **one row per vote**?

- Which design makes "one vote per device" possible?
- Two people vote at the same millisecond. Why doesn't Convex lose a vote? (Look up: Convex mutations are transactions.)

Decide before you code. Write your answer in "What I learned".

## Stretch goals

- One vote per device using a stored UUID (`expo-crypto` `randomUUID()` + `expo-secure-store`)
- Let a voter change their vote

## Done when

- [ ] Vote on simulator A → simulator B updates in under 1 second
- [ ] A deep link opens the poll screen directly
- [ ] The same device can't vote twice (server rejects it, not just the UI)
- [ ] Bad input (empty question, 1 option) is rejected by the server

## What I learned

-
-
-
