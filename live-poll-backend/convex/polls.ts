import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireNamedUser } from "./lib/auth";

/** Display name of a poll's creator, or null for old polls / users without a name. */
async function creatorNameOf(
  ctx: QueryCtx,
  createdBy: Id<"users"> | undefined,
): Promise<string | null> {
  if (createdBy === undefined) {
    return null;
  }
  const user = await ctx.db.get("users", createdBy);
  return user?.name ?? null;
}

export const create = mutation({
  args: {
    question: v.string(),
    options: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireNamedUser(ctx);

    const question = args.question.trim();
    const options = args.options.map((option) => option.trim());

    if (question === "") {
      throw new ConvexError("Question can't be empty");
    }
    if (options.length < 2) {
      throw new ConvexError("A poll needs at least 2 options");
    }
    if (options.some((option) => option.trim() === "")) {
      throw new ConvexError("Options can't be empty");
    }
    if (new Set(options).size !== options.length) {
      throw new ConvexError("Options must be different from each other");
    }

    return await ctx.db.insert("polls", { question, options, createdBy: userId });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const polls = await ctx.db.query("polls").order("desc").take(50);

    // At most 50 polls, so at most 50 user reads; look each creator up once.
    const names = new Map<Id<"users">, string | null>();
    const result: Array<Doc<"polls"> & { creatorName: string | null }> = [];
    for (const poll of polls) {
      let creatorName: string | null = null;
      if (poll.createdBy !== undefined) {
        const cached = names.get(poll.createdBy);
        if (cached !== undefined) {
          creatorName = cached;
        } else {
          creatorName = await creatorNameOf(ctx, poll.createdBy);
          names.set(poll.createdBy, creatorName);
        }
      }
      result.push({ ...poll, creatorName });
    }
    return result;
  },
});

export const get = query({
  args: { id: v.id("polls") },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get("polls", args.id);
    if (poll === null) {
      return null;
    }
    return { ...poll, creatorName: await creatorNameOf(ctx, poll.createdBy) };
  },
});
