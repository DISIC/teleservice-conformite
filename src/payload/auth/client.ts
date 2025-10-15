import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  basePath: "/api/better-auth",
  plugins: [genericOAuthClient()],
});

export type Session = typeof authClient.$Infer.Session;
