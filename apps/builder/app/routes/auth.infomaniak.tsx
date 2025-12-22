import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import { dashboardPath, isDashboard, loginPath } from "~/shared/router-utils";
import { AUTH_PROVIDERS } from "~/shared/session";
import { returnToCookie } from "~/services/cookie.server";
import { preventCrossOriginCookie } from "~/services/no-cross-origin-cookie";
import { redirect, setNoStoreToRedirect } from "~/services/no-store-redirect";
import { getAuthorizationUrl } from "~/services/oidc.server";
import { sessionStorage } from "~/services/session.server";
import * as client from "openid-client";
import env from "~/env/env.server";

/**
 * Get the main dashboard origin from OIDC_REDIRECT_URI
 * This is used to centralize OAuth flow on the main domain
 */
const getMainDashboardOrigin = (): string => {
  if (!env.OIDC_REDIRECT_URI) {
    throw new Error("Missing OIDC_REDIRECT_URI configuration");
  }
  return new URL(env.OIDC_REDIRECT_URI).origin;
};

export default function InfomaniakLogin() {
  return null;
}

/**
 * GET handler: Handles OAuth initiation
 * - From subdomains: redirects to main domain with returnTo
 * - From main domain with returnTo: initiates OAuth flow
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const mainOrigin = getMainDashboardOrigin();
  const currentOrigin = url.origin;

  // If we're on a subdomain, redirect to main domain
  if (currentOrigin !== mainOrigin) {
    const returnTo = url.searchParams.get("returnTo") ?? currentOrigin + "/";
    const mainAuthUrl = new URL("/auth/infomaniak", mainOrigin);
    mainAuthUrl.searchParams.set("returnTo", returnTo);
    return redirect(mainAuthUrl.toString());
  }

  // We're on the main domain - check if we have returnTo (redirected from subdomain or action)
  const returnTo = url.searchParams.get("returnTo");

  if (!returnTo) {
    // Direct GET access without returnTo - redirect to login page
    return redirect("/login");
  }

  // Initiate OAuth flow (same logic as action but via GET)
  try {
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    // Generate state and nonce for OIDC
    const state = client.randomState();
    const nonce = client.randomNonce();
    const codeVerifier = client.randomPKCECodeVerifier();

    // Store in session
    session.set("oidc:state", state);
    session.set("oidc:nonce", nonce);
    session.set("oidc:codeVerifier", codeVerifier);

    const authUrl = await getAuthorizationUrl(state, nonce, codeVerifier);

    const response = redirect(authUrl);

    // Set session cookie
    response.headers.append(
      "Set-Cookie",
      await sessionStorage.commitSession(session)
    );

    // Set return-to cookie
    response.headers.append(
      "Set-Cookie",
      await returnToCookie.serialize(returnTo)
    );

    return setNoStoreToRedirect(response);
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
        message: message,
      })
    );
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const mainOrigin = getMainDashboardOrigin();
  const currentOrigin = url.origin;

  // If request comes from a subdomain, redirect to main domain first
  if (currentOrigin !== mainOrigin) {
    const returnTo =
      url.searchParams.get("returnTo") ??
      request.headers.get("Referer") ??
      currentOrigin + "/";

    const mainAuthUrl = new URL("/auth/infomaniak", mainOrigin);
    mainAuthUrl.searchParams.set("returnTo", returnTo);

    return redirect(mainAuthUrl.toString());
  }

  if (false === isDashboard(request)) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  preventCrossOriginCookie(request);
  // CSRF token checks are not necessary for dashboard-only pages.
  // All POST requests from the builder or canvas app are safeguarded by preventCrossOriginCookie

  try {
    const returnTo = url.searchParams.get("returnTo") ?? dashboardPath();

    // Store returnTo in cookie
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    // Generate state and nonce for OIDC
    const state = client.randomState();
    const nonce = client.randomNonce();
    const codeVerifier = client.randomPKCECodeVerifier();

    // Store in session
    session.set("oidc:state", state);
    session.set("oidc:nonce", nonce);
    session.set("oidc:codeVerifier", codeVerifier);

    const authUrl = await getAuthorizationUrl(state, nonce, codeVerifier);

    const response = redirect(authUrl);

    // Set session cookie
    response.headers.append(
      "Set-Cookie",
      await sessionStorage.commitSession(session)
    );

    // Set return-to cookie
    response.headers.append(
      "Set-Cookie",
      await returnToCookie.serialize(returnTo)
    );

    return setNoStoreToRedirect(response);
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
        message: message,
      })
    );
  }
};
