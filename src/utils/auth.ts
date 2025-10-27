import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { jwtDecode } from "jwt-decode";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRESQL_ADDON_URI,
});

export const auth = betterAuth({
  database: pool,
  basePath: "/api/better-auth",
  plugins: [
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
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  advanced: {
    database: {
      useNumberId: true,
    },
  },
});
