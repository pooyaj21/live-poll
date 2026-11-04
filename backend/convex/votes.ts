import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

async function findVote(
  ctx: QueryCtx,
  pollId: Id<"polls">,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("votes")
    .withIndex("by_pollId_and_userId", (q) =>
      q.eq("pollId", pollId).eq("userId", userId),
    )
    .unique();
}

export const cast = mutation({
  args: {
    pollId: v.id("polls"),
    option: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Not signed in");
    }

    const poll = await ctx.db.get("polls", args.pollId);
    if (poll === null) {
      throw new ConvexError("Poll not found");
    }
    if (!poll.options.includes(args.option)) {
      throw new ConvexError("That option is not on this poll");
    }

    const existing = await findVote(ctx, args.pollId, userId);
    if (existing !== null) {
      if (existing.option !== args.option) {
        await ctx.db.patch("votes", existing._id, { option: args.option });
      }
      return existing._id;
    }

    return await ctx.db.insert("votes", {
      pollId: args.pollId,
      option: args.option,
      userId,
    });
  },
});

export const myVote = query({
  args: {
    pollId: v.id("polls"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const vote = await findVote(ctx, args.pollId, userId);
    return vote?.option ?? null;
  },
});

export const results = query({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get("polls", args.pollId);
    if (poll === null) {
      return null;
    }

    const counts = new Map(poll.options.map((option) => [option, 0]));
    const votes = ctx.db
      .query("votes")
      .withIndex("by_pollId_and_userId", (q) => q.eq("pollId", args.pollId));
    for await (const vote of votes) {
      counts.set(vote.option, (counts.get(vote.option) ?? 0) + 1);
    }

    return poll.options.map((option) => ({
      option,
      count: counts.get(option) ?? 0,
    }));
  },
});
