# 01 — Live poll · Backend

## Setup

Follow "Shared setup → Backend" in the [root README](../../README.md).

## Auth

Convex Auth with the **Anonymous** provider (`convex/auth.ts`, `convex/auth.config.ts`, routes in `convex/http.ts`). The app signs in anonymously on first launch and the session persists on the device, so a user keeps the same `userId` across launches. There is no device id: everything is tied to the signed-in user, read server-side with `getAuthUserId(ctx)`, never passed as an argument.

Anonymous users have no name. The app asks for one on first launch (`users.setName`). Writes that create content (`polls.create`, `votes.cast`) require a named user, enforced by `requireNamedUser` in `convex/lib/auth.ts`.

## Tables (`convex/schema.ts`)

`authTables` (including `users`) plus:

| Table | Fields | Indexes |
|---|---|---|
| `polls` | `question: string`, `options: string[]`, `createdBy?: Id<"users">` | none (default `by_creation_time`) |
| `votes` | `pollId: Id<"polls">`, `option: string`, `userId: Id<"users">` | `by_pollId_and_userId` (`pollId`, `userId`) |

- `createdBy` is optional because polls created before sign-in existed have no creator.
- Votes are row-per-vote. The `by_pollId_and_userId` index gives the "has this user voted on this poll?" lookup and bounds a poll's results scan to that poll's votes.

## Functions

| File | Function | Type | Args | What it does |
|---|---|---|---|---|
| `convex/users.ts` | `setName` | mutation | `name` | Requires sign-in. Trims the name; rejects empty or over 50 characters. Returns the stored name. |
| `convex/users.ts` | `me` | query | none | `null` when signed out, otherwise `{ name: string \| null }` (`name` is `null` until set). |
| `convex/polls.ts` | `create` | mutation | `question`, `options` | Requires a signed-in user with a name. Validates (non-empty question, 2+ non-empty, distinct options). Stores `createdBy`. Returns the poll id. |
| `convex/polls.ts` | `list` | query | none | Newest 50 polls, each as the poll document plus `creatorName: string \| null`. |
| `convex/polls.ts` | `get` | query | `id` | The poll document plus `creatorName: string \| null`, or `null` if it does not exist. |
| `convex/votes.ts` | `cast` | mutation | `pollId`, `option` | Requires a signed-in user with a name. One vote per user per poll: voting again for another option changes the vote, voting again for the same option is a no-op. Returns the vote id. |
| `convex/votes.ts` | `myVote` | query | `pollId` | The signed-in user's chosen option for this poll, or `null` (not voted or signed out). |
| `convex/votes.ts` | `results` | query | `pollId` | `{ option, count }[]` in poll option order, or `null` if the poll does not exist. |

`creatorName` is `null` for polls without `createdBy` and for creators without a name.

### Errors

All thrown as `ConvexError` with a string message the app shows as-is:

- `Not signed in`: `setName`, `polls.create`, `votes.cast`
- `Set your name first`: `polls.create`, `votes.cast` (signed in, no name yet)
- `Name can't be empty`, `Name must be 50 characters or less`: `users.setName`
- `Question can't be empty`, `A poll needs at least 2 options`, `Options can't be empty`, `Options must be different from each other`: `polls.create`
- `Poll not found`, `That option is not on this poll`: `votes.cast`

## Checklist

- [ ] Schema written and `npx convex dev` shows no errors
- [ ] All functions written with argument validators
- [ ] Tested each function from the dashboard (`npx convex dashboard` → Functions → Run)
- [ ] `cast` and `create` throw a clear error when not signed in or when no name is set
- [ ] `create` throws a clear error on invalid input

## Hints

- Throw with `throw new ConvexError("Not signed in")` and friends so the app gets a readable message.
- "Has this user voted?" needs a fast lookup → read about `.index(...)` and `.withIndex(...)`.
- Every query result is live. If `results` reads votes, it re-runs whenever a vote is added.
