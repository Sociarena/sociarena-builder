import { useEffect, useState } from "react";
import { useSearchParams } from "@remix-run/react";

export const AUTH_PROVIDERS = {
  LOGIN_DEV: "login_dev",
  LOGIN_INFOMANIAK: "login_infomaniak",
} as const;

export const LOGIN_ERROR_MESSAGES = {
  [AUTH_PROVIDERS.LOGIN_DEV]: "There has been an issue logging you in with dev",
  [AUTH_PROVIDERS.LOGIN_INFOMANIAK]:
    "There has been an issue logging you in with Infomaniak",
};

export const useLoginErrorMessage = (): string => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageToReturn, setMessageToReturn] = useState("");

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    const hasMessageToShow =
      error !== null && message != null && message !== "";

    if (hasMessageToShow) {
      console.error({ message });
      setMessageToReturn(message);

      setSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams);
        nextSearchParams.delete("error");
        nextSearchParams.delete("message");
        return nextSearchParams;
      });
      return;
    }

    switch (error) {
      case AUTH_PROVIDERS.LOGIN_DEV:
        setMessageToReturn(LOGIN_ERROR_MESSAGES[AUTH_PROVIDERS.LOGIN_DEV]);
        break;
      case AUTH_PROVIDERS.LOGIN_INFOMANIAK:
        setMessageToReturn(
          LOGIN_ERROR_MESSAGES[AUTH_PROVIDERS.LOGIN_INFOMANIAK]
        );
        break;

      default:
        break;
    }
  }, [searchParams, setSearchParams]);

  return messageToReturn;
};
