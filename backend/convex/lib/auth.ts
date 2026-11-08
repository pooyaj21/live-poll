import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { QueryCtx } from "../_generated/server";

/**
 * The signed-in user, who must also have set a display name.
 * Throws a ConvexError otherwise. Works in queries and mutations.
 */
export async function requireNamedUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError("Not signed in");
  }

  const user = await ctx.db.get("users", userId);
  if (user === null) {
    throw new ConvexError("Not signed in");
  }
  if (user.name === undefined || user.name.trim() === "") {
    throw new ConvexError("Set your name first");
  }

  return { userId, name: user.name };
}
