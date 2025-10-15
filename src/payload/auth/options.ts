import type {
  BetterAuthOptions,
  BetterAuthPluginOptions,
} from "payload-auth/better-auth";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { jwtDecode } from "jwt-decode";

export const betterAuthPlugins = [
  nextCookies(),
  genericOAuth({
    config: [
      {
        providerId: "proconnect",
        clientId: process.env.PROCONNECT_CLIENT_ID as string,
        clientSecret: process.env.PROCONNECT_CLIENT_SECRET as string,
        scopes: ["openid", "email", "given_name", "usual_name", "siret"],
        redirectURI: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/better-auth/callback/proconnect`,
        discoveryUrl: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/.well-known/openid-configuration`,
        pkce: true,
        authorizationUrlParams: {
          nonce: "some_random_nonce",
        },
        getUserInfo: async (tokens) => {
          const res = await fetch(
            `https://${process.env.PROCONNECT_DOMAIN}/api/v2/userinfo`,
            {
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
            }
          );

          const responseText = await res.text();

          let data: Record<string, string | number> = {};

          try {
            data = JSON.parse(responseText);
          } catch (_) {
            data =
              (jwtDecode(responseText) as Record<string, string | number>) ||
              {};
          }

          if (
            typeof data.sub === "string" &&
            typeof data.given_name === "string" &&
            typeof data.email === "string"
          ) {
            return {
              id: data.sub,
              name: data.given_name,
              email: data.email,
              emailVerified: true,
              createdAt: data.created_at
                ? new Date(data.created_at)
                : new Date(),
              updatedAt: data.updated_at
                ? new Date(data.updated_at)
                : new Date(),
            };
          }
          return null;
        },
      },
    ],
  }),
];

export type BetterAuthPlugins = typeof betterAuthPlugins;

export const betterAuthOptions: BetterAuthOptions = {
  appName: "payload-better-auth",
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  basePath: "/api/better-auth",
  // biome-ignore lint/style/noNonNullAssertion: default env var
  trustedOrigins: [process.env.NEXT_PUBLIC_BETTER_AUTH_URL!],
  plugins: betterAuthPlugins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
        console.log(
          "Send change email verification for user: ",
          user,
          newEmail,
          url,
          token
        );
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        // Send delete account verification
      },
      beforeDelete: async (user) => {
        // Perform actions before user deletion
      },
      afterDelete: async (user) => {
        // Perform cleanup after user deletion
      },
    },
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
        returned: true,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["proconnect"],
    },
  },
};

export const betterAuthPluginOptions: BetterAuthPluginOptions = {
  debug: {
    logTables: false,
    enableDebugLogs: true,
  },
  // disableDefaultPayloadAuth: true,
  collectionAdminGroup: "Collections",
  users: {
    slug: "users",
    allowedFields: ["name"],
  },
  accounts: {
    slug: "accounts",
  },
  sessions: {
    slug: "sessions",
  },
  verifications: {
    slug: "verifications",
    hidden: true,
  },
  betterAuthOptions: betterAuthOptions,
};
