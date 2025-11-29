import { type ActionFunctionArgs } from "@remix-run/server-runtime";
import { dashboardPath, isDashboard, loginPath } from "~/shared/router-utils";
import { AUTH_PROVIDERS } from "~/shared/session";
import { returnToCookie } from "~/services/cookie.server";
import { preventCrossOriginCookie } from "~/services/no-cross-origin-cookie";
import { redirect, setNoStoreToRedirect } from "~/services/no-store-redirect";
import { getAuthorizationUrl } from "~/services/oidc.server";
import { sessionStorage } from "~/services/session.server";
import * as client from "openid-client";

export default function InfomaniakLogin() {
  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  if (false === isDashboard(request)) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  preventCrossOriginCookie(request);
  // CSRF token checks are not necessary for dashboard-only pages.
  // All POST requests from the builder or canvas app are safeguarded by preventCrossOriginCookie

  try {
    const url = new URL(request.url);
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
