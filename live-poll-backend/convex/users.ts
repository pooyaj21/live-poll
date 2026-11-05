import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Not signed in");
    }

    const name = args.name.trim();
    if (name === "") {
      throw new ConvexError("Name can't be empty");
    }
    if (name.length > 50) {
      throw new ConvexError("Name must be 50 characters or less");
    }

    await ctx.db.patch("users", userId, { name });
    return name;
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get("users", userId);
    if (user === null) {
      return null;
    }

    return { name: user.name ?? null };
  },
});
