import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import * as db from "~/shared/db";
import { sessionStorage } from "~/services/session.server";
import { AUTH_PROVIDERS } from "~/shared/session";
import { isBuilder } from "~/shared/router-utils";
import { getUserById } from "~/shared/db/user.server";
import env from "~/env/env.server";
import { builderAuthenticator } from "./builder-auth.server";
import type { SessionData } from "./auth.server.utils";
import { createContext } from "~/shared/context.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<SessionData>(sessionStorage, {
  throwOnError: true,
});

// Dev login strategy for development
if (env.DEV_LOGIN === "true") {
  authenticator.use(
    new FormStrategy(async ({ form, request }) => {
      const secretValue = form.get("secret");

      if (secretValue == null) {
        throw new Error("Secret is required");
      }

      const [secret, email = "hello@webstudio.is"] = secretValue
        .toString()
        .split(":");

      if (secret === env.AUTH_SECRET) {
        try {
          const context = await createContext(request);

          const user = await db.user.createOrLoginWithDev(context, email);
          return {
            userId: user.id,
            createdAt: Date.now(),
          };
        } catch (error) {
          if (error instanceof Error) {
            console.error({
              error,
              extras: {
                loginMethod: AUTH_PROVIDERS.LOGIN_DEV,
              },
            });
          }
          throw error;
        }
      }

      throw new Error("Secret is incorrect");
    }),
    "dev"
  );
}

export const findAuthenticatedUser = async (request: Request) => {
  const user = isBuilder(request)
    ? await builderAuthenticator.isAuthenticated(request)
    : await authenticator.isAuthenticated(request);

  if (user == null) {
    return null;
  }
  const context = await createContext(request);

  try {
    return await getUserById(context, user.userId);
  } catch (error) {
    return null;
  }
};
