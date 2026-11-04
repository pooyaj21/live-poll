import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  polls: defineTable({
    question: v.string(),
    options: v.array(v.string()),
  }),

  votes: defineTable({
    pollId: v.id("polls"),
    option: v.string(),
    deviceId: v.string(),
  }).index("by_pollId_and_deviceId", ["pollId", "deviceId"]),
});
