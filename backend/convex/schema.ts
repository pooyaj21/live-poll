import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  polls: defineTable({
    question: v.string(),
    options: v.array(v.string()),
  }),

  votes: defineTable({
    pollId: v.id("polls"),
    option: v.string(),
    userId: v.id("users"),
  }).index("by_pollId_and_userId", ["pollId", "userId"]),
});
