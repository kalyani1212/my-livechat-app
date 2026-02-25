import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.string(),
    externalId: v.string(), 
  }).index("by_externalId", ["externalId"]),

  messages: defineTable({
    body: v.string(),
    author: v.string(),
  }),
});