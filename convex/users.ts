import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const allUsers = await ctx.db.query("users").collect();
    // Show other users, excluding yourself
    return allUsers.filter((user) => 
      user.externalId !== identity.subject && 
      (args.search ? user.name.toLowerCase().includes(args.search.toLowerCase()) : true)
    );
  },
});

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    // The name we will try to save
    const realName = identity.name || identity.nickname || identity.givenName || "New User";

    if (user !== null) {
      // If the row exists but name is empty, update it immediately
      if (user.name === "" || user.name === "Anonymous") {
        await ctx.db.patch(user._id, { 
          name: realName,
          email: identity.email ?? "",
          image: identity.pictureUrl ?? "" 
        });
      }
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: realName,
      email: identity.email ?? "",
      image: identity.pictureUrl ?? "",
      externalId: identity.subject,
    });
  },
});