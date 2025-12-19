import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { polar, checkout, portal } from "@polar-sh/better-auth";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { polarClient } from "./polar";

export const auth = betterAuth({
  // -----------------------------
  // DATABASE
  // -----------------------------
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  // -----------------------------
  // AUTH METHODS
  // -----------------------------
  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // -----------------------------
  // PLUGINS
  // -----------------------------
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,

      use: [
        checkout({
          authenticatedUsersOnly: true,
          successUrl: "/upgrade",
        }),
        portal(),
      ],
    }),
  ],
});
