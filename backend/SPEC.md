# 01 — Live poll · Backend

## Setup

Follow "Shared setup → Backend" in the [root README](../../README.md).

## Tables to design (`convex/schema.ts`)

You need to store:

- **Polls:** a question and its options
- **Votes:** which option was chosen, on which poll, by which device

⚠️ Counter-on-poll vs row-per-vote is **the puzzle**. Decide it yourself.

## Functions to write

| File | Function | Type | What it does |
|---|---|---|---|
| `convex/polls.ts` | `create` | mutation | Args: question, options. Validates (non-empty question, 2+ options). Returns the poll id. |
| `convex/polls.ts` | `list` | query | Newest polls first |
| `convex/polls.ts` | `get` | query | One poll by id |
| `convex/votes.ts` | `cast` | mutation | Args: pollId, option, deviceId. Rejects a second vote from the same device. |
| `convex/votes.ts` | `results` | query | Vote count per option for one poll |

## Checklist

- [ ] Schema written and `npx convex dev` shows no errors
- [ ] All 5 functions written with argument validators
- [ ] Tested each function from the dashboard (`npx convex dashboard` → Functions → Run)
- [ ] `cast` throws a clear error on double vote
- [ ] `create` throws a clear error on invalid input

## Hints

- Throw with `throw new ConvexError("Already voted")` so the app gets a readable message.
- "Has this device voted?" needs a fast lookup → read about `.index(...)` and `.withIndex(...)`.
- Every query result is live. If `results` reads votes, it re-runs whenever a vote is added.
