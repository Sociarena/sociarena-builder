import { type LoaderFunctionArgs } from "@remix-run/server-runtime";
import { dashboardPath, isDashboard, loginPath } from "~/shared/router-utils";
import { clearReturnToCookie, returnToPath } from "~/services/cookie.server";
import { AUTH_PROVIDERS } from "~/shared/session";
import { preventCrossOriginCookie } from "~/services/no-cross-origin-cookie";
import { redirect, setNoStoreToRedirect } from "~/services/no-store-redirect";
import { allowedDestinations } from "~/services/destinations.server";
import { handleCallback } from "~/services/oidc.server";
import { sessionStorage } from "~/services/session.server";
import * as db from "~/shared/db";
import { createContext } from "~/shared/context.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (false === isDashboard(request)) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  preventCrossOriginCookie(request);
  allowedDestinations(request, ["document"]);
  // CSRF token checks are not necessary for dashboard-only pages.
  // All requests from the builder or canvas app are safeguarded either by preventCrossOriginCookie for fetch requests
  // or by allowedDestinations for iframe requests.

  const returnTo = (await returnToPath(request)) ?? dashboardPath();

  try {
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    const state = session.get("oidc:state");
    const nonce = session.get("oidc:nonce");
    const codeVerifier = session.get("oidc:codeVerifier");

    if (!state || !nonce || !codeVerifier) {
      throw new Error("Missing OIDC session data");
    }

    // Get user profile from Infomaniak
    const profile = await handleCallback(
      request.url,
      state,
      nonce,
      codeVerifier
    );

    // Create or login user
    const context = await createContext(request);

    // Transform OIDC profile to match OAuth profile structure
    const oauthProfile: import("~/shared/db/user.server").OAuthProfile = {
      provider: "infomaniak",
      displayName: profile.name || profile.email.split("@")[0],
      emails: [{ value: profile.email }],
      photos: profile.picture ? [{ value: profile.picture }] : [],
    };

    const user = await db.user.createOrLoginWithOAuth(context, oauthProfile);

    // Store user in session
    session.set("user", {
      userId: user.id,
      createdAt: Date.now(),
    });

    // Clean up OIDC session data
    session.unset("oidc:state");
    session.unset("oidc:nonce");
    session.unset("oidc:codeVerifier");

    const response = redirect(returnTo);
    response.headers.set(
      "Set-Cookie",
      await sessionStorage.commitSession(session)
    );

    return setNoStoreToRedirect(await clearReturnToCookie(request, response));
  } catch (error) {
    const message = error instanceof Error ? error?.message : "unknown error";

    console.error({
      error,
      extras: {
        loginMethod: AUTH_PROVIDERS.LOGIN_INFOMANIAK,
      },
    });

    return redirect(
      loginPath({
        error: AUTH_PROVIDERS.LOGIN_INFOMANIAK,
        message,
        returnTo,
      })
    );
  }
};
