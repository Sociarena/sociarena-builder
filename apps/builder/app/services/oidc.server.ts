import * as client from "openid-client";
import env from "~/env/env.server";

const getRedirectUri = (): string => {
  if (!env.OIDC_REDIRECT_URI) {
    throw new Error("Missing OIDC_REDIRECT_URI configuration");
  }
  return env.OIDC_REDIRECT_URI;
};

let cachedConfig: client.Configuration | null = null;

export interface OIDCProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

/**
 * Get or create the OIDC configuration for Infomaniak
 */
export const getOIDCConfig = async (): Promise<client.Configuration> => {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (!env.OIDC_ISSUER || !env.OIDC_CLIENT_ID || !env.OIDC_CLIENT_SECRET) {
    throw new Error(
      "Missing OIDC configuration. Please set OIDC_ISSUER, OIDC_CLIENT_ID, and OIDC_CLIENT_SECRET"
    );
  }

  try {
    cachedConfig = await client.discovery(
      new URL(env.OIDC_ISSUER),
      env.OIDC_CLIENT_ID,
      env.OIDC_CLIENT_SECRET
    );

    return cachedConfig;
  } catch (error) {
    console.error("Failed to initialize OIDC configuration:", error);
    throw new Error("Failed to initialize OIDC configuration");
  }
};

/**
 * Generate authorization URL for OIDC login
 */
export const getAuthorizationUrl = async (
  state: string,
  nonce: string,
  codeVerifier: string
): Promise<string> => {
  const config = await getOIDCConfig();

  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const scopes = env.OIDC_SCOPES || "openid profile email";

  const parameters: Record<string, string> = {
    redirect_uri: env.OIDC_REDIRECT_URI || "",
    scope: scopes,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  };

  const authUrl = client.buildAuthorizationUrl(config, parameters);

  return authUrl.href;
};

/**
 * Exchange authorization code for tokens and get user profile
 */
export const handleCallback = async (
  callbackUrl: string,
  state: string,
  nonce: string,
  codeVerifier: string
): Promise<OIDCProfile> => {
  const config = await getOIDCConfig();

  const currentUrl = new URL(callbackUrl);

  // authorizationCodeGrant validates the response and exchanges the code for tokens
  const tokens = await client.authorizationCodeGrant(
    config,
    currentUrl,
    {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState: state,
      idTokenExpected: true,
    },
    {
      // redirect_uri is required for the token exchange
      redirectUri: getRedirectUri(),
    }
  );

  // Get ID token claims
  const claims = tokens.claims();

  if (!claims) {
    throw new Error("No ID token claims received from OIDC provider");
  }

  // Get userinfo for additional profile data
  let userinfo: client.UserInfoResponse | undefined;
  try {
    if (tokens.access_token) {
      userinfo = await client.fetchUserInfo(
        config,
        tokens.access_token,
        claims.sub
      );
    }
  } catch (error) {
    console.warn("Failed to fetch userinfo, using claims only:", error);
  }

  return {
    sub: claims.sub,
    email: (userinfo?.email || claims.email) as string,
    name: (userinfo?.name || claims.name) as string | undefined,
    picture: (userinfo?.picture || claims.picture) as string | undefined,
    email_verified: (userinfo?.email_verified || claims.email_verified) as
      | boolean
      | undefined,
  };
};
