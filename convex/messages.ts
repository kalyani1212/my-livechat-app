import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    // Orders messages so new ones appear at the bottom
    return await ctx.db.query("messages").order("desc").take(50);
  },
});

export const send = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, { body, author }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Use "by_externalId" and "externalId" to match your schema
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found in Convex. Ensure storeUser was called.");

    await ctx.db.insert("messages", { 
        body, 
        author, 
        userId: user._id 
    });
  },
});