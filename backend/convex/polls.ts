import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    question: v.string(),
    options: v.array(v.string()),
  },
  handler: async (ctx, args) => {
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

    return await ctx.db.insert("polls", { question, options });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("polls").order("desc").take(50);
  },
});

export const get = query({
  args: { id: v.id("polls") },
  handler: async (ctx, args) => {
    return await ctx.db.get("polls", args.id);
  },
});
