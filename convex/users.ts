import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allUsers = await ctx.db.query("users").collect();
    
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
    if (!identity) {
      console.log("No identity found in storeUser");
      return null;
    }

    // Check if user already exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (user !== null) {
        // If the existing user has empty fields, update them
        if (user.name === "" && identity.name) {
            await ctx.db.patch(user._id, { 
                name: identity.name,
                email: identity.email ?? "",
                image: identity.pictureUrl ?? "" 
            });
        }
        return user._id;
    }

    // Create new user with actual data from Clerk identity
    return await ctx.db.insert("users", {
      name: identity.name || identity.nickname || "Anonymous User",
      email: identity.email ?? "",
      image: identity.pictureUrl ?? "",
      externalId: identity.subject,
    });
  },
});