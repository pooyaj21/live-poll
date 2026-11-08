import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  polls: defineTable({
    question: v.string(),
    options: v.array(v.string()),
    // Optional: polls created before sign-in existed have no creator.
    createdBy: v.optional(v.id("users")),
  }),

  votes: defineTable({
    pollId: v.id("polls"),
    option: v.string(),
    userId: v.id("users"),
  }).index("by_pollId_and_userId", ["pollId", "userId"]),
});
