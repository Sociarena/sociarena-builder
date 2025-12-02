import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Button,
  Flex,
  globalCss,
  rawTheme,
  Text,
  theme,
} from "@webstudio-is/design-system";
import { WebstudioIcon } from "@webstudio-is/icons";
import { Form } from "@remix-run/react";
import { authPath } from "~/shared/router-utils";
import { SecretLogin } from "./secret-login";

const globalStyles = globalCss({
  body: {
    margin: 0,
    overflow: "hidden",
  },
});

// Simple Infomaniak icon component
const InfomaniakIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    id="Infomaniak--Streamline-Simple-Icons"
    height="24"
    width="24"
  >
    <path
      d="M2.4 0A2.395 2.395 0 0 0 0 2.4v19.2C0 22.9296 1.0704 24 2.4 24h19.2c1.3296 0 2.4 -1.0704 2.4 -2.4V2.4C24 1.0704 22.9296 0 21.6 0H10.112v11.7119l3.648 -4.128h6l-4.58 4.3506 4.868 8.1296h-5.52l-2.5938 -5.0211L10.112 16.8v3.264H5.12V0Z"
      fill="#ffffff"
      stroke-width="1"
    ></path>
  </svg>
);

export type LoginProps = {
  errorMessage?: string;
  isInfomaniakEnabled?: boolean;
  isSecretLoginEnabled?: boolean;
};

export const Login = ({
  errorMessage,
  isInfomaniakEnabled = true,
  isSecretLoginEnabled,
}: LoginProps) => {
  globalStyles();
  return (
    <Flex
      align="center"
      justify="center"
      css={{
        height: "100vh",
        background: theme.colors.brandBackgroundDashboard,
      }}
    >
      <Flex
        direction="column"
        align="center"
        gap="6"
        css={{
          width: theme.spacing[35],
          minWidth: theme.spacing[20],
          padding: theme.spacing[17],
          borderRadius: theme.spacing[5],
          [`@media (min-width: ${rawTheme.spacing[35]})`]: {
            backgroundColor: `rgba(255, 255, 255, 0.5)`,
          },
        }}
      >
        <WebstudioIcon size={48} />
        <Text variant="brandSectionTitle" as="h1" align="center">
          Welcome to Webstudio
        </Text>

        <TooltipProvider>
          <Flex direction="column" gap="3" css={{ width: "100%" }}>
            <Form method="post" style={{ display: "contents" }}>
              <Button
                disabled={isInfomaniakEnabled === false}
                prefix={<InfomaniakIcon />}
                color="primary"
                css={{ height: theme.spacing[15] }}
                formAction={authPath({ provider: "infomaniak" })}
              >
                Sign in with Infomaniak
              </Button>
            </Form>
            {isSecretLoginEnabled && <SecretLogin />}
          </Flex>
        </TooltipProvider>
        {errorMessage ? (
          <Text align="center" color="destructive">
            {errorMessage}
          </Text>
        ) : null}
      </Flex>
    </Flex>
  );
};
